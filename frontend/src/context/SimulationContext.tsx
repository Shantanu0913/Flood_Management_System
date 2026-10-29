import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Alert, SOSRequest, Resource, AIDecision, SimEnvironment, ChatLog, BlockedRoad, LiveTracking, Notification, Role } from '../types';

interface MapFocus {
  lat: number;
  lng: number;
  zoom: number;
}

interface SimulationContextType {
  simTime: number; 
  simStatus: 'Running' | 'Paused' | 'Ended';
  environment: SimEnvironment;
  alerts: Alert[];
  sosQueue: SOSRequest[];
  resources: Resource[];
  aiDecisions: AIDecision[];
  chatLogs: ChatLog[];
  blockedRoads: BlockedRoad[];
  liveTracking: LiveTracking[];
  notifications: Notification[];
  rescuedCount: number;
  mapFocus: MapFocus;
  focusMapOn: (lat: number, lng: number, zoom?: number) => void;
  toggleSimulation: () => void;
  dispatchResource: (resourceId: string, sosId: string) => void;
  addSOS: (sos: Omit<SOSRequest, 'id' | 'status' | 'assignedResourceId'>) => void;
  getTrackingInfo: (resourceId: string) => LiveTracking | undefined;
  sendNotification: (fromRole: Role, fromResourceId: string, toRole: Role, type: Notification['type'], message: string, lat: number, lng: number, sosId?: string) => void;
  acknowledgeNotification: (notifId: string) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ═══════════════════════════════════════════
// REALISTIC FLEET — Boats on WATER bodies, ground vehicles on ROADS
// ═══════════════════════════════════════════
const initialResources: Resource[] = [
  // GROUND VEHICLES — Stationed at real road-accessible locations
  { id: 'AMB-101', type: 'Ambulance', status: 'Idle', location: 'Sion Hospital', lat: 19.0363, lng: 72.8604 },
  { id: 'AMB-102', type: 'Ambulance', status: 'Idle', location: 'KEM Hospital Parel', lat: 19.0012, lng: 72.8416 },
  { id: 'FTR-201', type: 'Fire Truck', status: 'Idle', location: 'Dharavi Fire Station', lat: 19.0402, lng: 72.8553 },
  { id: 'FTR-202', type: 'Fire Truck', status: 'Idle', location: 'Kurla Fire Brigade', lat: 19.0730, lng: 72.8795 },
  { id: 'POL-501', type: 'Police Cruiser', status: 'Idle', location: 'Chembur Police Station', lat: 19.0531, lng: 72.9000 },
  { id: 'POL-502', type: 'Police Cruiser', status: 'Idle', location: 'Kurla West PS', lat: 19.0680, lng: 72.8720 },
  
  // AERIAL — Based at helipads/airfields (can go anywhere)
  { id: 'ACV-901', type: 'Evac Helicopter', status: 'Idle', location: 'Juhu Aerodrome', lat: 19.0968, lng: 72.8340 },
  { id: 'ACV-902', type: 'Evac Helicopter', status: 'Idle', location: 'Bandra Heli-hub', lat: 19.0596, lng: 72.8295 },
  { id: 'DRN-301', type: 'Recon Drone', status: 'Idle', location: 'Vikhroli Air Base', lat: 19.1030, lng: 72.9268 },
  
  // RESCUE BOATS — Stationed on WATER BODIES (Mithi River, creeks)
  // Mithi River flows through Kurla: roughly lat 19.065-19.080, lng 72.855-72.870
  { id: 'MTB-801', type: 'Rescue Boat', status: 'Idle', location: 'Mithi River – Vakola Stretch', lat: 19.0780, lng: 72.8560 },
  { id: 'MTB-802', type: 'Rescue Boat', status: 'Idle', location: 'Mithi River – BKC Bridge', lat: 19.0665, lng: 72.8620 },
  { id: 'MTB-803', type: 'Rescue Boat', status: 'Idle', location: 'Mahim Creek Outpost', lat: 19.0430, lng: 72.8450 },
];

const initialEnvironment: SimEnvironment = {
  incidentName: "Mumbai Flood – Kurla Sector",
  rainfallIntensity: 15,
  riverLevel: 4.2,
  floodSpread: 0,
  affectedPopulation: 0,
  riskLevel: 15,
  currentPhase: 'STANDBY'
};

// Blocked road templates — activated GRADUALLY as roads actually flood
const BLOCKED_ROAD_TEMPLATES: Omit<BlockedRoad, 'id'>[] = [
  { lat: 19.0720, lng: 72.8790, roadName: 'LBS Marg Underpass', reason: 'Submerged under 3.2m floodwater. NDRF barriers in place.', severity: 'high' },
  { lat: 19.0740, lng: 72.8750, roadName: 'CST Road Junction', reason: 'Waterlogged – depth 1.5m. Only heavy vehicles can pass.', severity: 'medium' },
  { lat: 19.0710, lng: 72.8710, roadName: 'BKC Connector', reason: 'Fallen electrical pole. BEST crew dispatched.', severity: 'medium' },
  { lat: 19.0630, lng: 72.8770, roadName: 'Tilak Nagar Flyover', reason: 'Inspection in progress. Closed for safety.', severity: 'high' },
];

const KURLA_BOUNDS = { minLat: 19.0600, maxLat: 19.0800, minLng: 72.8700, maxLng: 72.8900 };

// Helper: determine which resource types can be sent given current conditions
const getValidResourceTypes = (floodSpread: number, riskLevel: number): string[] => {
  if (floodSpread > 25) { 
    // Severe flooding - ONLY air and water
    return ['Rescue Boat', 'Evac Helicopter', 'Recon Drone'];
  } else if (floodSpread > 12) { 
    // Moderate flooding - air, water, and fire trucks (heavy vehicles)
    return ['Rescue Boat', 'Evac Helicopter', 'Recon Drone', 'Fire Truck', 'Police Cruiser'];
  } else if (riskLevel > 80) { 
    // High risk - all vehicles
    return ['Ambulance', 'Fire Truck', 'Police Cruiser', 'Rescue Boat', 'Evac Helicopter', 'Recon Drone'];
  } else {
    // Normal conditions - all vehicles
    return ['Ambulance', 'Fire Truck', 'Police Cruiser', 'Rescue Boat', 'Evac Helicopter', 'Recon Drone'];
  }
};

// Helper: determine the best resource type for a given SOS priority
const getBestResourceForSOS = (priority: string, floodSpread: number): string[] => {
  if (floodSpread > 15) { 
    // Very Flooded: mix of boats/helicopters and heavy ground
    if (priority === 'critical') return ['Evac Helicopter', 'Rescue Boat', 'Fire Truck'];
    return ['Rescue Boat', 'Evac Helicopter', 'Fire Truck', 'Police Cruiser'];
  } else {
    // Dry or lightly flooded: all ground vehicles
    if (priority === 'critical') return ['Ambulance', 'Evac Helicopter', 'Fire Truck', 'Police Cruiser'];
    if (priority === 'moderate') return ['Police Cruiser', 'Fire Truck', 'Ambulance'];
    return ['Police Cruiser', 'Ambulance', 'Fire Truck'];
  }
};

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [simTime, setSimTime] = useState(0);
  const [simStatus, setSimStatus] = useState<'Running' | 'Paused'>('Paused');
  const [environment, setEnvironment] = useState<SimEnvironment>(initialEnvironment);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sosQueue, setSosQueue] = useState<SOSRequest[]>([]);
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [aiDecisions, setAiDecisions] = useState<AIDecision[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([
    { id: 'SYS-1', sender: 'COMMAND', message: 'System Initialized. Awaiting telemetry.', timestamp: 'T+0m', type: 'system' }
  ]);
  const [mapFocus, setMapFocus] = useState<MapFocus>({ lat: 19.0700, lng: 72.8800, zoom: 12 }); 
  const [blockedRoads, setBlockedRoads] = useState<BlockedRoad[]>([]);
  const [liveTracking, setLiveTracking] = useState<LiveTracking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rescuedCount, setRescuedCount] = useState(0);

  const flags = useRef({ 
    warningFired: false, criticalFired: false, emergencyFired: false, aiEvacFired: false, 
    road1Blocked: false, road2Blocked: false, road3Blocked: false,
    helicopterPhaseLogged: false
  });

  const focusMapOn = (lat: number, lng: number, zoom: number = 14) => {
    setMapFocus({ lat, lng, zoom });
  };

  const toggleSimulation = () => setSimStatus(prev => prev === 'Running' ? 'Paused' : 'Running');

  const getTrackingInfo = (resourceId: string): LiveTracking | undefined => {
    return liveTracking.find(t => t.resourceId === resourceId && t.status === 'active');
  };

  // ═══════════════════════════════════════════
  // CROSS-ROLE NOTIFICATION SYSTEM
  // ═══════════════════════════════════════════
  const sendNotification = (
    fromRole: Role, fromResourceId: string, toRole: Role,
    type: Notification['type'], message: string, lat: number, lng: number, sosId?: string
  ) => {
    const notif: Notification = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fromRole, fromResourceId, toRole, type, message, lat, lng, sosId,
      timestamp: `T+${simTime}m`,
      status: 'pending'
    };
    setNotifications(prev => [notif, ...prev]);

    // Log to coordination chat
    const roleNames: Record<string, string> = {
      'POLICE': 'Law Enforcement', 'PARAMEDIC': 'Medical', 'FIRE': 'Fire & Rescue',
      'ADMIN': 'Command', 'DMA': 'Disaster Mgmt', 'LOGISTICS': 'Supply Chain', 'CITIZEN': 'Citizen'
    };
    const typeLabels: Record<string, string> = {
      'medical_backup': '🏥 MEDICAL BACKUP', 'fire_backup': '🔥 FIRE BACKUP',
      'police_backup': '🚔 POLICE BACKUP', 'evacuation': '🚁 EVACUATION',
      'supply': '📦 SUPPLIES'
    };

    setChatLogs(prev => [{
      id: `CHAT-NOTIF-${notif.id}`,
      sender: fromResourceId || roleNames[fromRole] || fromRole,
      message: `${typeLabels[type] || type} REQUEST → ${roleNames[toRole]}: ${message}`,
      timestamp: `T+${simTime}m`,
      type: 'agency'
    }, ...prev]);

    // AUTO-DISPATCH: Find nearest idle resource of the requested role's type and dispatch
    const targetTypes: Record<string, string[]> = {
      'medical_backup': ['Ambulance', 'Evac Helicopter'],
      'fire_backup': ['Fire Truck'],
      'police_backup': ['Police Cruiser'],
      'evacuation': ['Evac Helicopter', 'Rescue Boat'],
      'supply': ['Ambulance']
    };
    const neededTypes = targetTypes[type] || [];
    const validTypes = getValidResourceTypes(environment.floodSpread, environment.riskLevel);
    const availableTypes = neededTypes.filter(t => validTypes.includes(t));

    if (availableTypes.length > 0 && sosId) {
      const idleMatch = resources.find(r => r.status === 'Idle' && availableTypes.includes(r.type));
      if (idleMatch) {
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, status: 'dispatched' } : n));
        // dispatch via timeout to avoid state conflict
        setTimeout(() => dispatchResource(idleMatch.id, sosId), 200);
      }
    }
  };

  const acknowledgeNotification = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, status: 'acknowledged' } : n));
  };

  // ═══════════════════════════════════════════
  // DISPATCH — Respects terrain rules
  // ═══════════════════════════════════════════
  const dispatchResource = async (resourceId: string, sosId: string) => {
    const targetSOS = sosQueue.find(s => s.id === sosId);
    const targetResource = resources.find(r => r.id === resourceId);
    if (!targetSOS || !targetResource) return;

    setSosQueue(prev => prev.map(s => s.id === sosId ? { ...s, status: 'dispatched', assignedResourceId: resourceId } : s));
    setResources(resPrev => resPrev.map(r => r.id === resourceId ? { ...r, status: 'Assigned' } : r));

    try {
      let routePath: [number, number][] = [];
      let calculatedEtaMins = 5;

      // TERRAIN LOGIC:
      // Ground (Ambulance, Police, Fire Truck) → OSRM road routing, CANNOT enter water
      // Air (Helicopter, Drone) → Straight line, flies over anything
      // Water (Rescue Boat) → Straight line over waterways only
      const isGroundVehicle = ['Ambulance', 'Fire Truck', 'Police Cruiser'].includes(targetResource.type);
      const isAerial = ['Evac Helicopter', 'Recon Drone'].includes(targetResource.type);

      if (isGroundVehicle) {
        // ROAD ROUTING — Ground vehicles stay on roads
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${targetResource.lng},${targetResource.lat};${targetSOS.lng},${targetSOS.lat}?overview=full&geometries=geojson`);
        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
           routePath = data.routes[0].geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
           calculatedEtaMins = Math.max(2, Math.ceil(data.routes[0].duration / 60)); 
        } else {
           routePath = [ [targetResource.lat, targetResource.lng], [targetSOS.lat, targetSOS.lng] ];
           calculatedEtaMins = Math.max(2, Math.ceil(calculateDistance(targetResource.lat, targetResource.lng, targetSOS.lat, targetSOS.lng) * 3));
        }
      } else if (isAerial) {
        // AIR — Straight line, very fast
        routePath = [ [targetResource.lat, targetResource.lng], [targetSOS.lat, targetSOS.lng] ];
        const dist = calculateDistance(targetResource.lat, targetResource.lng, targetSOS.lat, targetSOS.lng);
        calculatedEtaMins = Math.max(1, Math.ceil(dist / 2.0)); // ~120 km/hr
      } else {
        // WATER — Rescue boats travel straight line (waterways)
        routePath = [ [targetResource.lat, targetResource.lng], [targetSOS.lat, targetSOS.lng] ];
        const dist = calculateDistance(targetResource.lat, targetResource.lng, targetSOS.lat, targetSOS.lng);
        calculatedEtaMins = Math.max(2, Math.ceil(dist / 0.5)); // ~30 km/hr
      }

      setResources(resPrev => resPrev.map(r => {
        if(r.id === resourceId) {
          return { 
            ...r, 
            status: 'En Route', 
            destination: sosId, 
            targetLat: targetSOS.lat, 
            targetLng: targetSOS.lng, 
            etaMinutes: calculatedEtaMins,
            eta: `${calculatedEtaMins} mins`,
            assignedPerson: targetSOS.name,
            sosLocation: targetSOS.location,
            severity: targetSOS.priority,
            situation: targetSOS.message,
            routePath: routePath,
            routeIndex: 0
          };
        }
        return r;
      }));

      // Create live tracking entry
      const trackingEntry: LiveTracking = {
        id: `TRK-${Date.now()}`,
        resourceId: resourceId,
        sosId: sosId,
        resourceLat: targetResource.lat,
        resourceLng: targetResource.lng,
        personLat: targetSOS.lat,
        personLng: targetSOS.lng,
        eta: `${calculatedEtaMins} mins`,
        status: 'active'
      };
      setLiveTracking(prev => [...prev, trackingEntry]);

      const vehicleLabel = isGroundVehicle ? 'GROUND' : isAerial ? 'AERIAL' : 'MARINE';
      const deploymentMessage = `[${vehicleLabel}] Deploying ${resourceId} (${targetResource.type}) to ${targetSOS.name}. ETA: ${calculatedEtaMins} mins.`;

      setChatLogs(chatPrev => [{
        id: `CHAT-${Math.random()}`, sender: 'DISPATCH', message: deploymentMessage, timestamp: `T+${simTime}m`, type: 'agency'
      }, ...chatPrev]);

    } catch (err) {
      console.error("Route Generation Failed:", err);
      setResources(resPrev => resPrev.map(r => 
        r.id === resourceId ? { ...r, status: 'En Route', etaMinutes: 8, eta: '8 mins', routePath: [[r.lat, r.lng], [targetSOS.lat, targetSOS.lng]], routeIndex: 0 } : r
      ));
    }
  };

  const addSOS = (sos: Omit<SOSRequest, 'id' | 'status' | 'assignedResourceId'>) => {
    const newSOS: SOSRequest = { ...sos, id: `REQ-${Math.floor(Math.random() * 10000)}`, status: 'pending' };
    setSosQueue(prev => [newSOS, ...prev]);

    // Send global notification to all responders
    sendNotification(
      'CITIZEN',
      'PUBLIC',
      'ALL',
      'public_sos',
      `🆘 PUBLIC SOS: ${sos.name} at ${sos.location}. ${sos.message}`,
      sos.lat,
      sos.lng,
      newSOS.id
    );
  };

  // ═══════════════════════════════════════════
  // MAIN PHYSICS LOOP — Movement + Rescue Completion
  // ═══════════════════════════════════════════
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (simStatus === 'Running') {
      interval = setInterval(() => {
        setSimTime(prev => prev + 1);

        // Environment evolution
        setEnvironment(prevEnv => {
          let env = { ...prevEnv };
          env.rainfallIntensity += 1.2; 
          env.riverLevel += (env.rainfallIntensity * 0.002); 
          const OVERFLOW_THRESHOLD = 6.0;
          if (env.riverLevel > OVERFLOW_THRESHOLD) {
             env.floodSpread += (env.riverLevel - OVERFLOW_THRESHOLD) * 0.8; 
             env.affectedPopulation = Math.min(999, Math.floor(env.floodSpread * 42.5)); 
          }
          env.riskLevel = Math.min(100, Math.floor((env.riverLevel / 9) * 100));

          const opsActive = resources.filter(r => r.status === 'En Route' || r.status === 'Assigned').length > 0;
          if (opsActive || env.riskLevel > 80) env.currentPhase = 'RESPONSE';
          else if (env.riskLevel > 60) env.currentPhase = 'CRITICAL';
          else if (env.riskLevel > 40) env.currentPhase = 'WARNING';
          return env;
        });

        // Resource movement interpolation
        setResources(prevRes => prevRes.map(r => {
          // ── ARRIVED → Auto-complete and return to Idle after some time ──
          if (r.status === 'Arrived') {
            const etaVal = r.etaMinutes ?? 0;
            // Simulate rescue taking 3 ticks then returning to idle
            if (etaVal <= -3) {
              setRescuedCount(prev => prev + 1);
              setSosQueue(prev => prev.map(s => s.assignedResourceId === r.id ? { ...s, status: 'resolved' } : s));
              setLiveTracking(prev => prev.map(t => t.resourceId === r.id && t.status === 'arrived' ? { ...t, status: 'completed' } : t));
              
              // Update associated notification status to 'saved'
              const resolvedSOS = sosQueue.find(s => s.assignedResourceId === r.id);
              if (resolvedSOS) {
                setNotifications(prev => prev.map(n => n.sosId === resolvedSOS.id ? { ...n, status: 'saved' } : n));
              }
              
              setChatLogs(chatPrev => [{
                id: `CHAT-RESCUE-${Math.random()}`, sender: 'TACTICAL',
                message: `✅ ${r.id} has RESCUED ${r.assignedPerson}. Returning to standby.`,
                timestamp: `T+${simTime}m`, type: 'agency'
              }, ...chatPrev]);

              // Return to original base location
              const original = initialResources.find(orig => orig.id === r.id);
              return {
                ...r,
                status: 'Idle',
                lat: original?.lat ?? r.lat,
                lng: original?.lng ?? r.lng,
                location: original?.location ?? r.location,
                destination: undefined,
                targetLat: undefined,
                targetLng: undefined,
                eta: undefined,
                etaMinutes: undefined,
                assignedPerson: undefined,
                sosLocation: undefined,
                severity: undefined,
                situation: undefined,
                routePath: undefined,
                routeIndex: undefined
              };
            }
            return { ...r, etaMinutes: (etaVal) - 1 };
          }

          // ── EN ROUTE → Move toward target ──
          if (r.status === 'En Route' && r.routePath && r.routeIndex !== undefined) {
             const pathLen = r.routePath.length;
             
             if (pathLen === 2) {
                // Straight line (Air/Water) — interpolate
                const targetLat = r.routePath[1][0];
                const targetLng = r.routePath[1][1];
                const newEta = Math.max(0, (r.etaMinutes || 2) - 1);
                
                if (newEta <= 0) {
                   setChatLogs(chatPrev => [{
                     id: `CHAT-ARRIVE-${Math.random()}`, sender: 'TACTICAL', message: `${r.id} HAS ARRIVED AT SCENE to support ${r.assignedPerson}.`, timestamp: `T+${simTime}m`, type: 'agency'
                   }, ...chatPrev]);
                   
                   setLiveTracking(prev => prev.map(t => 
                     t.resourceId === r.id && t.status === 'active' ? { ...t, status: 'arrived' } : t
                   ));
                   
                   return { ...r, status: 'Arrived', lat: targetLat, lng: targetLng, etaMinutes: 0, eta: 'On Scene' };
                } else {
                   const decayFraction = 1.0 / (r.etaMinutes || 1);
                   const deltaLat = (targetLat - r.lat) * decayFraction;
                   const deltaLng = (targetLng - r.lng) * decayFraction;
                   const newLat = r.lat + deltaLat;
                   const newLng = r.lng + deltaLng;
                   
                   setLiveTracking(prev => prev.map(t => 
                     t.resourceId === r.id && t.status === 'active' ? { ...t, resourceLat: newLat, resourceLng: newLng, eta: `${newEta} mins` } : t
                   ));
                   
                   return { ...r, lat: newLat, lng: newLng, etaMinutes: newEta, eta: `${newEta} mins` };
                }
             } else {
                // OSRM road path — follow road coordinates
                const speedStep = Math.max(1, Math.floor(pathLen / 20)); 
                const nextIndex = r.routeIndex + speedStep;

                if (nextIndex >= pathLen - 1) {
                   setChatLogs(chatPrev => [{
                     id: `CHAT-ARRIVE-${Math.random()}`, sender: 'TACTICAL', message: `${r.id} HAS ARRIVED AT SCENE to support ${r.assignedPerson}.`, timestamp: `T+${simTime}m`, type: 'agency'
                   }, ...chatPrev]);
                   
                   setLiveTracking(prev => prev.map(t => 
                     t.resourceId === r.id && t.status === 'active' ? { ...t, status: 'arrived' } : t
                   ));
                   
                   return { ...r, status: 'Arrived', lat: r.routePath[pathLen - 1][0], lng: r.routePath[pathLen - 1][1], etaMinutes: 0, eta: 'On Scene', routeIndex: pathLen - 1 };
                } else {
                   const newLat = r.routePath[nextIndex][0];
                   const newLng = r.routePath[nextIndex][1];
                   const newEta = Math.max(1, (r.etaMinutes || 2) - 1);
                   
                   setLiveTracking(prev => prev.map(t => 
                     t.resourceId === r.id && t.status === 'active' ? { ...t, resourceLat: newLat, resourceLng: newLng, eta: `${newEta} mins` } : t
                   ));
                   
                   return { ...r, lat: newLat, lng: newLng, routeIndex: nextIndex, etaMinutes: newEta, eta: `${newEta} mins` };
                }
             }
          }
          return r;
        }));

      }, 2500); 
    }
    return () => clearInterval(interval);
  }, [simStatus, resources]); 

  // ═══════════════════════════════════════════
  // PROGRESSIVE EVENT GENERATION
  // Roads block gradually, not all at once
  // ═══════════════════════════════════════════
  useEffect(() => {
    if (simStatus !== 'Running') return;

    // Warning phase
    if (environment.riskLevel > 60 && !flags.current.warningFired) {
      flags.current.warningFired = true;
      setAlerts(prev => [{ id: `ALT-WARN`, type: 'warning', category: 'Flood', title: 'Major Rainfall Warning', timestamp: `T+${simTime}m`, description: `Rainfall exceeding ${environment.rainfallIntensity.toFixed(0)}mm/hr. River levels rising rapidly.`, lat: 19.0688, lng: 72.8752 }, ...prev]);
      setChatLogs(prev => [{ id: 'CHAT-WARN', sender: 'METRO', message: `Warning: River at ${environment.riverLevel.toFixed(1)}m. Ground units dispatching for early evacuations.`, timestamp: `T+${simTime}m`, type: 'agency' }, ...prev]);
    }

    // Critical — river overflow
    if (environment.riskLevel > 80 && !flags.current.criticalFired) {
      flags.current.criticalFired = true;
      setAlerts(prev => [{ id: `ALT-CRIT`, type: 'critical', category: 'Flood', title: 'River Overflow Detected', timestamp: `T+${simTime}m`, description: `Mithi River breached at ${environment.riverLevel.toFixed(1)}m. Kurla Sector impacted. Switching to aerial/marine ops.`, lat: 19.0700, lng: 72.8800 }, ...prev]);
      setChatLogs(prev => [{ id: 'CHAT-CRIT', sender: 'COMMAND', message: `CRITICAL: River overflow confirmed. Ground vehicles GROUNDED in flood zone. Deploying boats and helicopters.`, timestamp: `T+${simTime}m`, type: 'system' }, ...prev]);
    }

    // AI evacuation recommendation
    if (environment.floodSpread > 5 && !flags.current.aiEvacFired) {
      flags.current.aiEvacFired = true;
      setAiDecisions(prev => [{ id: `AI-EVAC`, confidence: 85 + Math.floor(Math.random()*10), recommendation: 'Initiate mandatory evacuation for Kurla Lowlands.', reasoning: `High rainfall (${environment.rainfallIntensity.toFixed(0)} mm/hr) + ${environment.riverLevel.toFixed(1)}m river. Est. Impact: ${environment.affectedPopulation} citizens.`, timestamp: `T+${simTime}m` }, ...prev]);
    }

    // Helicopter phase announcement
    if (environment.floodSpread > 15 && !flags.current.helicopterPhaseLogged) {
      flags.current.helicopterPhaseLogged = true;
      setChatLogs(prev => [{ id: 'CHAT-HELI', sender: 'COMMAND', message: `🚁 HELICOPTER PHASE ACTIVATED: Major roads impassable. Escalating to aerial assets for deep zones.`, timestamp: `T+${simTime}m`, type: 'system' }, ...prev]);
    }

    // ── GRADUAL ROAD BLOCKING ──
    // Phase 1: First road blocks when flood reaches low-lying areas (floodSpread > 10)
    if (environment.floodSpread > 10 && !flags.current.road1Blocked) {
      flags.current.road1Blocked = true;
      const roads = BLOCKED_ROAD_TEMPLATES.slice(0, 1).map((r, i) => ({ ...r, id: `BLK-${i + 1}` }));
      setBlockedRoads(roads);
      setChatLogs(prev => [{ id: 'CHAT-ROAD-1', sender: 'TRAFFIC', message: `⚠️ ${roads.map(r => r.roadName).join(', ')} now BLOCKED due to high water.`, timestamp: `T+${simTime}m`, type: 'agency' }, ...prev]);
    }

    // Phase 2: More roads (floodSpread > 20)
    if (environment.floodSpread > 20 && !flags.current.road2Blocked) {
      flags.current.road2Blocked = true;
      const roads = BLOCKED_ROAD_TEMPLATES.slice(1).map((r, i) => ({ ...r, id: `BLK-${i + 2}` }));
      setBlockedRoads(prev => [...prev, ...roads]);
      setChatLogs(prev => [{ id: 'CHAT-ROAD-2', sender: 'TRAFFIC', message: `🚧 Additional route closures in effect. Ground ops limited in low zones.`, timestamp: `T+${simTime}m`, type: 'agency' }, ...prev]);
    }

    // ── PROGRESSIVE SOS GENERATION ──
    // Early phase: fewer SOS, less critical
    // Late phase: more SOS, more critical
    const sosInterval = environment.floodSpread > 5 ? 12 : environment.riskLevel > 60 ? 18 : 24;
    if (environment.riskLevel > 40 && simTime % sosInterval === 0 && simTime > 0) {
       const rLat = KURLA_BOUNDS.minLat + (Math.random() * (KURLA_BOUNDS.maxLat - KURLA_BOUNDS.minLat));
       const rLng = KURLA_BOUNDS.minLng + (Math.random() * (KURLA_BOUNDS.maxLng - KURLA_BOUNDS.minLng));
       
       // Priority based on flood severity
       let priority: 'critical' | 'moderate' | 'low';
       if (environment.floodSpread > 8) {
         priority = Math.random() > 0.3 ? 'critical' : 'moderate'; // Mostly critical in severe floods
       } else if (environment.floodSpread > 3) {
         priority = Math.random() > 0.6 ? 'critical' : Math.random() > 0.4 ? 'moderate' : 'low';
       } else {
         priority = Math.random() > 0.8 ? 'critical' : Math.random() > 0.5 ? 'moderate' : 'low';
       }
       
       const messages = environment.floodSpread > 3 
         ? [
             `Trapped on rooftop! Water level rising fast. Need helicopter rescue.`,
             `Elderly person unable to move. Water at waist level. Urgent medical needed.`,
             `Family of 4 stranded. Children cold and scared. Please hurry.`,
             `Building foundation cracking. We need to evacuate NOW.`,
             `Diabetic patient needs insulin urgently. Medicine destroyed by water.`
           ]
         : [
             `Street waterlogged, cannot walk out. Need vehicle extraction.`,
             `Heavy rain, tree fallen on car. Need rescue team.`,
             `Basement flooding in apartment complex. 12 residents need help.`,
             `Road blocked by debris. Need police assistance.`
           ];
       
       addSOS({
         name: `Citizen ${Math.floor(Math.random()*900) + 100}`,
         priority,
         message: messages[Math.floor(Math.random() * messages.length)],
         location: 'Kurla West Sector',
         lat: rLat,
         lng: rLng,
         time: `T+${simTime}m`,
         distance: 'Calculating...'
       });
    }

  }, [environment, simTime, simStatus]);

  // ═══════════════════════════════════════════
  // SMART AUTO-DISPATCH
  // Phase 1 (dry): Ground vehicles (police, ambulance, fire truck)
  // Phase 2 (flooding): Boats first, then helicopters
  // Phase 3 (severe): Helicopters only for critical, boats for moderate
  // ═══════════════════════════════════════════
  useEffect(() => {
    if (simStatus !== 'Running') return;
    
    if (simTime % 3 === 0) {
      const pendingSOS = sosQueue.filter(s => s.status === 'pending');
      if (pendingSOS.length === 0) return;

      // Sort by priority: critical first
      const sorted = [...pendingSOS].sort((a, _b) => {
        if (a.priority === 'critical') return -1;
        if (a.priority === 'moderate') return 0;
        return 1;
      });

      const targetSOS = sorted[0];
      
      // Get preferred resource types based on SOS priority + flood state
      const preferredTypes = getBestResourceForSOS(targetSOS.priority, environment.floodSpread);
      const validTypes = getValidResourceTypes(environment.floodSpread, environment.riskLevel);
      
      // Find best available resource
      let bestResource: Resource | null = null;
      let bestDistance = Infinity;

      for (const prefType of preferredTypes) {
        if (!validTypes.includes(prefType)) continue;
        const candidates = resources.filter(r => r.status === 'Idle' && r.type === prefType);
        for (const candidate of candidates) {
          const dist = calculateDistance(candidate.lat, candidate.lng, targetSOS.lat, targetSOS.lng);
          if (dist < bestDistance) {
            bestDistance = dist;
            bestResource = candidate;
          }
        }
        if (bestResource) break; // Found one of the preferred type
      }

      // Fallback: any valid idle resource
      if (!bestResource) {
        const fallbackCandidates = resources.filter(r => r.status === 'Idle' && validTypes.includes(r.type));
        for (const candidate of fallbackCandidates) {
          const dist = calculateDistance(candidate.lat, candidate.lng, targetSOS.lat, targetSOS.lng);
          if (dist < bestDistance) {
            bestDistance = dist;
            bestResource = candidate;
          }
        }
      }
      
      if (bestResource) {
        dispatchResource(bestResource.id, targetSOS.id);
      } else if (simTime % 10 === 0) {
        const groundIdle = resources.filter(r => r.status === 'Idle' && ['Ambulance', 'Police Cruiser', 'Fire Truck'].includes(r.type));
        if (groundIdle.length > 0 && environment.floodSpread > 3) {
          setChatLogs(chatPrev => [{
            id: `CHAT-GROUND-${Math.random()}`, sender: 'COMMAND',
            message: `⚠️ Ground units (${groundIdle.map(r => r.id).join(', ')}) standing by — roads flooded. Waiting for aerial/marine clearance.`,
            timestamp: `T+${simTime}m`, type: 'system'
          }, ...chatPrev]);
        } else {
          setChatLogs(chatPrev => [{
            id: `CHAT-SUPPLY-${Math.random()}`, sender: 'COMMAND',
            message: `🔴 ALL ASSETS DEPLOYED. ${pendingSOS.length} SOS pending. Requesting mutual aid from neighboring districts.`,
            timestamp: `T+${simTime}m`, type: 'system'
          }, ...chatPrev]);
        }
      }
    }
  }, [simTime, sosQueue, resources, simStatus, environment.floodSpread, environment.riskLevel]);

  return (
    <SimulationContext.Provider value={{ 
      simTime, simStatus, environment, alerts, sosQueue, resources, aiDecisions, chatLogs, 
      blockedRoads, liveTracking, notifications, rescuedCount, mapFocus, focusMapOn, 
      toggleSimulation, dispatchResource, addSOS, getTrackingInfo, sendNotification, acknowledgeNotification 
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
