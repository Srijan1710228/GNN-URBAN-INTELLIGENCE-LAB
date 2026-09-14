export type RoadType = 'LOCAL' | 'ARTERIAL' | 'HIGHWAY';
export type ZoneType = 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'PARK';
export type SignalState = 'RED' | 'YELLOW' | 'GREEN';

export interface Intersection {
  id: string;
  x: number;
  y: number;
  connectedRoads: string[];
  signalState: SignalState;
  trafficDensity: number; // 0 to 1
  vehicleCount: number;
  averageSpeed: number; // km/h
  queueLength: number;
}

export interface Road {
  id: string;
  startNode: string; // Intersection ID
  endNode: string;   // Intersection ID
  length: number;    // meters
  capacity: number;  // vehicles/hour
  speedLimit: number; // km/h
  currentFlow: number; // vehicles/hour
  density: number;    // 0 to 1
  travelTime: number; // seconds
  roadType: RoadType;
  lanes: number;
  status: 'ACTIVE' | 'BLOCKED' | 'CONGESTED' | 'CLOSED';
}

export interface Building {
  id: string;
  x: number;
  y: number;
  height: number;
  width: number;
  depth: number;
  type: ZoneType;
  population: number;
}

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  x: number;
  y: number;
  radius: number;
  color: string;
}

export interface TransitStation {
  id: string;
  name: string;
  x: number;
  y: number;
  line: string;
  capacity: number;
}

export interface TrafficSignal {
  id: string;
  intersectionId: string;
  cycleTime: number; // seconds
  lastChange: number; // timestamp/counter
}

export interface CityData {
  seed: number;
  intersections: Map<string, Intersection>;
  roads: Map<string, Road>;
  buildings: Building[];
  zones: Zone[];
  transitStations: TransitStation[];
  signals: TrafficSignal[];
}
