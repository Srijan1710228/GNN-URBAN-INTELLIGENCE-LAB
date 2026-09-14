import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { UrbanGraph } from '../simulation/graph';
import type { UrbanNode, UrbanEdge } from '../simulation/graph';
import { runGNNInference } from '../simulation/gnn';
import type { GNNPredictions } from '../simulation/gnn';
import { generateCity } from '../simulation/cityGenerator';
import type { CityData } from '../simulation/cityTypes';
import { SimulationEngine } from '../simulation/simulationEngine';
import type { SimState } from '../simulation/simulationEngine';
import type { GlobalMetrics } from '../simulation/metrics';
import {
  evaluateInterventionScenario
} from '../simulation/interventionGnnEngine';
import type {
  InterventionConfig,
  ScenarioImpactResult
} from '../simulation/interventionGnnEngine';

export interface InterventionLog {
  id: string;
  timestamp: string;
  type: 'ADD_EDGE' | 'REMOVE_EDGE' | 'UPDATE_NODE' | 'ADD_NODE' | 'UPDATE_ROAD' | 'ADD_TRANSIT';
  description: string;
}

export interface MapLayersConfig {
  roads: boolean;
  gnnNodes: boolean;
  gnnEdges: boolean;
  traffic: boolean;
  hop1: boolean;
  hop2: boolean;
  hop3: boolean;
  intervention: boolean;
  impactHeatmap: boolean;
  basemapStyle: 'dark' | 'satellite' | 'google';
}

const initialMetrics: GlobalMetrics = {
  vehicleCount: 0,
  averageSpeed: 45,
  averageDensity: 0,
  totalQueueLength: 0,
  averageTravelTime: 10,
  throughput: 0,
  congestionLevel: 0
};

const initialSimState = (): SimState => ({
  vehicles: [],
  timeOfDaySeconds: 6 * 3600,
  arrivedLastMinuteCount: 0,
  globalMetrics: initialMetrics,
  isPlaying: false,
  speed: 1,
  demandSetting: 'NORMAL'
});

interface AppContextType {
  seed: number;
  setSeed: (s: number) => void;
  cityData: CityData;
  regenerateCity: (newSeed?: number) => void;

  baselineGraph: UrbanGraph;
  proposedGraph: UrbanGraph;
  baselinePredictions: GNNPredictions;
  proposedPredictions: GNNPredictions;
  baselineCentrality: { closeness: Map<string, number>; degree: Map<string, number> };
  proposedCentrality: { closeness: Map<string, number>; degree: Map<string, number> };
  
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  setSelectedNodeIds: (ids: string[]) => void;
  setSelectedEdgeIds: (ids: string[]) => void;
  toggleNodeSelection: (id: string) => void;
  toggleEdgeSelection: (id: string) => void;
  clearSelection: () => void;

  gnnInfluenceHop: number;
  setGnnInfluenceHop: (hop: number) => void;
  gnnInfluenceEnabled: boolean;
  setGnnInfluenceEnabled: (enabled: boolean) => void;
  
  activeScenario: 'baseline' | 'proposed' | 'comparison';
  setActiveScenario: (scenario: 'baseline' | 'proposed' | 'comparison') => void;
  
  gnnIterations: number;
  setGnnIterations: (iters: number) => void;
  
  interventions: InterventionLog[];
  
  // Live Simulation state
  simState: SimState;
  setIsPlaying: (playing: boolean) => void;
  setSimSpeed: (speed: 1 | 2 | 5 | 10) => void;
  setDemandSetting: (demand: 'LOW' | 'NORMAL' | 'HIGH') => void;
  resetSimulation: () => void;

  viewMode: 'CITY' | 'GRAPH' | 'HYBRID';
  setViewMode: (mode: 'CITY' | 'GRAPH' | 'HYBRID') => void;
  routeStartId: string | null;
  routeEndId: string | null;
  setRouteStartId: (id: string | null) => void;
  setRouteEndId: (id: string | null) => void;

  cameraX: number;
  cameraY: number;
  cameraZoom: number;
  setCameraX: (x: number) => void;
  setCameraY: (y: number) => void;
  setCameraZoom: (z: number) => void;

  baselineCityData: CityData | null;
  baselineMetrics: any;
  saveBaselineState: () => void;
  metricsHistory: { time: string; speed: number; travelTime: number; congestion: number }[];

  addRoadIntervention: (startId: string, endId: string, roadType: 'LOCAL' | 'ARTERIAL' | 'HIGHWAY') => void;
  changeRoadCapacityIntervention: (roadId: string, newCapacity: number) => void;
  changeRoadSpeedIntervention: (roadId: string, newSpeedLimit: number) => void;
  addTransitStationIntervention: (nodeId: string) => void;

  // Graph modifications
  updateNodeFeatures: (nodeId: string, updates: Partial<Pick<UrbanNode, 'type' | 'population' | 'commercialDensity' | 'greenSpace'>>) => void;
  addNewNode: (node: Omit<UrbanNode, 'id'>) => void;
  removeNode: (nodeId: string) => void;
  addNewEdge: (edge: Omit<UrbanEdge, 'id'>) => void;
  removeEdge: (edgeId: string) => void;
  resetProposedGraph: () => void;

  // --- RESEARCH INTERVENTION ENGINE (G -> I -> G') ---
  activeIntervention: InterventionConfig | null;
  setActiveIntervention: (config: InterventionConfig | null) => void;
  scenarioResult: ScenarioImpactResult;
  applyInterventionConfig: (config: InterventionConfig) => void;
  applyRoadClosureIntervention: (edgeId: string) => void;
  applyCapacityChangeIntervention: (edgeId: string, deltaPercent: number) => void;
  clearIntervention: () => void;
  
  // Network-wide Spillover animation
  spilloverStep: number;
  setSpilloverStep: (step: number) => void;
  isSpilloverPlaying: boolean;
  playSpilloverAnimation: () => void;

  // GNN Message Passing animation
  isMessagePassingAnimating: boolean;
  messagePassingHop: number;
  triggerMessagePassingAnimation: () => void;

  // Explainability Factors
  highlightedExplainFactor: string | null;
  setHighlightedExplainFactor: (factor: string | null) => void;

  // Map Space <-> Graph Space Sync
  mapSpaceHoverId: string | null;
  setMapSpaceHoverId: (id: string | null) => void;
  graphSpaceHoverId: string | null;
  setGraphSpaceHoverId: (id: string | null) => void;
  syncMode: 'DUAL' | 'MAP_DOMINANT' | 'GRAPH_DOMINANT';
  setSyncMode: (mode: 'DUAL' | 'MAP_DOMINANT' | 'GRAPH_DOMINANT') => void;

  // Map Layers
  mapLayers: MapLayersConfig;
  setMapLayers: React.Dispatch<React.SetStateAction<MapLayersConfig>>;
  toggleLayer: (layerKey: keyof MapLayersConfig) => void;

  // 10-Step Interactive Workflow
  workflowStep: number;
  setWorkflowStep: (step: number) => void;
  nextWorkflowStep: () => void;
  prevWorkflowStep: () => void;

  // Google Maps API Key
  googleMapsApiKey: string;
  setGoogleMapsApiKey: (key: string) => void;

  // UI Drawer / Overlay controls
  bottomDrawerOpen: boolean;
  setBottomDrawerOpen: (open: boolean) => void;
  pipelineModalOpen: boolean;
  setPipelineModalOpen: (open: boolean) => void;
  futureModalOpen: boolean;
  setFutureModalOpen: (open: boolean) => void;
  mapsConfigModalOpen: boolean;
  setMapsConfigModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function convertCityToGraph(city: CityData): UrbanGraph {
  const g = new UrbanGraph();

  for (const intersection of city.intersections.values()) {
    let closestZone = city.zones[0];
    let minDist = Infinity;

    for (const zone of city.zones) {
      const dx = intersection.x - zone.x;
      const dy = intersection.y - zone.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        closestZone = zone;
      }
    }

    let nodeType: 'residential' | 'commercial' | 'industrial' | 'park' = 'residential';
    if (closestZone.type === 'COMMERCIAL') nodeType = 'commercial';
    else if (closestZone.type === 'INDUSTRIAL') nodeType = 'industrial';
    else if (closestZone.type === 'PARK') nodeType = 'park';

    let population = 40;
    let commercialDensity = 10;
    let greenSpace = 20;

    if (nodeType === 'residential') {
      population = 80;
      greenSpace = 30;
    } else if (nodeType === 'commercial') {
      commercialDensity = 90;
      population = 20;
    } else if (nodeType === 'industrial') {
      population = 5;
      commercialDensity = 20;
      greenSpace = 5;
    } else if (nodeType === 'park') {
      population = 0;
      greenSpace = 95;
    }

    g.addNode({
      id: intersection.id,
      label: `Node ${intersection.id.replace('int_', '')}`,
      x: intersection.x,
      y: intersection.y,
      type: nodeType,
      population,
      commercialDensity,
      greenSpace
    });
  }

  for (const road of city.roads.values()) {
    let edgeType: 'road' | 'transit' | 'pedestrian' = 'road';
    if (road.roadType === 'LOCAL') {
      edgeType = 'pedestrian';
    } else if (road.roadType === 'HIGHWAY') {
      edgeType = 'transit';
    }

    let lanes = 2;
    if (road.roadType === 'LOCAL') lanes = 1;
    else if (road.roadType === 'HIGHWAY') lanes = 4;

    g.addEdge({
      id: road.id,
      source: road.startNode,
      target: road.endNode,
      type: edgeType,
      distance: road.length,
      lanes
    });
  }

  return g;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seed, setSeed] = useState<number>(42);
  const [cityData, setCityData] = useState<CityData>(() => generateCity(42));
  
  const [baselineGraph, setBaselineGraph] = useState<UrbanGraph>(() => convertCityToGraph(cityData));
  const [proposedGraph, setProposedGraph] = useState<UrbanGraph>(() => convertCityToGraph(cityData));
  
  const [baselinePredictions, setBaselinePredictions] = useState<GNNPredictions>(new Map());
  const [proposedPredictions, setProposedPredictions] = useState<GNNPredictions>(new Map());
  
  const [baselineCentrality, setBaselineCentrality] = useState<{ closeness: Map<string, number>; degree: Map<string, number> }>({
    closeness: new Map(),
    degree: new Map()
  });
  const [proposedCentrality, setProposedCentrality] = useState<{ closeness: Map<string, number>; degree: Map<string, number> }>({
    closeness: new Map(),
    degree: new Map()
  });
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);
  const [gnnInfluenceHop, setGnnInfluenceHop] = useState<number>(1);
  const [gnnInfluenceEnabled, setGnnInfluenceEnabled] = useState<boolean>(true);

  const customSetSelectedNodeId = (id: string | null) => {
    setSelectedNodeId(id);
    setSelectedNodeIds(id ? [id] : []);
    if (id) {
      setGnnInfluenceEnabled(true);
    }
  };

  const customSetSelectedEdgeId = (id: string | null) => {
    setSelectedEdgeId(id);
    setSelectedEdgeIds(id ? [id] : []);
    if (id) {
      setGnnInfluenceEnabled(true);
    }
  };

  const toggleNodeSelection = (id: string) => {
    setSelectedNodeIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      setSelectedNodeId(next.length > 0 ? next[next.length - 1] : null);
      return next;
    });
  };

  const toggleEdgeSelection = (id: string) => {
    setSelectedEdgeIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      setSelectedEdgeId(next.length > 0 ? next[next.length - 1] : null);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setSelectedNodeIds([]);
    setSelectedEdgeIds([]);
    setGnnInfluenceEnabled(false);
  };

  const [activeScenario, setActiveScenario] = useState<'baseline' | 'proposed' | 'comparison'>('proposed');
  const [gnnIterations, setGnnIterations] = useState<number>(2);
  const [interventions, setInterventions] = useState<InterventionLog[]>([]);

  const [viewMode, setViewMode] = useState<'CITY' | 'GRAPH' | 'HYBRID'>('HYBRID');
  const [routeStartId, setRouteStartId] = useState<string | null>(null);
  const [routeEndId, setRouteEndId] = useState<string | null>(null);

  const [cameraX, setCameraX] = useState<number>(0);
  const [cameraY, setCameraY] = useState<number>(0);
  const [cameraZoom, setCameraZoom] = useState<number>(0.85);

  const [baselineCityData, setBaselineCityData] = useState<CityData | null>(null);
  const [baselineMetrics, setBaselineMetrics] = useState<any>(null);
  const [metricsHistory, setMetricsHistory] = useState<{ time: string; speed: number; travelTime: number; congestion: number }[]>([]);

  // Simulation State
  const [simState, setSimState] = useState<SimState>(() => initialSimState());
  const simEngine = useRef<SimulationEngine>(new SimulationEngine(42));
  const lastTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  // --- RESEARCH GNN INTERVENTION ENGINE STATE ---
  const [activeIntervention, setActiveIntervention] = useState<InterventionConfig | null>(null);
  const [scenarioResult, setScenarioResult] = useState<ScenarioImpactResult>(() => 
    evaluateInterventionScenario(baselineGraph, proposedGraph, cityData, null)
  );

  // Spillover Propagation State
  const [spilloverStep, setSpilloverStep] = useState<number>(0);
  const [isSpilloverPlaying, setIsSpilloverPlaying] = useState<boolean>(false);

  // GNN Message Passing Animation State
  const [isMessagePassingAnimating, setIsMessagePassingAnimating] = useState<boolean>(false);
  const [messagePassingHop, setMessagePassingHop] = useState<number>(1);

  // Explainability Factor Highlight
  const [highlightedExplainFactor, setHighlightedExplainFactor] = useState<string | null>(null);

  // Map Space <-> Graph Space Sync State
  const [mapSpaceHoverId, setMapSpaceHoverId] = useState<string | null>(null);
  const [graphSpaceHoverId, setGraphSpaceHoverId] = useState<string | null>(null);
  const [syncMode, setSyncMode] = useState<'DUAL' | 'MAP_DOMINANT' | 'GRAPH_DOMINANT'>('DUAL');

  // Map Layers Configuration
  const [mapLayers, setMapLayers] = useState<MapLayersConfig>({
    roads: true,
    gnnNodes: true,
    gnnEdges: true,
    traffic: true,
    hop1: true,
    hop2: true,
    hop3: true,
    intervention: true,
    impactHeatmap: true,
    basemapStyle: 'dark'
  });

  const toggleLayer = (layerKey: keyof MapLayersConfig) => {
    setMapLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Interactive 10-Step Workflow
  const [workflowStep, setWorkflowStep] = useState<number>(1);
  const nextWorkflowStep = () => setWorkflowStep(prev => Math.min(10, prev + 1));
  const prevWorkflowStep = () => setWorkflowStep(prev => Math.max(1, prev - 1));

  // Google Maps API Key
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>(() => {
    return (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  });

  // UI Modal / Drawer state
  const [bottomDrawerOpen, setBottomDrawerOpen] = useState<boolean>(true);
  const [pipelineModalOpen, setPipelineModalOpen] = useState<boolean>(false);
  const [futureModalOpen, setFutureModalOpen] = useState<boolean>(false);
  const [mapsConfigModalOpen, setMapsConfigModalOpen] = useState<boolean>(false);

  // Automatically recalculate scenario impacts when active intervention or graphs change
  useEffect(() => {
    const result = evaluateInterventionScenario(baselineGraph, proposedGraph, cityData, activeIntervention);
    setScenarioResult(result);
  }, [activeIntervention, baselineGraph, proposedGraph, cityData]);

  // Trigger Seed City Regeneration
  const regenerateCity = (newSeed?: number) => {
    const activeSeed = newSeed !== undefined ? newSeed : seed;
    if (newSeed !== undefined) {
      setSeed(newSeed);
    }
    const freshCity = generateCity(activeSeed);
    setCityData(freshCity);
    setBaselineCityData(freshCity);
    setBaselineMetrics(null);
    
    const freshGraph = convertCityToGraph(freshCity);
    setBaselineGraph(freshGraph);
    setProposedGraph(freshGraph.clone());
    
    simEngine.current = new SimulationEngine(activeSeed);
    setSimState(initialSimState());
    
    setActiveIntervention(null);
    setInterventions([]);
    clearSelection();
  };

  // Recalculate GNN predictions & Centrality metrics
  useEffect(() => {
    const basePreds = runGNNInference(baselineGraph, gnnIterations);
    const baseClose = baselineGraph.calculateClosenessCentrality();
    const baseDeg = baselineGraph.calculateDegreeCentrality();
    
    setBaselinePredictions(basePreds);
    setBaselineCentrality({ closeness: baseClose, degree: baseDeg });
  }, [baselineGraph, gnnIterations]);

  useEffect(() => {
    const propPreds = runGNNInference(proposedGraph, gnnIterations);
    const propClose = proposedGraph.calculateClosenessCentrality();
    const propDeg = proposedGraph.calculateDegreeCentrality();
    
    setProposedPredictions(propPreds);
    setProposedCentrality({ closeness: propClose, degree: propDeg });
  }, [proposedGraph, gnnIterations]);

  // Simulation Clock Tick Loop
  useEffect(() => {
    const loop = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      
      const deltaMs = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      const deltaSec = Math.min(0.1, deltaMs / 1000);

      setSimState(prev => {
        if (!prev.isPlaying) {
          lastTimeRef.current = null;
          return prev;
        }
        return simEngine.current.tick(cityData, prev, deltaSec);
      });

      frameRef.current = requestAnimationFrame(loop);
    };

    if (simState.isPlaying) {
      frameRef.current = requestAnimationFrame(loop);
    } else {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      lastTimeRef.current = null;
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [simState.isPlaying, cityData]);

  // Periodic metrics recorder
  useEffect(() => {
    if (!simState.isPlaying) return;
    const interval = setInterval(() => {
      setMetricsHistory(prev => {
        const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const next = [...prev, {
          time: timeLabel,
          speed: simState.globalMetrics.averageSpeed,
          travelTime: simState.globalMetrics.averageTravelTime,
          congestion: simState.globalMetrics.congestionLevel
        }];
        if (next.length > 30) next.shift();
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [simState.isPlaying, simState.globalMetrics]);

  const setIsPlaying = (playing: boolean) => {
    setSimState(prev => ({ ...prev, isPlaying: playing }));
  };

  const setSimSpeed = (speed: 1 | 2 | 5 | 10) => {
    setSimState(prev => ({ ...prev, speed }));
  };

  const setDemandSetting = (demandSetting: 'LOW' | 'NORMAL' | 'HIGH') => {
    setSimState(prev => ({ ...prev, demandSetting }));
  };

  const resetSimulation = () => {
    simEngine.current = new SimulationEngine(seed);
    setSimState(initialSimState());
    for (const road of cityData.roads.values()) {
      road.density = 0.2;
      road.currentFlow = road.capacity * 0.2;
      road.status = 'ACTIVE';
    }
    for (const intersection of cityData.intersections.values()) {
      intersection.trafficDensity = 0.2;
      intersection.vehicleCount = 4;
      intersection.queueLength = 1;
    }
  };

  const addInterventionLog = (type: InterventionLog['type'], description: string) => {
    const newLog: InterventionLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      description
    };
    setInterventions(prev => [newLog, ...prev]);
  };

  const cloneCityData = (city: CityData): CityData => {
    return {
      seed: city.seed,
      intersections: new Map(Array.from(city.intersections.entries()).map(([k, v]) => [k, { ...v, connectedRoads: [...v.connectedRoads] }])),
      roads: new Map(Array.from(city.roads.entries()).map(([k, v]) => [k, { ...v }])),
      buildings: city.buildings.map(b => ({ ...b })),
      zones: city.zones.map(z => ({ ...z })),
      transitStations: city.transitStations.map(s => ({ ...s })),
      signals: city.signals.map(s => ({ ...s }))
    };
  };

  const saveBaselineState = () => {
    setBaselineCityData(cloneCityData(cityData));
    setBaselineGraph(proposedGraph.clone());
    setBaselineMetrics(simState.globalMetrics);
    addInterventionLog('ADD_NODE', 'Baseline city state saved successfully.');
  };

  // --- Intervention Engine Actions ---
  const applyInterventionConfig = (config: InterventionConfig) => {
    if (!baselineCityData) {
      saveBaselineState();
    }
    setActiveIntervention(config);

    if (config.type === 'ROAD_CLOSURE' && config.targetEdgeId) {
      // Modify proposed graph
      const clone = baselineGraph.clone();
      clone.removeEdge(config.targetEdgeId);
      setProposedGraph(clone);

      // Modify city data
      const updatedCity = cloneCityData(cityData);
      const road = updatedCity.roads.get(config.targetEdgeId);
      if (road) {
        road.status = 'CLOSED';
        road.capacity = 0;
        road.currentFlow = 0;
        road.density = 1.0;
      }
      setCityData(updatedCity);
      addInterventionLog('REMOVE_EDGE', `Closed road ${config.targetRoadName || config.targetEdgeId}`);
    } else if (config.type === 'CAPACITY_REDUCTION' && config.targetEdgeId) {
      const delta = config.capacityDeltaPercent || -30;
      const factor = (100 + delta) / 100;
      
      const updatedCity = cloneCityData(cityData);
      const road = updatedCity.roads.get(config.targetEdgeId);
      if (road) {
        road.capacity = Math.round(road.capacity * factor);
        road.status = 'ACTIVE';
      }
      setCityData(updatedCity);

      const updatedGraph = convertCityToGraph(updatedCity);
      setProposedGraph(updatedGraph);
      addInterventionLog('UPDATE_ROAD', `Reduced capacity by ${Math.abs(delta)}% on ${config.targetRoadName || config.targetEdgeId}`);
    } else if (config.type === 'CAPACITY_INCREASE' && config.targetEdgeId) {
      const delta = config.capacityDeltaPercent || 30;
      const factor = (100 + delta) / 100;
      
      const updatedCity = cloneCityData(cityData);
      const road = updatedCity.roads.get(config.targetEdgeId);
      if (road) {
        road.capacity = Math.round(road.capacity * factor);
        road.status = 'ACTIVE';
      }
      setCityData(updatedCity);

      const updatedGraph = convertCityToGraph(updatedCity);
      setProposedGraph(updatedGraph);
      addInterventionLog('UPDATE_ROAD', `Expanded capacity by +${delta}% on ${config.targetRoadName || config.targetEdgeId}`);
    } else if (config.type === 'NEW_ROAD' && config.startNodeId && config.endNodeId) {
      addRoadIntervention(config.startNodeId, config.endNodeId, config.roadType || 'ARTERIAL');
    }
  };

  const applyRoadClosureIntervention = (edgeId: string) => {
    const road = cityData.roads.get(edgeId);
    applyInterventionConfig({
      id: `closure_${edgeId}_${Date.now()}`,
      type: 'ROAD_CLOSURE',
      targetEdgeId: edgeId,
      targetRoadName: road ? (road as any).name || edgeId.replace('r_', 'Road ') : edgeId,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const applyCapacityChangeIntervention = (edgeId: string, deltaPercent: number) => {
    const road = cityData.roads.get(edgeId);
    applyInterventionConfig({
      id: `cap_${edgeId}_${Date.now()}`,
      type: deltaPercent < 0 ? 'CAPACITY_REDUCTION' : 'CAPACITY_INCREASE',
      targetEdgeId: edgeId,
      targetRoadName: road ? (road as any).name || edgeId.replace('r_', 'Road ') : edgeId,
      capacityDeltaPercent: deltaPercent,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const clearIntervention = () => {
    setActiveIntervention(null);
    setProposedGraph(baselineGraph.clone());
    if (baselineCityData) {
      setCityData(cloneCityData(baselineCityData));
    }
    setSpilloverStep(0);
    setIsSpilloverPlaying(false);
  };

  // Spillover propagation animation
  const playSpilloverAnimation = () => {
    setIsSpilloverPlaying(true);
    setSpilloverStep(1);

    const stepSequence = [1, 2, 3, 4, 5];
    let idx = 0;

    const interval = setInterval(() => {
      idx++;
      if (idx < stepSequence.length) {
        setSpilloverStep(stepSequence[idx]);
      } else {
        clearInterval(interval);
        setIsSpilloverPlaying(false);
      }
    }, 1200);
  };

  // GNN message passing animation
  const triggerMessagePassingAnimation = () => {
    setIsMessagePassingAnimating(true);
    setMessagePassingHop(1);

    setTimeout(() => setMessagePassingHop(2), 1000);
    setTimeout(() => setMessagePassingHop(3), 2000);
    setTimeout(() => {
      setIsMessagePassingAnimating(false);
      setMessagePassingHop(1);
    }, 3200);
  };

  const addRoadIntervention = (startId: string, endId: string, roadType: 'LOCAL' | 'ARTERIAL' | 'HIGHWAY') => {
    if (!baselineCityData) {
      saveBaselineState();
    }

    const updatedCity = cloneCityData(cityData);
    const startNode = updatedCity.intersections.get(startId);
    const endNode = updatedCity.intersections.get(endId);

    if (!startNode || !endNode) return;

    const roadId = `road_${startId.replace('int_', '')}_to_${endId.replace('int_', '')}`;
    if (updatedCity.roads.has(roadId)) return;

    const dist = Math.sqrt((startNode.x - endNode.x) ** 2 + (startNode.y - endNode.y) ** 2);

    let capacity = 1000;
    let speedLimit = 30;
    let lanes = 1;

    if (roadType === 'HIGHWAY') {
      capacity = 4000;
      speedLimit = 80;
      lanes = 4;
    } else if (roadType === 'ARTERIAL') {
      capacity = 2500;
      speedLimit = 50;
      lanes = 2;
    }

    const newRoad = {
      id: roadId,
      startNode: startId,
      endNode: endId,
      length: dist,
      capacity,
      speedLimit,
      currentFlow: 0,
      density: 0,
      travelTime: dist / (speedLimit / 3.6),
      roadType,
      lanes,
      status: 'ACTIVE' as const
    };

    updatedCity.roads.set(roadId, newRoad);
    startNode.connectedRoads.push(roadId);
    endNode.connectedRoads.push(roadId);

    setCityData(updatedCity);
    const updatedGraph = convertCityToGraph(updatedCity);
    setProposedGraph(updatedGraph);

    addInterventionLog('ADD_EDGE', `Connected node ${startId.replace('int_', '')} and ${endId.replace('int_', '')} with new ${roadType}`);
  };

  const changeRoadCapacityIntervention = (roadId: string, newCapacity: number) => {
    if (!baselineCityData) {
      saveBaselineState();
    }

    const updatedCity = cloneCityData(cityData);
    const road = updatedCity.roads.get(roadId);
    if (!road) return;

    road.capacity = newCapacity;
    setCityData(updatedCity);

    const updatedGraph = convertCityToGraph(updatedCity);
    setProposedGraph(updatedGraph);

    addInterventionLog('UPDATE_ROAD', `Set capacity of road ${roadId} to ${newCapacity} veh/h`);
  };

  const changeRoadSpeedIntervention = (roadId: string, newSpeedLimit: number) => {
    if (!baselineCityData) {
      saveBaselineState();
    }

    const updatedCity = cloneCityData(cityData);
    const road = updatedCity.roads.get(roadId);
    if (!road) return;

    road.speedLimit = newSpeedLimit;
    road.travelTime = road.length / (newSpeedLimit / 3.6);
    setCityData(updatedCity);

    const updatedGraph = convertCityToGraph(updatedCity);
    setProposedGraph(updatedGraph);

    addInterventionLog('UPDATE_ROAD', `Set speed limit of road ${roadId} to ${newSpeedLimit} km/h`);
  };

  const addTransitStationIntervention = (nodeId: string) => {
    if (!baselineCityData) {
      saveBaselineState();
    }

    const updatedCity = cloneCityData(cityData);
    const node = updatedCity.intersections.get(nodeId);
    if (!node) return;

    if (updatedCity.transitStations.some(s => s.id === `station_${nodeId}`)) return;

    const newStation = {
      id: `station_${nodeId}`,
      name: `Metro Hub ${nodeId.replace('int_', '')}`,
      x: node.x,
      y: node.y,
      line: 'Orange Line',
      capacity: 500
    };

    updatedCity.transitStations.push(newStation);
    setCityData(updatedCity);

    const updatedGraph = convertCityToGraph(updatedCity);
    setProposedGraph(updatedGraph);

    addInterventionLog('ADD_TRANSIT', `Upgraded intersection ${nodeId.replace('int_', '')} to Transit Station`);
  };

  const updateNodeFeatures = (nodeId: string, updates: Partial<Pick<UrbanNode, 'type' | 'population' | 'commercialDensity' | 'greenSpace'>>) => {
    const clone = proposedGraph.clone();
    const node = clone.nodes.get(nodeId);
    if (node) {
      Object.assign(node, updates);
      clone.nodes.set(nodeId, node);
      setProposedGraph(clone);
      addInterventionLog('UPDATE_NODE', `Updated features on node "${node.label}"`);
    }
  };

  const addNewNode = (nodeData: Omit<UrbanNode, 'id'>) => {
    const clone = proposedGraph.clone();
    const newId = `n_${Date.now()}`;
    const newNode: UrbanNode = { ...nodeData, id: newId };
    clone.addNode(newNode);
    setProposedGraph(clone);
    setSelectedNodeId(newId);
    addInterventionLog('ADD_NODE', `Added new node "${newNode.label}"`);
  };

  const removeNode = (nodeId: string) => {
    const clone = proposedGraph.clone();
    const node = clone.nodes.get(nodeId);
    if (node) {
      clone.removeNode(nodeId);
      setProposedGraph(clone);
      if (selectedNodeId === nodeId) setSelectedNodeId(null);
      addInterventionLog('REMOVE_EDGE', `Removed node "${node.label}" and all connected paths`);
    }
  };

  const addNewEdge = (edgeData: Omit<UrbanEdge, 'id'>) => {
    const clone = proposedGraph.clone();
    const newId = `e_${Date.now()}`;
    const newEdge: UrbanEdge = { ...edgeData, id: newId };
    clone.addEdge(newEdge);
    setProposedGraph(clone);
    setSelectedEdgeId(newId);
    
    const srcNode = clone.nodes.get(edgeData.source);
    const tgtNode = clone.nodes.get(edgeData.target);
    addInterventionLog('ADD_EDGE', `Connected "${srcNode?.label || edgeData.source}" and "${tgtNode?.label || edgeData.target}"`);
  };

  const removeEdge = (edgeId: string) => {
    const clone = proposedGraph.clone();
    const edge = clone.edges.get(edgeId);
    if (edge) {
      clone.removeEdge(edgeId);
      setProposedGraph(clone);
      if (selectedEdgeId === edgeId) setSelectedEdgeId(null);
      
      const srcNode = clone.nodes.get(edge.source);
      const tgtNode = clone.nodes.get(edge.target);
      addInterventionLog('REMOVE_EDGE', `Severed path between "${srcNode?.label}" and "${tgtNode?.label}"`);
    }
  };

  const resetProposedGraph = () => {
    setProposedGraph(baselineGraph.clone());
    setActiveIntervention(null);
    setInterventions([]);
    clearSelection();
  };

  return (
    <AppContext.Provider value={{
      seed,
      setSeed,
      cityData,
      regenerateCity,
      baselineGraph,
      proposedGraph,
      baselinePredictions,
      proposedPredictions,
      baselineCentrality,
      proposedCentrality,
      selectedNodeId,
      selectedEdgeId,
      setSelectedNodeId: customSetSelectedNodeId,
      setSelectedEdgeId: customSetSelectedEdgeId,
      selectedNodeIds,
      setSelectedNodeIds,
      selectedEdgeIds,
      setSelectedEdgeIds,
      toggleNodeSelection,
      toggleEdgeSelection,
      clearSelection,
      gnnInfluenceHop,
      setGnnInfluenceHop,
      gnnInfluenceEnabled,
      setGnnInfluenceEnabled,
      activeScenario,
      setActiveScenario,
      gnnIterations,
      setGnnIterations,
      interventions,
      
      simState,
      setIsPlaying,
      setSimSpeed,
      setDemandSetting,
      resetSimulation,

      viewMode,
      setViewMode,
      routeStartId,
      routeEndId,
      setRouteStartId,
      setRouteEndId,

      cameraX,
      cameraY,
      cameraZoom,
      setCameraX,
      setCameraY,
      setCameraZoom,

      baselineCityData,
      baselineMetrics,
      saveBaselineState,
      metricsHistory,

      addRoadIntervention,
      changeRoadCapacityIntervention,
      changeRoadSpeedIntervention,
      addTransitStationIntervention,

      updateNodeFeatures,
      addNewNode,
      removeNode,
      addNewEdge,
      removeEdge,
      resetProposedGraph,

      // Research Intervention Engine
      activeIntervention,
      setActiveIntervention,
      scenarioResult,
      applyInterventionConfig,
      applyRoadClosureIntervention,
      applyCapacityChangeIntervention,
      clearIntervention,

      // Spillover
      spilloverStep,
      setSpilloverStep,
      isSpilloverPlaying,
      playSpilloverAnimation,

      // GNN Message Passing
      isMessagePassingAnimating,
      messagePassingHop,
      triggerMessagePassingAnimation,

      // Explainability
      highlightedExplainFactor,
      setHighlightedExplainFactor,

      // Map Space <-> Graph Space Sync
      mapSpaceHoverId,
      setMapSpaceHoverId,
      graphSpaceHoverId,
      setGraphSpaceHoverId,
      syncMode,
      setSyncMode,

      // Map Layers
      mapLayers,
      setMapLayers,
      toggleLayer,

      // 10-Step Interactive Workflow
      workflowStep,
      setWorkflowStep,
      nextWorkflowStep,
      prevWorkflowStep,

      // Google Maps API Key
      googleMapsApiKey,
      setGoogleMapsApiKey,

      // Drawers & Modals
      bottomDrawerOpen,
      setBottomDrawerOpen,
      pipelineModalOpen,
      setPipelineModalOpen,
      futureModalOpen,
      setFutureModalOpen,
      mapsConfigModalOpen,
      setMapsConfigModalOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
