import type { TrafficSignal, Intersection } from './cityTypes';

export function updateSignals(
  signals: TrafficSignal[],
  intersections: Map<string, Intersection>,
  deltaTimeSeconds: number
) {
  for (const signal of signals) {
    const node = intersections.get(signal.intersectionId);
    if (!node) continue;

    signal.lastChange += deltaTimeSeconds;

    // Default signal cycle duration (e.g. 15s GREEN, 3s YELLOW, 15s RED)
    const greenTime = 12;
    const yellowTime = 3;
    const redTime = 12;
    const totalCycle = greenTime + yellowTime + redTime;

    const timeInCycle = signal.lastChange % totalCycle;

    if (timeInCycle < greenTime) {
      node.signalState = 'GREEN';
    } else if (timeInCycle < greenTime + yellowTime) {
      node.signalState = 'YELLOW';
    } else {
      node.signalState = 'RED';
    }
  }
}
