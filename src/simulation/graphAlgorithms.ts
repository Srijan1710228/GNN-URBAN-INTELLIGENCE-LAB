import type { UrbanGraphData } from './graphTypes';

export interface PathResult {
  path: string[];
  distance: number;
}

export function getNodeNeighbors(nodeId: string, graph: UrbanGraphData): string[] {
  const edgeIds = graph.adjacency.get(nodeId) || [];
  return edgeIds.map(edgeId => {
    const edge = graph.edges.get(edgeId)!;
    return edge.source === nodeId ? edge.target : edge.source;
  });
}

export function getNodeDegree(nodeId: string, graph: UrbanGraphData): number {
  return (graph.adjacency.get(nodeId) || []).length;
}

// Find Connected Components using Depth First Search
export function findConnectedComponents(graph: UrbanGraphData): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];

  for (const nodeId of graph.nodes.keys()) {
    if (!visited.has(nodeId)) {
      const component: string[] = [];
      const stack: string[] = [nodeId];

      while (stack.length > 0) {
        const curr = stack.pop()!;
        if (visited.has(curr)) continue;

        visited.add(curr);
        component.push(curr);

        const neighbors = getNodeNeighbors(curr, graph);
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
          }
        }
      }
      components.push(component);
    }
  }

  return components;
}

// Dijkstra Shortest Path calculation on graph network data
export function calculateShortestPath(
  startId: string,
  endId: string,
  graph: UrbanGraphData
): PathResult | null {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();

  for (const nodeId of graph.nodes.keys()) {
    distances.set(nodeId, Infinity);
    previous.set(nodeId, null);
    unvisited.add(nodeId);
  }
  distances.set(startId, 0);

  while (unvisited.size > 0) {
    let curr: string | null = null;
    let minDist = Infinity;

    for (const node of unvisited) {
      const d = distances.get(node)!;
      if (d < minDist) {
        minDist = d;
        curr = node;
      }
    }

    if (curr === null || curr === endId) break;

    unvisited.delete(curr);

    const edgeIds = graph.adjacency.get(curr) || [];
    for (const edgeId of edgeIds) {
      const edge = graph.edges.get(edgeId)!;
      const neighbor = edge.source === curr ? edge.target : edge.source;

      if (!unvisited.has(neighbor)) continue;

      // travelTime represents cost
      const weight = edge.features.travelTime;
      const alt = distances.get(curr)! + weight;

      if (alt < distances.get(neighbor)!) {
        distances.set(neighbor, alt);
        previous.set(neighbor, curr);
      }
    }
  }

  if (distances.get(endId) === Infinity) return null;

  const path: string[] = [];
  let currId = endId;
  while (currId !== startId) {
    path.unshift(currId);
    const prev = previous.get(currId);
    if (!prev) return null;
    currId = prev;
  }
  path.unshift(startId);

  return {
    path,
    distance: distances.get(endId)!
  };
}
