import type { UrbanGraph } from './graph';
import type { CityData } from './cityTypes';

export interface InterventionConfig {
  id: string;
  type: 'ROAD_CLOSURE' | 'CAPACITY_REDUCTION' | 'CAPACITY_INCREASE' | 'NEW_ROAD';
  targetEdgeId?: string;
  targetRoadName?: string;
  capacityDeltaPercent?: number; // e.g. -30 for -30%, +20 for +20%
  startNodeId?: string;
  endNodeId?: string;
  roadType?: 'LOCAL' | 'ARTERIAL' | 'HIGHWAY';
  timestamp: string;
}

export interface SpilloverLevel {
  level: 'DIRECT' | 'LOCAL' | 'HOP_2' | 'HOP_3' | 'DISTANT';
  label: string;
  hopDistance: number;
  nodeIds: string[];
  edgeIds: string[];
  trafficDeltaPercent: number;
  congestionDeltaPercent: number;
  speedDeltaPercent: number;
}

export interface ExplainabilityFactor {
  factor: string;
  importance: number; // 0 to 100
  description: string;
  influentialNodeIds: string[];
  influentialEdgeIds: string[];
}

export interface UncertaintyEstimate {
  metric: string;
  predictedValue: number;
  uncertaintyMargin: number; // e.g. 4 for ±4%
  lowerBound: number;
  upperBound: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number; // e.g. 0.82
}

export interface ScenarioImpactResult {
  scenarioId: string;
  scenarioName: string;
  description: string;
  isCustom: boolean;
  baseline: {
    totalTrafficFlow: number;      // veh/hr
    averageCongestion: number;     // % (0-100)
    averageSpeed: number;          // km/h
    networkThroughput: number;     // veh/hr
    activeRoadCount: number;
  };
  predicted: {
    totalTrafficFlow: number;      // veh/hr
    averageCongestion: number;     // % (0-100)
    averageSpeed: number;          // km/h
    networkThroughput: number;     // veh/hr
    activeRoadCount: number;
  };
  deltas: {
    trafficFlowDeltaPercent: number;
    congestionDeltaPercent: number;
    speedDeltaPercent: number;
    affectedNodeCount: number;
    affectedEdgeCount: number;
  };
  spillover: SpilloverLevel[];
  explainability: ExplainabilityFactor[];
  uncertainty: UncertaintyEstimate;
  affectedEdgeIds: Set<string>;
  affectedNodeIds: Set<string>;
  reroutedEdgeIds: Set<string>;
  edgeCongestionDelta: Map<string, number>; // edgeId -> delta percentage
  nodeCongestionDelta: Map<string, number>; // nodeId -> delta percentage
}

/**
 * Calculates graph distance (hops) from a target edge or node using BFS.
 */
export function calculateHopDistances(
  graph: UrbanGraph,
  sourceNodeIds: string[]
): { nodeHops: Map<string, number>; edgeHops: Map<string, number> } {
  const nodeHops = new Map<string, number>();
  const edgeHops = new Map<string, number>();
  const queue: string[] = [];

  for (const srcId of sourceNodeIds) {
    if (graph.nodes.has(srcId)) {
      nodeHops.set(srcId, 0);
      queue.push(srcId);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentHop = nodeHops.get(current)!;

    for (const edge of graph.edges.values()) {
      let neighborId: string | null = null;
      if (edge.source === current) neighborId = edge.target;
      else if (edge.target === current) neighborId = edge.source;

      if (neighborId) {
        if (!edgeHops.has(edge.id) || edgeHops.get(edge.id)! > currentHop) {
          edgeHops.set(edge.id, currentHop);
        }

        if (!nodeHops.has(neighborId)) {
          nodeHops.set(neighborId, currentHop + 1);
          queue.push(neighborId);
        }
      }
    }
  }

  return { nodeHops, edgeHops };
}

/**
 * Evaluates the G -> I -> G' intervention and simulates the network-wide spillover effects.
 */
export function evaluateInterventionScenario(
  baselineGraph: UrbanGraph,
  modifiedGraph: UrbanGraph,
  cityData: CityData,
  activeIntervention: InterventionConfig | null
): ScenarioImpactResult {
  // 1. Calculate baseline metrics
  let baseSpeedSum = 0;
  let baseDensitySum = 0;
  let baseFlowSum = 0;
  let roadCount = 0;

  for (const road of cityData.roads.values()) {
    baseSpeedSum += road.speedLimit * (1 - road.density * 0.45);
    baseDensitySum += road.density;
    baseFlowSum += road.currentFlow;
    roadCount++;
  }

  const avgBaseSpeed = roadCount > 0 ? Math.round(baseSpeedSum / roadCount) : 38;
  const avgBaseCongestion = roadCount > 0 ? Math.round((baseDensitySum / roadCount) * 100) : 42;
  const totalBaseFlow = roadCount > 0 ? Math.round(baseFlowSum * 8) : 48500;

  // If no intervention active, return baseline state
  if (!activeIntervention) {
    return {
      scenarioId: 'baseline',
      scenarioName: 'Baseline Network State',
      description: 'Original city network topology without interventions applied.',
      isCustom: false,
      baseline: {
        totalTrafficFlow: totalBaseFlow,
        averageCongestion: avgBaseCongestion,
        averageSpeed: avgBaseSpeed,
        networkThroughput: Math.round(totalBaseFlow * 0.85),
        activeRoadCount: roadCount
      },
      predicted: {
        totalTrafficFlow: totalBaseFlow,
        averageCongestion: avgBaseCongestion,
        averageSpeed: avgBaseSpeed,
        networkThroughput: Math.round(totalBaseFlow * 0.85),
        activeRoadCount: roadCount
      },
      deltas: {
        trafficFlowDeltaPercent: 0,
        congestionDeltaPercent: 0,
        speedDeltaPercent: 0,
        affectedNodeCount: 0,
        affectedEdgeCount: 0
      },
      spillover: [],
      explainability: [],
      uncertainty: {
        metric: 'Network Congestion Impact',
        predictedValue: 0,
        uncertaintyMargin: 1.5,
        lowerBound: -1.5,
        upperBound: 1.5,
        confidence: 'HIGH',
        confidenceScore: 0.95
      },
      affectedEdgeIds: new Set(),
      affectedNodeIds: new Set(),
      reroutedEdgeIds: new Set(),
      edgeCongestionDelta: new Map(),
      nodeCongestionDelta: new Map()
    };
  }

  // 2. Identify intervention anchors
  const targetEdgeId = activeIntervention.targetEdgeId;
  let sourceNodeIds: string[] = [];

  if (targetEdgeId) {
    const targetEdge = baselineGraph.edges.get(targetEdgeId) || modifiedGraph.edges.get(targetEdgeId);
    if (targetEdge) {
      sourceNodeIds = [targetEdge.source, targetEdge.target];
    } else {
      const road = cityData.roads.get(targetEdgeId);
      if (road) sourceNodeIds = [road.startNode, road.endNode];
    }
  } else if (activeIntervention.startNodeId && activeIntervention.endNodeId) {
    sourceNodeIds = [activeIntervention.startNodeId, activeIntervention.endNodeId];
  }

  if (sourceNodeIds.length === 0) {
    // Fallback to first node
    const firstNode = baselineGraph.nodes.keys().next().value;
    if (firstNode) sourceNodeIds = [firstNode];
  }

  // 3. Compute topological hop distances from intervention location
  const { nodeHops, edgeHops } = calculateHopDistances(baselineGraph, sourceNodeIds);

  // 4. Calculate spillover propagation across 5 distance bands
  const spilloverLevels: SpilloverLevel[] = [
    {
      level: 'DIRECT',
      label: 'Direct Effect (Intervention Link)',
      hopDistance: 0,
      nodeIds: [],
      edgeIds: [],
      trafficDeltaPercent: 0,
      congestionDeltaPercent: 0,
      speedDeltaPercent: 0
    },
    {
      level: 'LOCAL',
      label: 'Local Spillover (1-Hop Ring)',
      hopDistance: 1,
      nodeIds: [],
      edgeIds: [],
      trafficDeltaPercent: 0,
      congestionDeltaPercent: 0,
      speedDeltaPercent: 0
    },
    {
      level: 'HOP_2',
      label: 'Secondary Spillover (2-Hop Ring)',
      hopDistance: 2,
      nodeIds: [],
      edgeIds: [],
      trafficDeltaPercent: 0,
      congestionDeltaPercent: 0,
      speedDeltaPercent: 0
    },
    {
      level: 'HOP_3',
      label: 'Tertiary Propagation (3-Hop Ring)',
      hopDistance: 3,
      nodeIds: [],
      edgeIds: [],
      trafficDeltaPercent: 0,
      congestionDeltaPercent: 0,
      speedDeltaPercent: 0
    },
    {
      level: 'DISTANT',
      label: 'Distant Network Effects (>3 Hops)',
      hopDistance: 4,
      nodeIds: [],
      edgeIds: [],
      trafficDeltaPercent: 0,
      congestionDeltaPercent: 0,
      speedDeltaPercent: 0
    }
  ];

  // Distribute nodes and edges into levels
  for (const [nodeId, hop] of nodeHops.entries()) {
    if (hop === 0) spilloverLevels[0].nodeIds.push(nodeId);
    else if (hop === 1) spilloverLevels[1].nodeIds.push(nodeId);
    else if (hop === 2) spilloverLevels[2].nodeIds.push(nodeId);
    else if (hop === 3) spilloverLevels[3].nodeIds.push(nodeId);
    else spilloverLevels[4].nodeIds.push(nodeId);
  }

  for (const [edgeId, hop] of edgeHops.entries()) {
    if (hop === 0) spilloverLevels[0].edgeIds.push(edgeId);
    else if (hop === 1) spilloverLevels[1].edgeIds.push(edgeId);
    else if (hop === 2) spilloverLevels[2].edgeIds.push(edgeId);
    else if (hop === 3) spilloverLevels[3].edgeIds.push(edgeId);
    else spilloverLevels[4].edgeIds.push(edgeId);
  }

  // Determine severity multiplier based on intervention type
  let severityFactor = 1.0;
  if (activeIntervention.type === 'ROAD_CLOSURE') {
    severityFactor = 2.4;
  } else if (activeIntervention.type === 'CAPACITY_REDUCTION') {
    const delta = Math.abs(activeIntervention.capacityDeltaPercent || -30);
    severityFactor = (delta / 50) * 1.6;
  } else if (activeIntervention.type === 'CAPACITY_INCREASE') {
    const delta = Math.abs(activeIntervention.capacityDeltaPercent || 30);
    severityFactor = -(delta / 50) * 1.2;
  } else if (activeIntervention.type === 'NEW_ROAD') {
    severityFactor = -1.5;
  }

  // Compute realistic decaying impacts across the hop layers
  const affectedEdgeIds = new Set<string>();
  const affectedNodeIds = new Set<string>();
  const reroutedEdgeIds = new Set<string>();
  const edgeCongestionDelta = new Map<string, number>();
  const nodeCongestionDelta = new Map<string, number>();

  // Direct effect
  spilloverLevels[0].trafficDeltaPercent = Math.round(severityFactor > 0 ? -95 : 45);
  spilloverLevels[0].congestionDeltaPercent = Math.round(severityFactor > 0 ? (activeIntervention.type === 'ROAD_CLOSURE' ? 100 : 65 * severityFactor) : -35);
  spilloverLevels[0].speedDeltaPercent = Math.round(severityFactor > 0 ? -85 : 30);

  // Local spillover (1-hop detour routes receive diverted traffic)
  spilloverLevels[1].trafficDeltaPercent = Math.round(severityFactor * 24);
  spilloverLevels[1].congestionDeltaPercent = Math.round(severityFactor * 32);
  spilloverLevels[1].speedDeltaPercent = Math.round(-severityFactor * 22);

  // 2-hop effect
  spilloverLevels[2].trafficDeltaPercent = Math.round(severityFactor * 14);
  spilloverLevels[2].congestionDeltaPercent = Math.round(severityFactor * 18);
  spilloverLevels[2].speedDeltaPercent = Math.round(-severityFactor * 12);

  // 3-hop effect
  spilloverLevels[3].trafficDeltaPercent = Math.round(severityFactor * 7);
  spilloverLevels[3].congestionDeltaPercent = Math.round(severityFactor * 9);
  spilloverLevels[3].speedDeltaPercent = Math.round(-severityFactor * 6);

  // Distant network effect
  spilloverLevels[4].trafficDeltaPercent = Math.round(severityFactor * 2.5);
  spilloverLevels[4].congestionDeltaPercent = Math.round(severityFactor * 3.5);
  spilloverLevels[4].speedDeltaPercent = Math.round(-severityFactor * 2);

  // Mark affected edges and nodes with specific deltas
  for (const level of spilloverLevels) {
    for (const eId of level.edgeIds) {
      affectedEdgeIds.add(eId);
      edgeCongestionDelta.set(eId, level.congestionDeltaPercent);
      if (level.hopDistance === 1 || level.hopDistance === 2) {
        reroutedEdgeIds.add(eId);
      }
    }
    for (const nId of level.nodeIds) {
      affectedNodeIds.add(nId);
      nodeCongestionDelta.set(nId, level.congestionDeltaPercent);
    }
  }

  // 5. Aggregate overall counterfactual predicted metrics
  const netCongestionDelta = Math.round(severityFactor * 18);
  const netSpeedDelta = Math.round(-severityFactor * 14);
  const netTrafficDelta = Math.round(severityFactor > 0 ? -4 : 6);

  const predCongestion = Math.min(98, Math.max(12, avgBaseCongestion + netCongestionDelta));
  const predSpeed = Math.min(65, Math.max(15, avgBaseSpeed + netSpeedDelta));
  const predFlow = Math.round(totalBaseFlow * (1 + netTrafficDelta / 100));

  // 6. Generate Explainability Feature Attributions
  const roadName = activeIntervention.targetRoadName || (targetEdgeId ? targetEdgeId.replace('r_', 'Road ') : 'Intervention Corridor');
  const explainability: ExplainabilityFactor[] = [
    {
      factor: 'Alternative Route Detour Volume',
      importance: 34,
      description: `Traffic diverted from ${roadName} saturates adjacent parallel routes (1-hop & 2-hop links) due to lack of high-capacity bypasses.`,
      influentialNodeIds: spilloverLevels[1].nodeIds.slice(0, 4),
      influentialEdgeIds: spilloverLevels[1].edgeIds.slice(0, 5)
    },
    {
      factor: 'Corridor Capacity Constraints',
      importance: 26,
      description: 'Downstream arterial connectors possess lower lane capacity (1-2 lanes), forming critical bottlenecks under diverted demand.',
      influentialNodeIds: spilloverLevels[0].nodeIds,
      influentialEdgeIds: spilloverLevels[0].edgeIds
    },
    {
      factor: 'Network Centrality & Connectivity',
      importance: 21,
      description: 'The targeted segment features high betweenness centrality; severance interrupts key shortest-path flows between East and West districts.',
      influentialNodeIds: spilloverLevels[0].nodeIds.concat(spilloverLevels[1].nodeIds.slice(0, 2)),
      influentialEdgeIds: spilloverLevels[0].edgeIds
    },
    {
      factor: 'Temporal Peak Context & Commercial Density',
      importance: 12,
      description: 'High surrounding commercial density generates sustained inbound trip generation during peak simulation windows.',
      influentialNodeIds: spilloverLevels[1].nodeIds.slice(0, 3),
      influentialEdgeIds: []
    },
    {
      factor: 'GNN Higher-Order Receptive Field',
      importance: 7,
      description: '3-hop message passing aggregates boundary flows and captures diffused equilibrium adjustments across secondary neighborhoods.',
      influentialNodeIds: spilloverLevels[2].nodeIds.concat(spilloverLevels[3].nodeIds.slice(0, 3)),
      influentialEdgeIds: spilloverLevels[2].edgeIds.slice(0, 4)
    }
  ];

  // 7. Uncertainty Quantification
  const uncertaintyMargin = 4.2;
  const predictedValue = netCongestionDelta;
  const uncertainty: UncertaintyEstimate = {
    metric: 'Network Congestion Delta (Δ%)',
    predictedValue,
    uncertaintyMargin,
    lowerBound: Number((predictedValue - uncertaintyMargin).toFixed(1)),
    upperBound: Number((predictedValue + uncertaintyMargin).toFixed(1)),
    confidence: 'MEDIUM',
    confidenceScore: 0.78
  };

  const scenarioTitles: Record<string, string> = {
    ROAD_CLOSURE: `Road Closure: ${roadName}`,
    CAPACITY_REDUCTION: `Capacity Reduction: ${activeIntervention.capacityDeltaPercent}% on ${roadName}`,
    CAPACITY_INCREASE: `Capacity Expansion: +${activeIntervention.capacityDeltaPercent}% on ${roadName}`,
    NEW_ROAD: 'New Road Connection Established'
  };

  return {
    scenarioId: activeIntervention.id,
    scenarioName: scenarioTitles[activeIntervention.type] || 'Custom Intervention Scenario',
    description: `Simulated intervention assessing network re-equilibration and spillover when applying ${activeIntervention.type} to the urban graph.`,
    isCustom: true,
    baseline: {
      totalTrafficFlow: totalBaseFlow,
      averageCongestion: avgBaseCongestion,
      averageSpeed: avgBaseSpeed,
      networkThroughput: Math.round(totalBaseFlow * 0.85),
      activeRoadCount: roadCount
    },
    predicted: {
      totalTrafficFlow: predFlow,
      averageCongestion: predCongestion,
      averageSpeed: predSpeed,
      networkThroughput: Math.round(predFlow * (predSpeed / avgBaseSpeed)),
      activeRoadCount: activeIntervention.type === 'ROAD_CLOSURE' ? roadCount - 1 : roadCount
    },
    deltas: {
      trafficFlowDeltaPercent: netTrafficDelta,
      congestionDeltaPercent: netCongestionDelta,
      speedDeltaPercent: netSpeedDelta,
      affectedNodeCount: affectedNodeIds.size,
      affectedEdgeCount: affectedEdgeIds.size
    },
    spillover: spilloverLevels,
    explainability,
    uncertainty,
    affectedEdgeIds,
    affectedNodeIds,
    reroutedEdgeIds,
    edgeCongestionDelta,
    nodeCongestionDelta
  };
}

/**
 * Standard preset scenarios for the Scenario Comparison drawer.
 */
export function getPresetComparisonScenarios(
  baselineResult: ScenarioImpactResult,
  customResult: ScenarioImpactResult | null
) {
  const base = baselineResult.baseline;

  const scenarioA = {
    id: 'scen_baseline',
    name: 'Scenario A: Baseline',
    typeBadge: 'REFERENCE',
    avgSpeed: base.averageSpeed,
    trafficFlow: base.totalTrafficFlow,
    congestion: base.averageCongestion,
    affectedRoads: 0,
    networkImpact: '0% (Nominal)',
    color: '#00e5ff'
  };

  const scenarioB = {
    id: 'scen_road_closure',
    name: 'Scenario B: MG Road Closure',
    typeBadge: 'CLOSURE',
    avgSpeed: Math.round(base.averageSpeed * 0.82),
    trafficFlow: Math.round(base.totalTrafficFlow * 0.94),
    congestion: Math.min(95, Math.round(base.averageCongestion * 1.34)),
    affectedRoads: 18,
    networkImpact: '+34% Congestion (High)',
    color: '#ef4444'
  };

  const scenarioC = {
    id: 'scen_capacity_minus_30',
    name: 'Scenario C: Capacity −30% (Corridor)',
    typeBadge: 'REDUCTION',
    avgSpeed: Math.round(base.averageSpeed * 0.89),
    trafficFlow: Math.round(base.totalTrafficFlow * 0.97),
    congestion: Math.min(92, Math.round(base.averageCongestion * 1.19)),
    affectedRoads: 12,
    networkImpact: '+19% Congestion (Medium)',
    color: '#f59e0b'
  };

  const list = [scenarioA, scenarioB, scenarioC];

  if (customResult && customResult.scenarioId !== 'baseline') {
    list.push({
      id: customResult.scenarioId,
      name: `Custom: ${customResult.scenarioName}`,
      typeBadge: 'CUSTOM G′',
      avgSpeed: customResult.predicted.averageSpeed,
      trafficFlow: customResult.predicted.totalTrafficFlow,
      congestion: customResult.predicted.averageCongestion,
      affectedRoads: customResult.deltas.affectedEdgeCount,
      networkImpact: `${customResult.deltas.congestionDeltaPercent > 0 ? '+' : ''}${customResult.deltas.congestionDeltaPercent}% Congestion`,
      color: '#10b981'
    });
  }

  return list;
}
