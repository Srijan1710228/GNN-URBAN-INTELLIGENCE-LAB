import type { Intersection, Road } from './cityTypes';
import { findRoute } from './routing';
import type { RouteStep } from './routing';
import { SeedRandom } from './seedRandom';

export type VehicleState = 'MOVING' | 'WAITING' | 'STOPPED' | 'ARRIVED';

export interface Vehicle {
  id: string;
  origin: string;
  destination: string;
  route: RouteStep[];
  currentStepIndex: number;
  currentRoad: string;
  position: number; // 0 (start of road) to 1 (end of road)
  speed: number;    // meters/second
  state: VehicleState;
  color: string;
}

let vehicleIdCounter = 1;

export function spawnVehicle(
  intersections: Map<string, Intersection>,
  roads: Map<string, Road>,
  rng: SeedRandom
): Vehicle | null {
  const nodeIds = Array.from(intersections.keys());
  if (nodeIds.length < 2) return null;

  const origin = rng.pick(nodeIds);
  let destination = rng.pick(nodeIds);
  while (destination === origin) {
    destination = rng.pick(nodeIds);
  }

  const route = findRoute(origin, destination, intersections, roads);
  if (!route || route.length === 0) return null;

  const firstStep = route[0];
  const road = roads.get(firstStep.roadId)!;

  const colors = ['#00e5ff', '#a855f7', '#10b981', '#f59e0b', '#3b82f6'];

  return {
    id: `v_${vehicleIdCounter++}`,
    origin,
    destination,
    route,
    currentStepIndex: 0,
    currentRoad: firstStep.roadId,
    position: 0,
    speed: road.speedLimit / 3.6, // m/s
    state: 'MOVING',
    color: rng.pick(colors)
  };
}

export function updateVehicles(
  vehicles: Vehicle[],
  intersections: Map<string, Intersection>,
  roads: Map<string, Road>,
  deltaTimeSeconds: number
): Vehicle[] {
  const updatedVehicles: Vehicle[] = [];

  for (const vehicle of vehicles) {
    if (vehicle.state === 'ARRIVED') continue;

    const road = roads.get(vehicle.currentRoad);
    if (!road) continue;

    // Calculate dynamic vehicle speed based on road density
    // speedLimit = speedLimit_m_s * (1 - density * 0.6)
    const baseSpeedLimit = road.speedLimit / 3.6; // m/s
    const targetSpeed = baseSpeedLimit * Math.max(0.15, 1 - road.density * 0.65);
    
    // Increment position
    if (vehicle.state === 'MOVING') {
      const distanceMoved = targetSpeed * deltaTimeSeconds;
      const progressDelta = distanceMoved / road.length;
      vehicle.position = Math.min(1, vehicle.position + progressDelta);
      vehicle.speed = targetSpeed;
    }

    // Check if vehicle has reached the end of the road
    if (vehicle.position >= 1) {
      const currentStep = vehicle.route[vehicle.currentStepIndex];
      const targetIntersectionId = currentStep.targetIntersectionId;
      const intersection = intersections.get(targetIntersectionId)!;

      // Check traffic signal: stop if signal is RED/YELLOW and this is the path to enter the intersection
      const isRedSignal = intersection.signalState === 'RED' || intersection.signalState === 'YELLOW';

      if (isRedSignal) {
        vehicle.state = 'WAITING';
        vehicle.speed = 0;
      } else {
        // Signal is Green, advance to next road or arrive
        if (vehicle.currentStepIndex < vehicle.route.length - 1) {
          // Go to next step
          vehicle.currentStepIndex++;
          const nextStep = vehicle.route[vehicle.currentStepIndex];
          vehicle.currentRoad = nextStep.roadId;
          vehicle.position = 0;
          vehicle.state = 'MOVING';
        } else {
          // Reached destination
          vehicle.state = 'ARRIVED';
        }
      }
    } else {
      // Still traveling on road
      vehicle.state = 'MOVING';
    }

    if (vehicle.state !== 'ARRIVED') {
      updatedVehicles.push(vehicle);
    }
  }

  return updatedVehicles;
}
export default updateVehicles;
