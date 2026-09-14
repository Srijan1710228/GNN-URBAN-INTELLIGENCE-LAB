export type ZoneType = 'residential' | 'commercial' | 'industrial' | 'park';
export type EdgeType = 'road' | 'transit' | 'pedestrian';

export interface UrbanNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: ZoneType;
  population: number;      // 0 to 100
  commercialDensity: number; // 0 to 100
  greenSpace: number;       // 0 to 100
}

export interface UrbanEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  distance: number;
  lanes: number;
}

export class UrbanGraph {
  nodes: Map<string, UrbanNode> = new Map();
  edges: Map<string, UrbanEdge> = new Map();
  adjacency: Map<string, string[]> = new Map(); // nodeId -> connectedEdgeIds

  constructor() {}

  addNode(node: UrbanNode) {
    this.nodes.set(node.id, { ...node });
    if (!this.adjacency.has(node.id)) {
      this.adjacency.set(node.id, []);
    }
  }

  removeNode(nodeId: string) {
    this.nodes.delete(nodeId);
    this.adjacency.delete(nodeId);
    // Remove all associated edges
    for (const [edgeId, edge] of this.edges.entries()) {
      if (edge.source === nodeId || edge.target === nodeId) {
        this.removeEdge(edgeId);
      }
    }
  }

  addEdge(edge: UrbanEdge) {
    this.edges.set(edge.id, { ...edge });
    if (!this.adjacency.has(edge.source)) this.adjacency.set(edge.source, []);
    if (!this.adjacency.has(edge.target)) this.adjacency.set(edge.target, []);
    this.adjacency.get(edge.source)?.push(edge.id);
    this.adjacency.get(edge.target)?.push(edge.id); // undirected representation
  }

  removeEdge(edgeId: string) {
    const edge = this.edges.get(edgeId);
    if (!edge) return;

    this.edges.delete(edgeId);

    // Clean from adjacency lists
    const srcList = this.adjacency.get(edge.source) || [];
    this.adjacency.set(edge.source, srcList.filter(id => id !== edgeId));

    const tgtList = this.adjacency.get(edge.target) || [];
    this.adjacency.set(edge.target, tgtList.filter(id => id !== edgeId));
  }

  getNeighbors(nodeId: string): string[] {
    const edgeIds = this.adjacency.get(nodeId) || [];
    return edgeIds.map(edgeId => {
      const edge = this.edges.get(edgeId)!;
      return edge.source === nodeId ? edge.target : edge.source;
    });
  }

  getEdgesForNode(nodeId: string): UrbanEdge[] {
    const edgeIds = this.adjacency.get(nodeId) || [];
    return edgeIds.map(edgeId => this.edges.get(edgeId)!);
  }

  clone(): UrbanGraph {
    const g = new UrbanGraph();
    for (const node of this.nodes.values()) {
      g.addNode(node);
    }
    for (const edge of this.edges.values()) {
      g.addEdge(edge);
    }
    return g;
  }

  // Dijkstra's Shortest Path from startNode to all other nodes
  dijkstra(startNode: string): Map<string, number> {
    const distances = new Map<string, number>();
    const visited = new Set<string>();

    for (const nodeId of this.nodes.keys()) {
      distances.set(nodeId, Infinity);
    }
    distances.set(startNode, 0);

    const getMinDistanceNode = () => {
      let minDistance = Infinity;
      let minNode: string | null = null;
      for (const [nodeId, dist] of distances.entries()) {
        if (!visited.has(nodeId) && dist < minDistance) {
          minDistance = dist;
          minNode = nodeId;
        }
      }
      return minNode;
    };

    while (true) {
      const curr = getMinDistanceNode();
      if (!curr) break;

      visited.add(curr);

      const currentDist = distances.get(curr)!;
      const edges = this.getEdgesForNode(curr);

      for (const edge of edges) {
        const neighbor = edge.source === curr ? edge.target : edge.source;
        if (visited.has(neighbor)) continue;

        // Effective distance/cost based on road lanes and edge type
        let traversalCost = edge.distance;
        if (edge.type === 'transit') traversalCost *= 0.5; // Transit is faster/more accessible
        if (edge.type === 'pedestrian') traversalCost *= 1.5; // Walking is slower

        const newDist = currentDist + traversalCost;
        if (newDist < distances.get(neighbor)!) {
          distances.set(neighbor, newDist);
        }
      }
    }

    return distances;
  }

  // Calculate Closeness Centrality for each node
  calculateClosenessCentrality(): Map<string, number> {
    const centrality = new Map<string, number>();
    const nodeIds = Array.from(this.nodes.keys());
    const N = nodeIds.length;

    for (const u of nodeIds) {
      const distances = this.dijkstra(u);
      let sumDist = 0;
      let reachableCount = 0;

      for (const v of nodeIds) {
        if (u === v) continue;
        const d = distances.get(v)!;
        if (d !== Infinity) {
          sumDist += d;
          reachableCount++;
        }
      }

      // Normalised closeness centrality
      if (sumDist > 0 && reachableCount > 0) {
        const rawCloseness = reachableCount / sumDist;
        const normalizedCloseness = rawCloseness * (reachableCount / (N - 1));
        centrality.set(u, normalizedCloseness);
      } else {
        centrality.set(u, 0);
      }
    }

    return centrality;
  }

  // Calculate Degree Centrality
  calculateDegreeCentrality(): Map<string, number> {
    const centrality = new Map<string, number>();
    const maxDegree = Math.max(1, this.nodes.size - 1);

    for (const nodeId of this.nodes.keys()) {
      const degree = this.getNeighbors(nodeId).length;
      centrality.set(nodeId, degree / maxDegree);
    }

    return centrality;
  }
}

// Generate the initial baseline City Graph (10 nodes)
export function createDefaultCityGraph(): UrbanGraph {
  const g = new UrbanGraph();

  // Nodes (approx 800x500 canvas coordinates)
  const defaultNodes: UrbanNode[] = [
    { id: 'n1', label: 'Downtown Hub', x: 400, y: 250, type: 'commercial', population: 30, commercialDensity: 90, greenSpace: 10 },
    { id: 'n2', label: 'West Suburbs', x: 150, y: 200, type: 'residential', population: 85, commercialDensity: 15, greenSpace: 40 },
    { id: 'n3', label: 'North Industrial Sector', x: 450, y: 80, type: 'industrial', population: 5, commercialDensity: 10, greenSpace: 5 },
    { id: 'n4', label: 'South Riverside Parks', x: 380, y: 420, type: 'park', population: 2, commercialDensity: 5, greenSpace: 95 },
    { id: 'n5', label: 'East Gate Residences', x: 680, y: 220, type: 'residential', population: 75, commercialDensity: 20, greenSpace: 35 },
    { id: 'n6', label: 'Financial District', x: 520, y: 270, type: 'commercial', population: 20, commercialDensity: 95, greenSpace: 8 },
    { id: 'n7', label: 'Tech Park', x: 280, y: 150, type: 'industrial', population: 15, commercialDensity: 70, greenSpace: 25 },
    { id: 'n8', label: 'Sunset Neighborhood', x: 200, y: 350, type: 'residential', population: 60, commercialDensity: 10, greenSpace: 50 },
    { id: 'n9', label: 'Central Gardens', x: 380, y: 200, type: 'park', population: 0, commercialDensity: 5, greenSpace: 90 },
    { id: 'n10', label: 'Marina Retail Square', x: 580, y: 380, type: 'commercial', population: 40, commercialDensity: 80, greenSpace: 20 }
  ];

  defaultNodes.forEach(node => g.addNode(node));

  // Edges
  const defaultEdges: UrbanEdge[] = [
    { id: 'e1', source: 'n2', target: 'n7', type: 'road', distance: 150, lanes: 2 },
    { id: 'e2', source: 'n7', target: 'n9', type: 'road', distance: 120, lanes: 2 },
    { id: 'e3', source: 'n9', target: 'n1', type: 'pedestrian', distance: 60, lanes: 1 },
    { id: 'e4', source: 'n1', target: 'n6', type: 'road', distance: 120, lanes: 4 },
    { id: 'e5', source: 'n6', target: 'n5', type: 'road', distance: 180, lanes: 2 },
    { id: 'e6', source: 'n6', target: 'n10', type: 'transit', distance: 140, lanes: 2 },
    { id: 'e7', source: 'n4', target: 'n1', type: 'road', distance: 170, lanes: 2 },
    { id: 'e8', source: 'n4', target: 'n8', type: 'pedestrian', distance: 190, lanes: 1 },
    { id: 'e9', source: 'n8', target: 'n2', type: 'road', distance: 160, lanes: 2 },
    { id: 'e10', source: 'n3', target: 'n9', type: 'road', distance: 140, lanes: 3 },
    { id: 'e11', source: 'n3', target: 'n6', type: 'transit', distance: 200, lanes: 1 },
    { id: 'e12', source: 'n10', target: 'n5', type: 'road', distance: 180, lanes: 2 }
  ];

  defaultEdges.forEach(edge => g.addEdge(edge));

  return g;
}
