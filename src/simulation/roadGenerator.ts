import type { Intersection, Road, RoadType, SignalState } from './cityTypes';
import { SeedRandom } from './seedRandom';

export interface RoadNetwork {
  intersections: Map<string, Intersection>;
  roads: Map<string, Road>;
}

export function generateRoadNetwork(rng: SeedRandom, width: number, height: number): RoadNetwork {
  const intersections = new Map<string, Intersection>();
  const roads = new Map<string, Road>();

  const cols = 10;
  const rows = 10;

  // 1. Generate Intersections on a Jittered Grid
  const colSpacing = (width * 0.8) / (cols - 1);
  const rowSpacing = (height * 0.8) / (rows - 1);
  const xOffset = width * 0.1;
  const yOffset = height * 0.1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `int_${r}_${c}`;
      
      // Jitter the coordinates to make the street network organic but structured
      const jitterX = rng.range(-colSpacing * 0.25, colSpacing * 0.25);
      const jitterY = rng.range(-rowSpacing * 0.25, rowSpacing * 0.25);

      const x = xOffset + c * colSpacing + jitterX;
      const y = yOffset + r * rowSpacing + jitterY;

      // Deterministic traffic metrics
      const trafficDensity = rng.range(0.1, 0.85);
      const vehicleCount = Math.round(trafficDensity * 40);
      const averageSpeed = 60 - trafficDensity * 40; // congested intersections are slower

      const signalStates: SignalState[] = ['RED', 'YELLOW', 'GREEN'];
      const signalState = rng.pick(signalStates);

      intersections.set(id, {
        id,
        x,
        y,
        connectedRoads: [],
        signalState,
        trafficDensity,
        vehicleCount,
        averageSpeed: Math.round(averageSpeed),
        queueLength: Math.round(trafficDensity * 12)
      });
    }
  }

  // Helper to add a road
  let roadIdCounter = 1;
  const addRoadLink = (u: string, v: string, type: RoadType) => {
    const nodeU = intersections.get(u)!;
    const nodeV = intersections.get(v)!;

    // Calculate Euclidean distance
    const dx = nodeU.x - nodeV.x;
    const dy = nodeU.y - nodeV.y;
    const length = Math.round(Math.sqrt(dx * dx + dy * dy));

    const id = `r_${roadIdCounter++}`;

    let speedLimit = 40;
    let capacity = 600;
    if (type === 'ARTERIAL') {
      speedLimit = 60;
      capacity = 1200;
    } else if (type === 'HIGHWAY') {
      speedLimit = 90;
      capacity = 2200;
    }

    const density = rng.range(0.05, 0.8);
    const flow = Math.round(density * capacity);
    const currentSpeed = speedLimit * (1 - density * 0.5);
    const travelTime = Math.round((length / (currentSpeed / 3.6))); // in seconds

    const status = density > 0.75 ? 'CONGESTED' : 'ACTIVE';

    let lanes = 2;
    if (type === 'LOCAL') lanes = 1;
    else if (type === 'HIGHWAY') lanes = 4;

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
      status
    });

    nodeU.connectedRoads.push(id);
    nodeV.connectedRoads.push(id);
  };

  // 2. Connect Grid Neighbors deterministically
  // Connect rows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const u = `int_${r}_${c}`;
      const v = `int_${r}_${c + 1}`;
      
      // Determine road type based on location (highway down middle/diagonals, arterials spacing, locals everywhere else)
      let type: RoadType = 'LOCAL';
      if (r === 5) {
        type = 'HIGHWAY';
      } else if (r % 3 === 0) {
        type = 'ARTERIAL';
      }

      // Add with 92% probability to create organic dead-ends/bypasses while retaining connectivity
      if (rng.next() < 0.92) {
        addRoadLink(u, v, type);
      }
    }
  }

  // Connect columns
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows - 1; r++) {
      const u = `int_${r}_${c}`;
      const v = `int_${r + 1}_${c}`;

      let type: RoadType = 'LOCAL';
      if (c === 5) {
        type = 'HIGHWAY';
      } else if (c % 3 === 0) {
        type = 'ARTERIAL';
      }

      if (rng.next() < 0.92) {
        addRoadLink(u, v, type);
      }
    }
  }

  // 3. Add highways across grid corners (arterials/highways connecting central hubs)
  // Let's add 5-10 highway cross-connections to make it interesting
  const hubs = [
    { u: 'int_0_0', v: 'int_3_3' },
    { u: 'int_0_9', v: 'int_3_6' },
    { u: 'int_9_0', v: 'int_6_3' },
    { u: 'int_9_9', v: 'int_6_6' }
  ];

  hubs.forEach(link => {
    if (intersections.has(link.u) && intersections.has(link.v)) {
      addRoadLink(link.u, link.v, 'HIGHWAY');
    }
  });

  return { intersections, roads };
}
