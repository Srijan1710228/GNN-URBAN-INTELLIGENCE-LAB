import type { CityData } from './cityTypes';
import type { GlobalMetrics } from './metrics';
import { SimulationEngine } from './simulationEngine';
import type { SimState } from './simulationEngine';
import { runGNNInference } from './gnn';
import { UrbanGraph } from './graph';
import { convertCityToGraph } from '../context/AppContext';

export interface ScenarioIntervention {
  addRoads: { startId: string; endId: string; roadType: 'LOCAL' | 'ARTERIAL' | 'HIGHWAY' }[];
  transitUpgrades: string[];
  tunedRoads: { roadId: string; capacity: number; speedLimit: number }[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  baselineCityData: CityData;
  interventions: ScenarioIntervention;
  modifiedCityData?: CityData;
  modifiedGraph?: UrbanGraph;
  results?: GlobalMetrics;
  predictions?: any;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED';
}

function cloneCityData(city: CityData): CityData {
  return {
    seed: city.seed,
    intersections: new Map(Array.from(city.intersections.entries()).map(([k, v]) => [k, { ...v, connectedRoads: [...v.connectedRoads] }])),
    roads: new Map(Array.from(city.roads.entries()).map(([k, v]) => [k, { ...v }])),
    buildings: city.buildings.map(b => ({ ...b })),
    zones: city.zones.map(z => ({ ...z })),
    transitStations: city.transitStations.map(s => ({ ...s })),
    signals: city.signals.map(s => ({ ...s }))
  };
}

export function runScenarioSimulation(
  scenario: Scenario,
  seed: number,
  durationSeconds: number = 120
): Scenario {
  const modifiedCity = cloneCityData(scenario.baselineCityData);

  // 1. Apply Add Roads Interventions
  scenario.interventions.addRoads.forEach(road => {
    const startNode = modifiedCity.intersections.get(road.startId);
    const endNode = modifiedCity.intersections.get(road.endId);
    if (!startNode || !endNode) return;

    const roadId = `road_${road.startId.replace('int_', '')}_to_${road.endId.replace('int_', '')}`;
    if (modifiedCity.roads.has(roadId)) return;

    const dist = Math.sqrt((startNode.x - endNode.x) ** 2 + (startNode.y - endNode.y) ** 2);
    let capacity = 1000;
    let speedLimit = 30;
    let lanes = 1;

    if (road.roadType === 'HIGHWAY') {
      capacity = 4000;
      speedLimit = 80;
      lanes = 4;
    } else if (road.roadType === 'ARTERIAL') {
      capacity = 2500;
      speedLimit = 50;
      lanes = 2;
    }

    const newRoad = {
      id: roadId,
      startNode: road.startId,
      endNode: road.endId,
      length: dist,
      capacity,
      speedLimit,
      currentFlow: 0,
      density: 0,
      travelTime: dist / (speedLimit / 3.6),
      roadType: road.roadType,
      lanes,
      status: 'ACTIVE' as const
    };

    modifiedCity.roads.set(roadId, newRoad);
    startNode.connectedRoads.push(roadId);
    endNode.connectedRoads.push(roadId);
  });

  // 2. Apply Transit Stations Interventions
  scenario.interventions.transitUpgrades.forEach(nodeId => {
    const node = modifiedCity.intersections.get(nodeId);
    if (!node) return;
    if (modifiedCity.transitStations.some(s => s.id === `station_${nodeId}`)) return;

    modifiedCity.transitStations.push({
      id: `station_${nodeId}`,
      name: `Metro Hub ${nodeId.replace('int_', '')}`,
      x: node.x,
      y: node.y,
      line: 'Orange Line',
      capacity: 500
    });
  });

  // 3. Apply Capacity/Speed Tuning Interventions
  scenario.interventions.tunedRoads.forEach(tune => {
    const road = modifiedCity.roads.get(tune.roadId);
    if (!road) return;
    road.capacity = tune.capacity;
    road.speedLimit = tune.speedLimit;
    road.travelTime = road.length / (tune.speedLimit / 3.6);
  });

  // 4. Run Scientific Simulation fast-forward tick loops
  const simEngine = new SimulationEngine(seed);
  let state: SimState = {
    vehicles: [],
    timeOfDaySeconds: 8 * 3600, // peak morning hour
    arrivedLastMinuteCount: 0,
    globalMetrics: {
      vehicleCount: 0,
      averageSpeed: 40,
      averageDensity: 0,
      totalQueueLength: 0,
      averageTravelTime: 12,
      throughput: 0,
      congestionLevel: 0
    },
    isPlaying: true,
    speed: 1,
    demandSetting: 'NORMAL'
  };

  // Run simulation iterations (representing durationSeconds ticks of 1 second each)
  const dt = 1.0;
  for (let t = 0; t < durationSeconds; t += dt) {
    state = simEngine.tick(modifiedCity, state, dt);
  }

  // Build the modified graph and run conceptual predictions
  const modifiedGraph = convertCityToGraph(modifiedCity);
  const predictions = runGNNInference(modifiedGraph, 2);

  return {
    ...scenario,
    modifiedCityData: modifiedCity,
    modifiedGraph,
    results: state.globalMetrics,
    predictions,
    status: 'COMPLETED'
  };
}
