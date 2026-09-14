import type { CityData } from './cityTypes';
import type { SimState } from './simulationEngine';
import { formatSimTime, getDemandPeakLabel } from './simulationEngine';
import type { UrbanGraphData, GraphNode, GraphEdge } from './graphTypes';

export function buildUrbanGraph(cityData: CityData, simState: SimState): UrbanGraphData {
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();
  const adjacency = new Map<string, string[]>();

  const simTimeStr = formatSimTime(simState.timeOfDaySeconds);
  const demandLabel = getDemandPeakLabel(simState.timeOfDaySeconds);

  // 1. Build Nodes (Intersections)
  for (const intersection of cityData.intersections.values()) {
    nodes.set(intersection.id, {
      id: intersection.id,
      x: intersection.x,
      y: intersection.y,
      label: `Node ${intersection.id.replace('int_', '')}`,
      features: {
        trafficDensity: intersection.trafficDensity,
        vehicleCount: intersection.vehicleCount,
        averageSpeed: intersection.averageSpeed,
        queueLength: intersection.queueLength,
        simTime: simTimeStr,
        demandLabel
      }
    });
    adjacency.set(intersection.id, []);
  }

  // 2. Build Edges (Roads)
  for (const road of cityData.roads.values()) {
    edges.set(road.id, {
      id: road.id,
      source: road.startNode,
      target: road.endNode,
      features: {
        length: road.length,
        capacity: road.capacity,
        flow: road.currentFlow,
        density: road.density,
        travelTime: road.travelTime,
        roadType: road.roadType
      }
    });

    // Populate adjacency lists
    adjacency.get(road.startNode)?.push(road.id);
    adjacency.get(road.endNode)?.push(road.id);
  }

  return { nodes, edges, adjacency };
}
