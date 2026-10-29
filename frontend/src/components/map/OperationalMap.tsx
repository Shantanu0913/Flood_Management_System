import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, Tooltip, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { useSimulation } from '../../context/SimulationContext';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';
import 'leaflet/dist/leaflet.css';
import './OperationalMap.css';

const { BaseLayer, Overlay } = LayersControl;

// Dynamic map camera interpolator component
const MapController: React.FC<{ focus: { lat: number, lng: number, zoom: number } }> = ({ focus }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([focus.lat, focus.lng], focus.zoom, { animate: true, duration: 1.5 });
  }, [focus, map]);
  return null;
};

// ═══════════════════════════════════════════
// SVG RESOURCE ICONS — Unique per vehicle type
// ═══════════════════════════════════════════
const RESOURCE_ICONS: Record<string, { svg: string; color: string }> = {
  'Ambulance': {
    color: '#FF3B3B',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10H6"/><path d="M8 8v4"/><path d="M18 18H2V6h11l5 6v6z"/><path d="M22 18h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M22 12h-3"/></svg>`
  },
  'Fire Truck': {
    color: '#FF8C00',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12c-2-2.67-4-4-4-6a4 4 0 1 1 8 0c0 2-2 3.33-4 6z"/><circle cx="12" cy="6" r="1"/><path d="M4 22h16"/><path d="M10 22V10"/><path d="M14 22V10"/><path d="M6 18h12"/></svg>`
  },
  'Police Cruiser': {
    color: '#4A90FF',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`
  },
  'Evac Helicopter': {
    color: '#00E5FF',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h20"/><path d="M12 4v8"/><path d="M8 12h8l2 4H6l2-4z"/><path d="M12 16v4"/><path d="M8 20h8"/></svg>`
  },
  'Rescue Boat': {
    color: '#2ECC71',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20c2-1 4-1 6 0s4 1 6 0 4-1 6 0"/><path d="M4 16l2-8h12l2 8"/><path d="M12 8V4"/><path d="M8 4h8"/></svg>`
  },
  'Recon Drone': {
    color: '#BB86FC',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M5 5l2.5 2.5"/><path d="M19 5l-2.5 2.5"/><path d="M5 19l2.5-2.5"/><path d="M19 19l-2.5-2.5"/><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></svg>`
  }
};

// Create resource-specific icon with SVG
const createResourceIcon = (id: string, type: string, status: string, size: number = 32) => {
  const iconData = RESOURCE_ICONS[type] || { color: '#00E5FF', svg: '' };
  const isArrived = status === 'Arrived';
  const isIdle = status === 'Idle';
  const glowColor = isArrived ? '#00E5FF' : isIdle ? 'rgba(0,229,255,0.3)' : iconData.color;
  const bgOpacity = isIdle ? '0.5' : '0.9';
  const actualSize = isIdle ? size - 6 : size;

  return L.divIcon({
    className: 'resource-marker-icon',
    html: `<div class="resource-marker ${isArrived ? 'arrived-pulse' : ''} ${status === 'En Route' ? 'en-route-glow' : ''}" style="
      width: ${actualSize}px;
      height: ${actualSize}px;
      background: rgba(11,15,26,${bgOpacity});
      border: 2px solid ${glowColor};
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 ${isArrived ? '15' : '8'}px ${glowColor};
      color: ${iconData.color};
      position: relative;
    ">
      <div style="width: ${actualSize * 0.45}px; height: ${actualSize * 0.45}px; margin-top: -8px;">
        ${iconData.svg}
      </div>
      <div class="resource-type-label" style="
        position: absolute;
        bottom: 4px;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 7px;
        font-weight: bold;
        font-family: 'Orbitron', sans-serif;
        color: ${iconData.color};
        text-shadow: 0 0 4px rgba(0,0,0,1);
        letter-spacing: 0.5px;
        pointer-events: none;
      ">${id}</div>
    </div>`,
    iconSize: [actualSize, actualSize + 16],
    iconAnchor: [actualSize / 2, actualSize / 2]
  });
};

// SOS person danger icon with 3-tier severity colors
const createSOSIcon = (priority: 'critical' | 'moderate' | 'low', status: string) => {
  const colors = {
    critical: { bg: '#FF3B3B', glow: 'rgba(255,59,59,0.6)', symbol: '!', pulse: true },
    moderate: { bg: '#FF8C00', glow: 'rgba(255,140,0,0.5)', symbol: '⚠', pulse: false },
    low: { bg: '#FFC857', glow: 'rgba(255,200,87,0.4)', symbol: '•', pulse: false }
  };
  const c = colors[priority];
  const isDispatched = status === 'dispatched';
  const size = priority === 'critical' ? 28 : priority === 'moderate' ? 24 : 20;

  return L.divIcon({
    className: 'sos-marker-icon',
    html: `<div class="sos-marker ${c.pulse ? 'sos-pulse-critical' : ''} ${isDispatched ? 'sos-dispatched' : ''}" style="
      width: ${size}px;
      height: ${size}px;
      background: ${isDispatched ? 'rgba(11,15,26,0.7)' : c.bg};
      border: 2px solid ${isDispatched ? 'rgba(255,255,255,0.3)' : c.bg};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 ${c.pulse ? '20' : '10'}px ${c.glow};
      color: ${isDispatched ? 'rgba(255,255,255,0.5)' : '#0B0F1A'};
      font-weight: bold;
      font-size: ${size / 2.2}px;
      font-family: 'Orbitron', sans-serif;
      opacity: ${isDispatched ? '0.5' : '1'};
    ">${c.symbol}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

// Blocked road icon
const createBlockedRoadIcon = (severity: 'high' | 'medium' | 'low') => {
  const colors = { high: '#FF3B3B', medium: '#FF8C00', low: '#FFC857' };
  const color = colors[severity];

  return L.divIcon({
    className: 'blocked-road-icon',
    html: `<div class="road-block-marker" style="
      width: 26px;
      height: 26px;
      background: rgba(11,15,26,0.85);
      border: 2px solid ${color};
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 8px ${color}40;
      cursor: pointer;
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round">
        <path d="M18 6L6 18"/><path d="M6 6l12 12"/>
      </svg>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

// Role-based visibility filter
const shouldShowResource = (resourceType: string, role: Role | null): boolean => {
  if (!role) return false;
  if (role === 'ADMIN' || role === 'DMA') return true;
  
  switch (role) {
    case 'POLICE': return ['Police Cruiser'].includes(resourceType);
    case 'PARAMEDIC': return ['Ambulance', 'Evac Helicopter'].includes(resourceType);
    case 'FIRE': return ['Fire Truck', 'Evac Helicopter'].includes(resourceType);
    case 'LOGISTICS': return true;
    case 'CITIZEN': return false; // Citizens see only their assigned resource via tracking
    default: return true;
  }
};

const shouldShowSOS = (role: Role | null): boolean => {
  if (!role) return false;
  return ['ADMIN', 'DMA', 'POLICE', 'PARAMEDIC', 'FIRE'].includes(role);
};

const shouldShowBlockedRoads = (role: Role | null): boolean => {
  if (!role) return false;
  return ['ADMIN', 'DMA', 'POLICE', 'LOGISTICS', 'FIRE'].includes(role);
};

export const OperationalMap: React.FC = () => {
  const { mapFocus, alerts, sosQueue, resources, environment, blockedRoads, liveTracking } = useSimulation();
  const { role } = useAuth();

  const getRiskColor = (risk: number) => {
     if (risk > 80) return '#FF3B3B'; // Red
     if (risk > 60) return '#FF8C00'; // Orange
     return '#FFC857'; // Yellow
  };

  // For CITIZEN role, find their SOS and the assigned resource
  const citizenTracking = role === 'CITIZEN' 
    ? liveTracking.filter(t => t.status === 'active' || t.status === 'arrived')
    : [];

  return (
    <MapContainer 
      center={[mapFocus.lat, mapFocus.lng]} 
      zoom={mapFocus.zoom} 
      style={{ width: '100%', height: '100%', background: '#0B0F1A' }}
      zoomControl={false}
    >
      <MapController focus={mapFocus} />
      
      <LayersControl position="topright">
        {/* Base Layers */}
        <BaseLayer checked name="Simulation Topo">
          <TileLayer
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
            maxZoom={17}
          />
        </BaseLayer>

        <BaseLayer name="Cyberpunk Dark">
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CartoDB</a> contributors'
          />
        </BaseLayer>

        <BaseLayer name="Strategic Satellite">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          />
        </BaseLayer>


        {/* Overlays */}
        <Overlay checked name="Flood Spread (Simulation)">
          {environment.floodSpread > 0 && (
            <>
              {/* Heatmap Outer Glow */}
              <Circle 
                center={[19.0700, 72.8800]} 
                radius={environment.floodSpread * 150} 
                pathOptions={{
                  fillColor: getRiskColor(environment.riskLevel),
                  fillOpacity: 0.1,
                  color: 'transparent',
                  weight: 0,
                }}
              />
              {/* Heatmap Core Intensity */}
              <Circle 
                center={[19.0700, 72.8800]} 
                radius={environment.floodSpread * 100} 
                pathOptions={{
                  fillColor: getRiskColor(environment.riskLevel),
                  fillOpacity: 0.25,
                  color: getRiskColor(environment.riskLevel),
                  opacity: 0.6,
                  weight: 2,
                }}
              />
               {/* Center Hotspot */}
               <Circle 
                center={[19.0700, 72.8800]} 
                radius={environment.floodSpread * 40} 
                pathOptions={{
                  fillColor: getRiskColor(environment.riskLevel),
                  fillOpacity: 0.4,
                  color: 'transparent',
                  weight: 0,
                }}
              />
            </>
          )}
        </Overlay>

        <Overlay checked name="Hazard Alert Zones">
          <>
            {alerts.map(alert => (
              <Circle
                key={alert.id}
                center={[alert.lat, alert.lng]}
                radius={alert.type === 'critical' ? 3000 : 8000} 
                pathOptions={{
                  fillColor: alert.type === 'critical' ? '#FF3B3B' : '#FFC857',
                  fillOpacity: 0.1,
                  color: alert.type === 'critical' ? '#FF3B3B' : '#FFC857',
                  opacity: 0.5,
                  weight: 1,
                }}
              />
            ))}
          </>
        </Overlay>

        {/* SOS Distress Beacons — Role filtered */}
        {shouldShowSOS(role) && (
          <Overlay checked name="SOS Distress Beacons">
            <>
              {sosQueue.map(sos => (
                <Marker 
                  key={sos.id}
                  position={[sos.lat, sos.lng]}
                  icon={createSOSIcon(sos.priority, sos.status)}
                >
                  <Tooltip direction="top" className="custom-tooltip">
                    <div className="sos-tooltip-header" style={{ color: sos.priority === 'critical' ? '#FF3B3B' : sos.priority === 'moderate' ? '#FF8C00' : '#FFC857' }}>
                      SOS: {sos.priority.toUpperCase()} PRIORITY
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{sos.name}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{sos.message}</div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>📍 {sos.location}</span>
                      <span>{sos.status.toUpperCase()}</span>
                    </div>
                    {sos.assignedResourceId && (
                      <div style={{ fontSize: '9px', color: '#2ECC71', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px' }}>
                        🚨 Assigned: {sos.assignedResourceId}
                      </div>
                    )}
                  </Tooltip>
                </Marker>
              ))}
            </>
          </Overlay>
        )}

        {/* Deployed Resources — Role filtered with SVG icons */}
        <Overlay checked name="Deployed Resources">
          <>
            {resources.map(res => {
              // Role-based filter
              if (!shouldShowResource(res.type, role)) return null;

              if ((res.status === 'En Route' || res.status === 'Arrived' || res.status === 'Assigned') && res.targetLat && res.targetLng) {
                return (
                  <React.Fragment key={res.id}>
                    <Marker 
                      position={[res.lat, res.lng]}
                      icon={createResourceIcon(res.id, res.type, res.status)}
                    >
                      <Tooltip direction="top" className="custom-tooltip">
                        <div style={{ fontFamily: "'Orbitron', sans-serif", color: RESOURCE_ICONS[res.type]?.color || '#00E5FF', fontSize: '11px', letterSpacing: '1px' }}>
                          {res.id} — {res.type.toUpperCase()}
                        </div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Phase: {res.status.toUpperCase()}</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>Target: {res.assignedPerson}</div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#FFC857', marginTop: '4px' }}>ETA: {res.eta}</div>
                      </Tooltip>
                    </Marker>
                    
                    {/* Animated route line */}
                    {res.status === 'En Route' && res.routePath && (
                      <Polyline 
                        positions={res.routePath as [number, number][]}
                        pathOptions={{
                          color: RESOURCE_ICONS[res.type]?.color || '#2ECC71',
                          opacity: 0.4,
                          weight: 3,
                          dashArray: '8, 6'
                        }}
                      />
                    )}

                    {/* Live tracking connection line (resource → person) */}
                    {(res.status === 'En Route') && (
                      <Polyline
                        positions={[[res.lat, res.lng], [res.targetLat!, res.targetLng!]]}
                        pathOptions={{
                          color: '#00E5FF',
                          opacity: 0.2,
                          weight: 1,
                          dashArray: '3, 8'
                        }}
                      />
                    )}
                  </React.Fragment>
                )
              } else if (res.status === 'Idle') {
                return (
                  <Marker 
                    key={res.id}
                    position={[res.lat, res.lng]}
                    icon={createResourceIcon(res.id, res.type, 'Idle', 26)}
                  >
                    <Tooltip direction="top" className="custom-tooltip">
                      <div style={{ fontFamily: "'Orbitron', sans-serif", color: 'rgba(255,255,255,0.5)', fontSize: '10px', letterSpacing: '1px' }}>
                        {res.id} — STANDBY
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{res.type} • {res.location}</div>
                    </Tooltip>
                  </Marker>
                )
              }
              return null;
            })}
          </>
        </Overlay>

        {/* Blocked Roads — with hover tooltips */}
        {shouldShowBlockedRoads(role) && blockedRoads.length > 0 && (
          <Overlay checked name="Blocked Roads">
            <>
              {blockedRoads.map(road => (
                <Marker
                  key={road.id}
                  position={[road.lat, road.lng]}
                  icon={createBlockedRoadIcon(road.severity)}
                >
                  <Tooltip direction="top" className="custom-tooltip blocked-road-tooltip" sticky>
                    <div className="road-tooltip-header">
                      <span style={{ color: road.severity === 'high' ? '#FF3B3B' : road.severity === 'medium' ? '#FF8C00' : '#FFC857' }}>
                        🚧 ROAD BLOCKED
                      </span>
                      <span className="road-severity-tag" style={{ 
                        background: road.severity === 'high' ? 'rgba(255,59,59,0.2)' : road.severity === 'medium' ? 'rgba(255,140,0,0.2)' : 'rgba(255,200,87,0.2)',
                        color: road.severity === 'high' ? '#FF3B3B' : road.severity === 'medium' ? '#FF8C00' : '#FFC857',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '8px',
                        fontFamily: "'Orbitron', sans-serif",
                        marginLeft: '8px'
                      }}>
                        {road.severity.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff', marginTop: '6px' }}>
                      📍 {road.roadName}
                    </div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', marginTop: '6px', lineHeight: '1.4' }}>
                      {road.reason}
                    </div>
                  </Tooltip>
                </Marker>
              ))}
            </>
          </Overlay>
        )}

        {/* Citizen Live Tracking — visible only to CITIZEN role */}
        {role === 'CITIZEN' && citizenTracking.length > 0 && (
          <Overlay checked name="Your Rescue Status">
            <>
              {citizenTracking.map(track => {
                const assignedRes = resources.find(r => r.id === track.resourceId);
                return (
                  <React.Fragment key={track.id}>
                    {/* Person location marker */}
                    <Marker
                      position={[track.personLat, track.personLng]}
                      icon={L.divIcon({
                        className: 'citizen-self-marker',
                        html: `<div class="citizen-you-pin">YOU</div>`,
                        iconSize: [36, 36],
                        iconAnchor: [18, 18]
                      })}
                    >
                      <Tooltip direction="top" className="custom-tooltip">
                        <div style={{ color: '#00E5FF', fontFamily: "'Orbitron', sans-serif", fontSize: '10px' }}>YOUR LOCATION</div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginTop: '4px' }}>Help is on the way!</div>
                      </Tooltip>
                    </Marker>

                    {/* Assigned resource marker */}
                    {assignedRes && (
                      <Marker
                        position={[track.resourceLat, track.resourceLng]}
                        icon={createResourceIcon(assignedRes.id, assignedRes.type, assignedRes.status)}
                      >
                        <Tooltip direction="top" className="custom-tooltip">
                          <div style={{ color: '#2ECC71', fontFamily: "'Orbitron', sans-serif", fontSize: '10px' }}>
                            {assignedRes.id} — {assignedRes.type.toUpperCase()}
                          </div>
                          <div style={{ color: '#FFC857', fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>
                            ETA: {track.eta}
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginTop: '2px' }}>
                            Status: {track.status.toUpperCase()}
                          </div>
                        </Tooltip>
                      </Marker>
                    )}

                    {/* Connection line */}
                    <Polyline
                      positions={[[track.personLat, track.personLng], [track.resourceLat, track.resourceLng]]}
                      pathOptions={{
                        color: track.status === 'arrived' ? '#2ECC71' : '#00E5FF',
                        opacity: 0.5,
                        weight: 2,
                        dashArray: track.status === 'arrived' ? undefined : '6, 8'
                      }}
                    />
                  </React.Fragment>
                );
              })}
            </>
          </Overlay>
        )}
      </LayersControl>
    </MapContainer>
  );
};
