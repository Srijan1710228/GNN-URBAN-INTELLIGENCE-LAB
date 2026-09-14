import { UrbanGraph } from './graph';

export interface GNNPrediction {
  trafficCongestion: number;  // 0 to 100
  commercialActivity: number; // 0 to 100
  environmentalStress: number;// 0 to 100
}

export type GNNPredictions = Map<string, GNNPrediction>;

// Simple weight matrices for MPNN layers
// We simulate W_self and W_neighbor transformations
// Features: [population, commercialDensity, greenSpace, typeIndex]
// typeIndex: 0=residential, 1=commercial, 2=industrial, 3=park
const W_SELF = [
  [0.6, 0.1, 0.0, 0.0], // influence on population / congestion density
  [0.1, 0.8, -0.2, 0.0], // influence on commercial activity
  [-0.1, -0.2, 0.9, 0.0], // influence on environmental stress / quality
  [0.0, 0.0, 0.0, 1.0]  // zone type keeper
];

const W_NEIGHBOR = [
  [0.3, 0.4, -0.1, 0.0], // neighbor influence on local congestion
  [0.4, 0.3, 0.0, 0.0],  // neighbor influence on local commercial interest
  [0.5, 0.2, -0.4, 0.0], // neighbor industrial activity increases local stress, parks decrease it
  [0.0, 0.0, 0.0, 0.0]
];

function getZoneIndex(type: string): number {
  switch (type) {
    case 'residential': return 0;
    case 'commercial': return 1;
    case 'industrial': return 2;
    case 'park': return 3;
    default: return 0;
  }
}

export function runGNNInference(graph: UrbanGraph, iterations: number = 2): GNNPredictions {
  const nodeIds = Array.from(graph.nodes.keys());
  const predictions: GNNPredictions = new Map();

  // Initial node states (H^0)
  // Feature vector shape: [population, commercialDensity, greenSpace, zoneIndex]
  let H = new Map<string, number[]>();
  for (const [id, node] of graph.nodes.entries()) {
    H.set(id, [
      node.population / 100,
      node.commercialDensity / 100,
      node.greenSpace / 100,
      getZoneIndex(node.type)
    ]);
  }

  // MPNN Message Passing loop
  for (let step = 0; step < iterations; step++) {
    const nextH = new Map<string, number[]>();

    for (const nodeId of nodeIds) {
      const selfState = H.get(nodeId)!;
      const neighbors = graph.getNeighbors(nodeId);

      // Aggregate neighbor messages
      const neighborSum = [0, 0, 0, 0];
      if (neighbors.length > 0) {
        for (const neighborId of neighbors) {
          const neighborState = H.get(neighborId)!;
          for (let f = 0; f < 3; f++) {
            neighborSum[f] += neighborState[f];
          }
        }
        // Normalize (average aggregation)
        for (let f = 0; f < 3; f++) {
          neighborSum[f] /= neighbors.length;
        }
      }

      // Linear transforms
      const selfTransformed = [0, 0, 0, 0];
      const neighborTransformed = [0, 0, 0, 0];

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          selfTransformed[i] += selfState[j] * W_SELF[i][j];
          neighborTransformed[i] += neighborSum[j] * W_NEIGHBOR[i][j];
        }
      }

      // Combine and apply activation (ReLU / Sigmoid simulation)
      const combined = [0, 0, 0, 0];
      for (let f = 0; f < 3; f++) {
        const val = selfTransformed[f] + neighborTransformed[f];
        // Sigmoid mapping: 1 / (1 + exp(-val))
        combined[f] = 1 / (1 + Math.exp(-val * 2.5));
      }
      combined[3] = selfState[3]; // Preserve zone index

      nextH.set(nodeId, combined);
    }

    H = nextH;
  }

  // Calculate final predictions mapping to 0-100 scale
  for (const [nodeId, finalState] of H.entries()) {
    const node = graph.nodes.get(nodeId)!;
    const neighbors = graph.getNeighbors(nodeId);

    // Heuristics with GNN states to make output metrics realistic and responsive:
    
    // 1. Traffic Congestion: driven by local commercial density, high neighboring population, 
    // and bottlenecked connectivity (lower degree centrality increases congestion)
    const degree = neighbors.length;
    const degreePenalty = degree > 0 ? (3 / degree) * 0.15 : 0.5;
    let rawTraffic = (finalState[0] * 0.4 + finalState[1] * 0.5 + degreePenalty) * 100;
    if (node.type === 'park') rawTraffic *= 0.15; // parks have minimal traffic
    if (node.type === 'industrial') rawTraffic *= 0.7; // moderate heavy traffic
    
    // 2. Commercial Activity: high in commercial zone, boosted by nearby population density
    let rawCommercial = (finalState[1] * 0.7 + finalState[0] * 0.3) * 100;
    if (node.type === 'park') rawCommercial *= 0.1;

    // 3. Environmental Stress: driven by industrial presence and traffic congestion, negated by greenSpace
    let rawStress = (finalState[0] * 0.25 + (node.type === 'industrial' ? 0.6 : 0.0) + (rawTraffic / 200)) * 100;
    rawStress -= finalState[2] * 70; // offset by local green space GNN features
    
    // Clamp values between 0 and 100
    predictions.set(nodeId, {
      trafficCongestion: Math.min(100, Math.max(0, Math.round(rawTraffic))),
      commercialActivity: Math.min(100, Math.max(0, Math.round(rawCommercial))),
      environmentalStress: Math.min(100, Math.max(0, Math.round(rawStress)))
    });
  }

  return predictions;
}
