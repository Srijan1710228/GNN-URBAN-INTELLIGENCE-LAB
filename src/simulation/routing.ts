import type { Intersection, Road } from './cityTypes';

export interface RouteStep {
  roadId: string;
  targetIntersectionId: string;
}

export function findRoute(
  startId: string,
  endId: string,
  intersections: Map<string, Intersection>,
  roads: Map<string, Road>
): RouteStep[] | null {
  if (startId === endId) return [];

  // Dijkstra's algorithm for routing
  const distances = new Map<string, number>();
  const previous = new Map<string, { roadId: string; nodeId: string } | null>();
  const unvisited = new Set<string>();

  for (const nodeId of intersections.keys()) {
    distances.set(nodeId, Infinity);
    previous.set(nodeId, null);
    unvisited.add(nodeId);
  }
  distances.set(startId, 0);

  // Adjacency map: nodeId -> array of { roadId, neighborId }
  const adj = new Map<string, { roadId: string; neighborId: string; weight: number }[]>();
  for (const road of roads.values()) {
    if (road.status === 'BLOCKED') continue;

    // Weight is travel time or distance
    const weight = road.length / (road.speedLimit / 3.6);

    if (!adj.has(road.startNode)) adj.set(road.startNode, []);
    adj.get(road.startNode)!.push({ roadId: road.id, neighborId: road.endNode, weight });

    if (!adj.has(road.endNode)) adj.set(road.endNode, []);
    adj.get(road.endNode)!.push({ roadId: road.id, neighborId: road.startNode, weight });
  }

  while (unvisited.size > 0) {
    // Find node with minimum distance
    let currentId: string | null = null;
    let minDist = Infinity;

    for (const nodeId of unvisited) {
      const d = distances.get(nodeId)!;
      if (d < minDist) {
        minDist = d;
        currentId = nodeId;
      }
    }

    if (currentId === null || currentId === endId) break;

    unvisited.delete(currentId);
    const neighbors = adj.get(currentId) || [];

    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.neighborId)) continue;

      const alt = distances.get(currentId)! + neighbor.weight;
      if (alt < distances.get(neighbor.neighborId)!) {
        distances.set(neighbor.neighborId, alt);
        previous.set(neighbor.neighborId, { roadId: neighbor.roadId, nodeId: currentId });
      }
    }
  }

  // Reconstruct path
  if (distances.get(endId) === Infinity) return null;

  const path: RouteStep[] = [];
  let curr = endId;

  while (curr !== startId) {
    const prev = previous.get(curr);
    if (!prev) return null;

    path.unshift({
      roadId: prev.roadId,
      targetIntersectionId: curr
    });
    curr = prev.nodeId;
  }

  return path;
}
