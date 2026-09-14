import type { CityData } from './cityTypes';
import { updateSignals } from './signalEngine';
import { spawnVehicle, updateVehicles } from './vehicleEngine';
import type { Vehicle } from './vehicleEngine';
import { updateTrafficDynamics } from './trafficEngine';
import { calculateGlobalMetrics } from './metrics';
import type { GlobalMetrics } from './metrics';
import { SeedRandom } from './seedRandom';

export interface SimState {
  vehicles: Vehicle[];
  timeOfDaySeconds: number; // starts at 6 * 3600 (06:00)
  arrivedLastMinuteCount: number;
  globalMetrics: GlobalMetrics;
  isPlaying: boolean;
  speed: 1 | 2 | 5 | 10;
  demandSetting: 'LOW' | 'NORMAL' | 'HIGH';
}

// Convert seconds into HH:MM formatted clock string
export function formatSimTime(seconds: number): string {
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Get demand intensity title depending on simulation time of day
export function getDemandPeakLabel(seconds: number): string {
  const hour = (seconds % 86400) / 3600;
  if (hour >= 6 && hour < 8) return '06:00 LOW DEMAND';
  if (hour >= 8 && hour < 11) return '08:00 MORNING PEAK';
  if (hour >= 11 && hour < 16) return '12:00 MODERATE';
  if (hour >= 16 && hour < 19) return '17:00 EVENING PEAK';
  if (hour >= 19 && hour < 22) return '19:00 HIGH DEMAND';
  return '22:00 LOW DEMAND';
}

// Calculate vehicle spawn interval depending on current simulation time
export function getSpawnRateLimit(seconds: number, demandSetting: 'LOW' | 'NORMAL' | 'HIGH'): number {
  const hour = (seconds % 86400) / 3600;
  let baseInterval = 2; // seconds between spawns

  if (hour >= 6 && hour < 8) baseInterval = 5; // Low
  else if (hour >= 8 && hour < 11) baseInterval = 0.6; // Morning Peak
  else if (hour >= 11 && hour < 16) baseInterval = 2.0; // Moderate
  else if (hour >= 16 && hour < 19) baseInterval = 0.5; // Evening Peak
  else if (hour >= 19 && hour < 22) baseInterval = 1.2; // High
  else baseInterval = 6; // Night Low

  // Multiply by setting
  if (demandSetting === 'LOW') baseInterval *= 2.0;
  if (demandSetting === 'HIGH') baseInterval *= 0.5;

  return baseInterval;
}

export class SimulationEngine {
  private rng: SeedRandom;
  private spawnAccumulator = 0;
  private minuteAccumulator = 0;
  private arrivalsThisMinute = 0;
  private lastArrivalRate = 0;

  constructor(seed: number) {
    this.rng = new SeedRandom(seed);
  }

  // Update loop ticks the simulation forward by deltaSeconds
  tick(
    cityData: CityData,
    state: SimState,
    deltaTimeSeconds: number
  ): SimState {
    if (!state.isPlaying) return state;

    // Apply speed multiplier
    const simTimeDelta = deltaTimeSeconds * state.speed;

    // 1. Advance Clock
    let newTime = state.timeOfDaySeconds + simTimeDelta;
    if (newTime >= 24 * 3600) {
      newTime = 0; // loop day
    }

    // 2. Cycle Traffic Signals
    updateSignals(cityData.signals, cityData.intersections, simTimeDelta);

    // 3. Spawn vehicles based on time-based demand curves
    this.spawnAccumulator += simTimeDelta;
    const spawnRate = getSpawnRateLimit(newTime, state.demandSetting);

    let nextVehicles = [...state.vehicles];
    if (this.spawnAccumulator >= spawnRate) {
      this.spawnAccumulator = 0;
      // Cap max vehicles to prevent client performance freeze (e.g. 150 vehicles)
      if (nextVehicles.length < 150) {
        const newVehicle = spawnVehicle(cityData.intersections, cityData.roads, this.rng);
        if (newVehicle) {
          nextVehicles.push(newVehicle);
        }
      }
    }

    // 4. Update Vehicle movements
    const originalCount = nextVehicles.length;
    const activeVehicles = updateVehicles(nextVehicles, cityData.intersections, cityData.roads, simTimeDelta);
    const arrivals = originalCount - activeVehicles.length;

    // Track throughput
    this.arrivalsThisMinute += arrivals;
    this.minuteAccumulator += simTimeDelta;
    if (this.minuteAccumulator >= 60) {
      this.minuteAccumulator = 0;
      this.lastArrivalRate = this.arrivalsThisMinute;
      this.arrivalsThisMinute = 0;
    }

    // 5. Update Road/Intersection densities
    updateTrafficDynamics(cityData.roads, cityData.intersections, activeVehicles);

    // 6. Calculate Global Metrics
    const globalMetrics = calculateGlobalMetrics(cityData, activeVehicles, this.lastArrivalRate);

    return {
      ...state,
      vehicles: activeVehicles,
      timeOfDaySeconds: newTime,
      arrivedLastMinuteCount: this.lastArrivalRate,
      globalMetrics
    };
  }
}
