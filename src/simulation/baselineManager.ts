import type { CityData } from './cityTypes';
import type { GlobalMetrics } from './metrics';
import { UrbanGraph } from './graph';
import { convertCityToGraph } from '../context/AppContext';

export interface BaselineState {
  cityData: CityData;
  graph: UrbanGraph;
  metrics: GlobalMetrics;
  timestamp: string;
}

export function createBaselineState(cityData: CityData, metrics: GlobalMetrics): BaselineState {
  // Deep clone intersections & roads maps
  const intersections = new Map(
    Array.from(cityData.intersections.entries()).map(([k, v]) => [
      k,
      { ...v, connectedRoads: [...v.connectedRoads] }
    ])
  );
  
  const roads = new Map(
    Array.from(cityData.roads.entries()).map(([k, v]) => [
      k,
      { ...v }
    ])
  );

  const clonedCity: CityData = {
    seed: cityData.seed,
    intersections,
    roads,
    buildings: cityData.buildings.map(b => ({ ...b })),
    zones: cityData.zones.map(z => ({ ...z })),
    transitStations: cityData.transitStations.map(s => ({ ...s })),
    signals: cityData.signals.map(s => ({ ...s }))
  };

  const graph = convertCityToGraph(clonedCity);

  return {
    cityData: clonedCity,
    graph,
    metrics: { ...metrics },
    timestamp: new Date().toLocaleTimeString()
  };
}
