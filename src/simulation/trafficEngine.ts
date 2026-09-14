import type { Road, Intersection } from './cityTypes';
import type { Vehicle } from './vehicleEngine';

export function updateTrafficDynamics(
  roads: Map<string, Road>,
  intersections: Map<string, Intersection>,
  vehicles: Vehicle[]
) {
  // 1. Reset metrics
  const vehiclesPerRoad = new Map<string, number>();
  const waitingPerIntersection = new Map<string, number>();

  for (const roadId of roads.keys()) {
    vehiclesPerRoad.set(roadId, 0);
  }
  for (const intId of intersections.keys()) {
    waitingPerIntersection.set(intId, 0);
    const node = intersections.get(intId)!;
    node.vehicleCount = 0;
    node.queueLength = 0;
  }

  // 2. Count vehicles on each road and intersection queues
  for (const vehicle of vehicles) {
    const rId = vehicle.currentRoad;
    vehiclesPerRoad.set(rId, (vehiclesPerRoad.get(rId) || 0) + 1);

    if (vehicle.state === 'WAITING') {
      const currentStep = vehicle.route[vehicle.currentStepIndex];
      const targetIntId = currentStep.targetIntersectionId;
      waitingPerIntersection.set(targetIntId, (waitingPerIntersection.get(targetIntId) || 0) + 1);
    }
  }

  // 3. Compute road traffic parameters
  for (const road of roads.values()) {
    const vehicleCount = vehiclesPerRoad.get(road.id) || 0;

    // Density = count of vehicles divided by max road capacity threshold
    // Let's model: capacity = vehicles space (length / 8m per vehicle)
    const maxCapacityVehicles = Math.max(2, Math.floor((road.length / 8) * road.lanes));
    const rawDensity = vehicleCount / maxCapacityVehicles;
    road.density = Math.min(1, rawDensity);

    // Flow = density * capacity
    road.currentFlow = Math.round(road.density * road.capacity);

    // Speed decreases as density increases: speed = speedLimit * (1 - density * 0.7)
    const baseSpeed = road.speedLimit;
    const currentSpeed = baseSpeed * Math.max(0.15, 1 - road.density * 0.7);

    // Travel time increases as speed decreases
    road.travelTime = Math.round(road.length / (currentSpeed / 3.6));

    // Congestion state
    if (road.density > 0.8) {
      road.status = 'CONGESTED';
    } else {
      road.status = 'ACTIVE';
    }
  }

  // 4. Compute intersection congestion propagation
  for (const intersection of intersections.values()) {
    const queue = waitingPerIntersection.get(intersection.id) || 0;
    intersection.queueLength = queue;

    // Get all roads heading into this intersection
    const connectedRoads = intersection.connectedRoads.map(id => roads.get(id)!);
    
    // Average density of incoming roads
    let sumDensity = 0;
    let count = 0;
    let sumSpeed = 0;
    let totalVehicles = 0;

    for (const r of connectedRoads) {
      if (r) {
        sumDensity += r.density;
        sumSpeed += r.speedLimit * (1 - r.density * 0.7);
        totalVehicles += vehiclesPerRoad.get(r.id) || 0;
        count++;
      }
    }

    if (count > 0) {
      intersection.trafficDensity = Math.min(1, (sumDensity / count) + (queue * 0.05));
      intersection.vehicleCount = totalVehicles;
      intersection.averageSpeed = Math.round(sumSpeed / count);
    }

    // Congestion propagation: if queue length is high, increase density of adjacent incoming roads
    if (queue > 4) {
      for (const r of connectedRoads) {
        if (r && r.endNode === intersection.id) {
          r.density = Math.min(1, r.density + 0.15);
          r.status = 'CONGESTED';
        }
      }
    }
  }
}
