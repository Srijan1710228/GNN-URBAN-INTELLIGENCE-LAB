import type { CityData } from './cityTypes';
import type { Vehicle } from './vehicleEngine';

export interface GlobalMetrics {
  vehicleCount: number;
  averageSpeed: number; // km/h
  averageDensity: number; // 0 to 100
  totalQueueLength: number;
  averageTravelTime: number; // seconds
  throughput: number; // arrivals per minute
  congestionLevel: number; // percentage 0-100 of congested roads
}

export function calculateGlobalMetrics(
  cityData: CityData,
  vehicles: Vehicle[],
  arrivedLastMinute: number
): GlobalMetrics {
  const activeVehicles = vehicles.filter(v => v.state !== 'ARRIVED');
  const vehicleCount = activeVehicles.length;

  let totalSpeed = 0;
  let speedCount = 0;
  for (const v of activeVehicles) {
    totalSpeed += v.speed * 3.6; // convert to km/h
    speedCount++;
  }
  const averageSpeed = speedCount > 0 ? Math.round(totalSpeed / speedCount) : 45;

  let totalDensity = 0;
  let congestedCount = 0;
  let totalTravelTime = 0;
  const roadsCount = cityData.roads.size;

  for (const road of cityData.roads.values()) {
    totalDensity += road.density;
    totalTravelTime += road.travelTime;
    if (road.status === 'CONGESTED') {
      congestedCount++;
    }
  }

  const averageDensity = roadsCount > 0 ? (totalDensity / roadsCount) * 100 : 0;
  const averageTravelTime = roadsCount > 0 ? Math.round(totalTravelTime / roadsCount) : 10;
  const congestionLevel = roadsCount > 0 ? Math.round((congestedCount / roadsCount) * 100) : 0;

  let totalQueue = 0;
  for (const intersection of cityData.intersections.values()) {
    totalQueue += intersection.queueLength;
  }

  return {
    vehicleCount,
    averageSpeed,
    averageDensity: Math.round(averageDensity),
    totalQueueLength: totalQueue,
    averageTravelTime,
    throughput: arrivedLastMinute,
    congestionLevel
  };
}
export default calculateGlobalMetrics;
