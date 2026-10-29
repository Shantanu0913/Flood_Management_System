export type Role = 'ADMIN' | 'DMA' | 'POLICE' | 'PARAMEDIC' | 'FIRE' | 'LOGISTICS' | 'CITIZEN' | 'ALL';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  token: string;
}

export interface SimEnvironment {
  rainfallIntensity: number; // mm/hr
  riverLevel: number; // meters
  floodSpread: number; // sq km
  affectedPopulation: number;
  riskLevel: number; // percentage
  currentPhase: 'STANDBY' | 'WARNING' | 'CRITICAL' | 'RESPONSE';
  incidentName: string;
}

export interface ChatLog {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  type: 'system' | 'agency';
}

export interface SOSRequest {
  id: string;
  name: string;
  priority: 'low' | 'moderate' | 'critical';
  message: string;
  location: string;
  lat: number;
  lng: number;
  time: string;
  distance: string;
  status: 'pending' | 'dispatched' | 'resolved';
  assignedResourceId?: string;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'emergency';
  category: 'Fire' | 'Flood' | 'System' | 'Medical' | 'Security';
  title: string;
  timestamp: string;
  description: string;
  lat: number;
  lng: number;
}

export interface Resource {
  id: string;
  type: 'Ambulance' | 'Fire Truck' | 'Police Cruiser' | 'Recon Drone' | 'Supply Truck' | 'Rescue Boat' | 'Evac Helicopter';
  status: 'Idle' | 'Assigned' | 'En Route' | 'Arrived' | 'Completed';
  location: string;
  lat: number;
  lng: number;
  
  destination?: string; 
  targetLat?: number;
  targetLng?: number;
  eta?: string;
  etaMinutes?: number;
  
  assignedPerson?: string;
  sosLocation?: string;
  severity?: 'critical' | 'moderate' | 'low';
  situation?: string;
  
  routePath?: [number, number][];
  routeIndex?: number;
}

export interface BlockedRoad {
  id: string;
  lat: number;
  lng: number;
  roadName: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
}

export interface LiveTracking {
  id: string;
  resourceId: string;
  sosId: string;
  resourceLat: number;
  resourceLng: number;
  personLat: number;
  personLng: number;
  eta: string;
  status: 'active' | 'arrived' | 'completed';
}

export interface AIDecision {
  id: string;
  confidence: number;
  recommendation: string;
  reasoning: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  fromRole: Role;
  fromResourceId: string;
  toRole: Role;
  type: 'medical_backup' | 'fire_backup' | 'police_backup' | 'evacuation' | 'supply' | 'public_sos';
  message: string;
  sosId?: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: 'pending' | 'acknowledged' | 'dispatched';
}

