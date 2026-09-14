import type { CityData, Intersection, Road, Building, Zone, TransitStation, TrafficSignal, RoadType } from './cityTypes';
import { SeedRandom } from './seedRandom';

export function generateCity(seed: number, _width: number = 1000, _height: number = 800): CityData {
  const rng = new SeedRandom(seed);

  const intersections = new Map<string, Intersection>();
  const roads = new Map<string, Road>();

  // Major Corridors for Bengaluru CBD (MG Road / Brigade Road study area)
  // X columns:
  // x = 150: Kasturba Road / Cubbon Park
  // x = 320: St. Mark's Road
  // x = 500: Museum Road
  // x = 680: Brigade Road
  // x = 860: Trinity / Residency East
  // Y rows:
  // y = 150: Chinnaswamy Stadium / Cubbon Park North
  // y = 300: MG Road Corridor (Metro Line)
  // y = 380: Church Street Corridor
  // y = 480: Residency Road Corridor
  // y = 580: Vittal Mallya Road Corridor
  // y = 680: Richmond Road Corridor

  const gridIntersections = [
    { id: 'int_1_1', name: 'Cubbon Park North Gate', x: 150, y: 150, type: 'RESIDENTIAL' },
    { id: 'int_1_2', name: 'Kasturba Road Junction', x: 150, y: 300, type: 'COMMERCIAL' },
    { id: 'int_1_3', name: 'UB City Entrance', x: 150, y: 480, type: 'COMMERCIAL' },
    { id: 'int_1_4', name: 'Vittal Mallya West', x: 150, y: 580, type: 'COMMERCIAL' },
    { id: 'int_1_5', name: 'Richmond Road West', x: 150, y: 680, type: 'INDUSTRIAL' },

    { id: 'int_2_1', name: 'Stadium Circle', x: 320, y: 150, type: 'PARK' },
    { id: 'int_2_2', name: 'Anil Kumble Circle', x: 320, y: 300, type: 'COMMERCIAL' },
    { id: 'int_2_3', name: 'St. Marks / Church St', x: 320, y: 380, type: 'COMMERCIAL' },
    { id: 'int_2_4', name: 'Cash Pharmacy Junction', x: 320, y: 480, type: 'COMMERCIAL' },
    { id: 'int_2_5', name: 'Lavelle Road Junction', x: 320, y: 580, type: 'RESIDENTIAL' },
    { id: 'int_2_6', name: 'Richmond Circle', x: 320, y: 680, type: 'INDUSTRIAL' },

    { id: 'int_3_1', name: 'Museum Road North', x: 500, y: 150, type: 'PARK' },
    { id: 'int_3_2', name: 'MG Road / Museum Rd', x: 500, y: 300, type: 'COMMERCIAL' },
    { id: 'int_3_3', name: 'Museum Rd / Church St', x: 500, y: 380, type: 'COMMERCIAL' },
    { id: 'int_3_4', name: 'Museum Rd / Residency Rd', x: 500, y: 480, type: 'RESIDENTIAL' },
    { id: 'int_3_5', name: 'Museum Rd / Vittal Mallya', x: 500, y: 580, type: 'RESIDENTIAL' },
    { id: 'int_3_6', name: 'Richmond Road Junction', x: 500, y: 680, type: 'INDUSTRIAL' },

    { id: 'int_4_1', name: 'Mayo Hall Junction', x: 680, y: 300, type: 'COMMERCIAL' },
    { id: 'int_4_2', name: 'Brigade Road / Church St', x: 680, y: 380, type: 'COMMERCIAL' },
    { id: 'int_4_3', name: 'Brigade Rd / Residency Rd', x: 680, y: 480, type: 'COMMERCIAL' },
    { id: 'int_4_4', name: 'Brigade Rd / Castle St', x: 680, y: 580, type: 'RESIDENTIAL' },
    { id: 'int_4_5', name: 'Garuda Mall Junction', x: 680, y: 680, type: 'RESIDENTIAL' },

    { id: 'int_5_1', name: 'Webbs Junction', x: 860, y: 300, type: 'COMMERCIAL' },
    { id: 'int_5_2', name: 'Trinity Circle', x: 860, y: 380, type: 'COMMERCIAL' },
    { id: 'int_5_3', name: 'Residency Road East', x: 860, y: 480, type: 'RESIDENTIAL' },
    { id: 'int_5_4', name: 'Richmond Road East', x: 860, y: 680, type: 'INDUSTRIAL' }
  ];

  // Let's add sub-intersections to make it ~50 nodes
  // Let's add more nodes programmatically along the streets
  const studyIntersections: Intersection[] = [];
  gridIntersections.forEach(gi => {
    const trafficDensity = rng.range(0.1, 0.85);
    const vehicleCount = Math.round(trafficDensity * 30);
    const averageSpeed = 50 - trafficDensity * 30;

    studyIntersections.push({
      id: gi.id,
      x: gi.x + rng.range(-15, 15), // Jitter slightly for organic geography
      y: gi.y + rng.range(-15, 15),
      connectedRoads: [],
      signalState: rng.pick(['RED', 'YELLOW', 'GREEN']),
      trafficDensity,
      vehicleCount,
      averageSpeed: Math.round(averageSpeed),
      queueLength: Math.round(trafficDensity * 10)
    });
  });

  // Let's add intermediate street intersections to reach ~60-80 nodes
  let subIntCount = 1;
  const addSubInt = (_name: string, x: number, y: number) => {
    const id = `int_sub_${subIntCount++}`;
    const trafficDensity = rng.range(0.1, 0.7);
    studyIntersections.push({
      id,
      x,
      y,
      connectedRoads: [],
      signalState: rng.pick(['RED', 'YELLOW', 'GREEN']),
      trafficDensity,
      vehicleCount: Math.round(trafficDensity * 20),
      averageSpeed: Math.round(50 - trafficDensity * 25),
      queueLength: Math.round(trafficDensity * 8)
    });
  };

  // Add real mid-block intersections on MG Road, Brigade Road, Lavelle Road
  addSubInt("MG Road Mid-block 1", 410, 295);
  addSubInt("MG Road Mid-block 2", 590, 305);
  addSubInt("Church Street Entrance", 230, 375);
  addSubInt("Church Street Mid-block", 590, 385);
  addSubInt("Lavelle Road Bend 1", 230, 530);
  addSubInt("Lavelle Road Bend 2", 230, 630);
  addSubInt("Wood Street Crossing", 590, 485);
  addSubInt("Castle Street Link", 770, 585);
  addSubInt("Magrath Road Junction", 770, 685);
  addSubInt("Kasturba Road Exit", 150, 220);
  addSubInt("Chinnaswamy Stadium Gate", 235, 150);

  // Index intersections
  studyIntersections.forEach(intersection => {
    intersections.set(intersection.id, intersection);
  });

  // Connect intersections with roads
  let roadIdCounter = 1;
  const addRoad = (u: string, v: string, _name: string, type: RoadType) => {
    const nodeU = intersections.get(u);
    const nodeV = intersections.get(v);
    if (!nodeU || !nodeV) return;

    const dx = nodeU.x - nodeV.x;
    const dy = nodeU.y - nodeV.y;
    const length = Math.round(Math.sqrt(dx * dx + dy * dy) * 1.5); // Scaled to meters

    const id = `r_${roadIdCounter++}`;

    let speedLimit = 40;
    let capacity = 800;
    let lanes = 2;

    if (type === 'HIGHWAY') {
      speedLimit = 80;
      capacity = 2000;
      lanes = 4;
    } else if (type === 'ARTERIAL') {
      speedLimit = 50;
      capacity = 1200;
      lanes = 3;
    }

    const density = rng.range(0.08, 0.75);
    const flow = Math.round(density * capacity);
    const currentSpeed = speedLimit * (1 - density * 0.45);
    const travelTime = Math.round(length / (currentSpeed / 3.6));

    roads.set(id, {
      id,
      startNode: u,
      endNode: v,
      length,
      capacity,
      speedLimit,
      currentFlow: flow,
      density,
      travelTime,
      roadType: type,
      lanes,
      status: density > 0.7 ? 'CONGESTED' : 'ACTIVE'
    });

    nodeU.connectedRoads.push(id);
    nodeV.connectedRoads.push(id);
  };

  // Build the real street corridors!
  // 1. MG Road (Highway / Arterial)
  addRoad('int_1_2', 'int_sub_10', 'MG Road', 'HIGHWAY');
  addRoad('int_sub_10', 'int_2_2', 'MG Road', 'HIGHWAY');
  addRoad('int_2_2', 'int_sub_1', 'MG Road', 'HIGHWAY');
  addRoad('int_sub_1', 'int_3_2', 'MG Road', 'HIGHWAY');
  addRoad('int_3_2', 'int_sub_2', 'MG Road', 'HIGHWAY');
  addRoad('int_sub_2', 'int_4_1', 'MG Road', 'HIGHWAY');
  addRoad('int_4_1', 'int_5_1', 'MG Road', 'HIGHWAY');

  // 2. Church Street (Local)
  addRoad('int_sub_3', 'int_2_3', 'Church Street', 'LOCAL');
  addRoad('int_2_3', 'int_3_3', 'Church Street', 'LOCAL');
  addRoad('int_3_3', 'int_sub_4', 'Church Street', 'LOCAL');
  addRoad('int_sub_4', 'int_4_2', 'Church Street', 'LOCAL');

  // 3. Residency Road (Arterial)
  addRoad('int_1_3', 'int_sub_5', 'Residency Road', 'ARTERIAL');
  addRoad('int_sub_5', 'int_2_4', 'Residency Road', 'ARTERIAL');
  addRoad('int_2_4', 'int_3_4', 'Residency Road', 'ARTERIAL');
  addRoad('int_3_4', 'int_sub_7', 'Residency Road', 'ARTERIAL');
  addRoad('int_sub_7', 'int_4_3', 'Residency Road', 'ARTERIAL');
  addRoad('int_4_3', 'int_5_3', 'Residency Road', 'ARTERIAL');

  // 4. Vittal Mallya Road / Lavelle Road (Arterial / Local)
  addRoad('int_1_4', 'int_sub_6', 'Vittal Mallya Road', 'ARTERIAL');
  addRoad('int_sub_6', 'int_2_5', 'Vittal Mallya Road', 'ARTERIAL');
  addRoad('int_2_5', 'int_3_5', 'Vittal Mallya Road', 'ARTERIAL');

  // 5. Richmond Road (Arterial)
  addRoad('int_1_5', 'int_2_6', 'Richmond Road', 'ARTERIAL');
  addRoad('int_2_6', 'int_3_6', 'Richmond Road', 'ARTERIAL');
  addRoad('int_3_6', 'int_4_5', 'Richmond Road', 'ARTERIAL');
  addRoad('int_4_5', 'int_5_4', 'Richmond Road', 'ARTERIAL');

  // 6. St. Mark's Road (North-South, Arterial)
  addRoad('int_2_1', 'int_2_2', 'St. Mark\'s Road', 'ARTERIAL');
  addRoad('int_2_2', 'int_2_3', 'St. Mark\'s Road', 'ARTERIAL');
  addRoad('int_2_3', 'int_2_4', 'St. Mark\'s Road', 'ARTERIAL');
  addRoad('int_2_4', 'int_2_5', 'St. Mark\'s Road', 'ARTERIAL');
  addRoad('int_2_5', 'int_2_6', 'St. Mark\'s Road', 'ARTERIAL');

  // 7. Museum Road (North-South, Local / Arterial)
  addRoad('int_3_1', 'int_3_2', 'Museum Road', 'LOCAL');
  addRoad('int_3_2', 'int_3_3', 'Museum Road', 'LOCAL');
  addRoad('int_3_3', 'int_3_4', 'Museum Road', 'LOCAL');
  addRoad('int_3_4', 'int_3_5', 'Museum Road', 'LOCAL');
  addRoad('int_3_5', 'int_3_6', 'Museum Road', 'LOCAL');

  // 8. Brigade Road (North-South, Arterial)
  addRoad('int_4_1', 'int_4_2', 'Brigade Road', 'ARTERIAL');
  addRoad('int_4_2', 'int_4_3', 'Brigade Road', 'ARTERIAL');
  addRoad('int_4_3', 'int_4_4', 'Brigade Road', 'ARTERIAL');
  addRoad('int_4_4', 'int_4_5', 'Brigade Road', 'ARTERIAL');

  // 9. Trinity Circle Connections & Webbs Junction (Arterial)
  addRoad('int_5_1', 'int_5_2', 'Trinity Circle Link', 'ARTERIAL');
  addRoad('int_5_2', 'int_5_3', 'Trinity Circle Link', 'ARTERIAL');
  addRoad('int_5_3', 'int_5_4', 'Trinity Circle Link', 'ARTERIAL');

  // 10. Stadium & Cubbon Park connections
  addRoad('int_1_1', 'int_sub_11', 'Stadium Road', 'LOCAL');
  addRoad('int_sub_11', 'int_2_1', 'Stadium Road', 'LOCAL');
  addRoad('int_1_1', 'int_sub_9', 'Cubbon Road', 'LOCAL');
  addRoad('int_sub_9', 'int_1_2', 'Cubbon Road', 'LOCAL');

  // Additional dynamic loops to guarantee robust routing paths
  addRoad('int_sub_8', 'int_4_4', 'Magrath Road', 'LOCAL');
  addRoad('int_sub_8', 'int_4_5', 'Magrath Road', 'LOCAL');
  addRoad('int_sub_8', 'int_5_4', 'Magrath Road', 'LOCAL');

  // 11. Zones
  const zones: Zone[] = [
    { id: 'z1', name: 'Cubbon Park Botanical Sanctuary', type: 'PARK', x: 180, y: 180, radius: 150, color: 'rgba(34, 197, 94, 0.08)' },
    { id: 'z2', name: 'UB City Commercial Hub', type: 'COMMERCIAL', x: 160, y: 500, radius: 120, color: 'rgba(14, 165, 233, 0.08)' },
    { id: 'z3', name: 'MG Road Metro Hub', type: 'COMMERCIAL', x: 450, y: 300, radius: 160, color: 'rgba(14, 165, 233, 0.08)' },
    { id: 'z4', name: 'Brigade Road Retail Arcade', type: 'COMMERCIAL', x: 680, y: 440, radius: 140, color: 'rgba(14, 165, 233, 0.08)' },
    { id: 'z5', name: 'Lavelle Road Residences', type: 'RESIDENTIAL', x: 230, y: 600, radius: 130, color: 'rgba(16, 185, 129, 0.08)' },
    { id: 'z6', name: 'Museum Road Bungalows', type: 'RESIDENTIAL', x: 500, y: 530, radius: 120, color: 'rgba(16, 185, 129, 0.08)' }
  ];

  // 12. Buildings (Placing real landmarks at their physical spots!)
  const buildings: Building[] = [
    { id: 'bld_ub_city', x: 160, y: 510, height: 120, width: 35, depth: 35, type: 'COMMERCIAL', population: 350 },
    { id: 'bld_mayo_hall', x: 670, y: 320, height: 25, width: 30, depth: 20, type: 'COMMERCIAL', population: 60 },
    { id: 'bld_stadium', x: 300, y: 130, height: 35, width: 60, depth: 60, type: 'PARK', population: 0 },
    { id: 'bld_garuda_mall', x: 740, y: 650, height: 45, width: 45, depth: 40, type: 'COMMERCIAL', population: 200 }
  ];

  // Generate generic buildings inside residential/commercial zones
  let bldCount = 1;
  zones.forEach(zone => {
    if (zone.type === 'PARK') return;
    const genericCount = zone.type === 'COMMERCIAL' ? 6 : 12;
    for (let i = 0; i < genericCount; i++) {
      const angle = rng.range(0, Math.PI * 2);
      const dist = rng.range(30, zone.radius * 0.8);
      const bx = zone.x + Math.cos(angle) * dist;
      const by = zone.y + Math.sin(angle) * dist;
      
      // Avoid overlapping with landmarks
      const tooClose = buildings.some(b => Math.hypot(b.x - bx, b.y - by) < 40);
      if (tooClose) continue;

      buildings.push({
        id: `bld_gen_${bldCount++}`,
        x: Math.round(bx),
        y: Math.round(by),
        height: rng.intRange(15, zone.type === 'COMMERCIAL' ? 80 : 35),
        width: rng.intRange(12, 24),
        depth: rng.intRange(12, 24),
        type: zone.type,
        population: rng.intRange(10, 100)
      });
    }
  });

  // 13. Transit Stations
  const transitStations: TransitStation[] = [
    { id: 'station_mg_road', name: 'MG Road Metro Station', x: 450, y: 280, line: 'Purple Line', capacity: 1200 },
    { id: 'station_trinity', name: 'Trinity Metro Station', x: 860, y: 280, line: 'Purple Line', capacity: 800 }
  ];

  // 14. Signals
  const signals: TrafficSignal[] = [];
  intersections.forEach(inter => {
    signals.push({
      id: `sig_${inter.id}`,
      intersectionId: inter.id,
      cycleTime: rng.intRange(35, 75),
      lastChange: rng.intRange(0, 30)
    });
  });

  return {
    seed,
    intersections,
    roads,
    buildings,
    zones,
    transitStations,
    signals
  };
}
