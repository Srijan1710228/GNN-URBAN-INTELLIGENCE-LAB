import type { RoadType } from './cityTypes';

export interface GraphNodeFeatures {
  trafficDensity: number;
  vehicleCount: number;
  averageSpeed: number;
  queueLength: number;
  simTime: string;
  demandLabel: string;
}

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
  features: GraphNodeFeatures;
}

export interface GraphEdgeFeatures {
  length: number;
  capacity: number;
  flow: number;
  density: number;
  travelTime: number;
  roadType: RoadType;
}

export interface GraphEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  features: GraphEdgeFeatures;
}

export interface UrbanGraphData {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  adjacency: Map<string, string[]>; // Node ID -> Edge IDs
}
