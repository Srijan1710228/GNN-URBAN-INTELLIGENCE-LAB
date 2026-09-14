import type { GlobalMetrics } from './metrics';

export interface ComparisonResult {
  metric: string;
  baseline: number;
  scenario: number;
  delta: number;
  percentChange: number;
  status: 'better' | 'worse' | 'neutral';
}

export function compareScenarioMetrics(
  baseline: GlobalMetrics,
  scenario: GlobalMetrics
): ComparisonResult[] {
  const compare = (
    metricName: string,
    baseVal: number,
    scenVal: number,
    lowerIsBetter: boolean = false
  ): ComparisonResult => {
    const delta = scenVal - baseVal;
    const percentChange = baseVal !== 0 ? (delta / baseVal) * 100 : 0;
    
    let status: 'better' | 'worse' | 'neutral' = 'neutral';
    if (Math.abs(percentChange) > 0.5) {
      if (lowerIsBetter) {
        status = percentChange < 0 ? 'better' : 'worse';
      } else {
        status = percentChange > 0 ? 'better' : 'worse';
      }
    }

    return {
      metric: metricName,
      baseline: baseVal,
      scenario: scenVal,
      delta,
      percentChange,
      status
    };
  };

  return [
    compare('Average Speed', baseline.averageSpeed, scenario.averageSpeed, false),
    compare('Congestion Index', baseline.congestionLevel * 100, scenario.congestionLevel * 100, true),
    compare('Total Queue Length', baseline.totalQueueLength, scenario.totalQueueLength, true),
    compare('Average Density', baseline.averageDensity * 100, scenario.averageDensity * 100, true),
    compare('Travel Time (avg)', baseline.averageTravelTime, scenario.averageTravelTime, true),
    compare('Throughput Rate', baseline.throughput, scenario.throughput, false)
  ];
}
