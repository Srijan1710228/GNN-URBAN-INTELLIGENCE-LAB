import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Panel, Button } from './UIComponents';
import { Save, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import type { CityData } from '../simulation/cityTypes';

export const Analytics: React.FC = () => {
  const {
    cityData,
    simState,
    baselineCityData,
    baselineMetrics,
    metricsHistory,
    interventions
  } = useApp();

  // Multi-Objective weights
  const [weights, setWeights] = useState({
    traffic: 30,
    accessibility: 25,
    cost: 20,
    pollution: 15,
    equity: 10
  });

  const [experimentName, setExperimentName] = useState<string>('Urban Experiment 1');
  const [savedExperiments, setSavedExperiments] = useState<any[]>([]);

  // Load saved experiments from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('urban_intelligence_experiments');
    if (saved) {
      try {
        setSavedExperiments(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Calculate dynamic metrics
  const getAccessibility = (city: CityData | null) => {
    if (!city) return 0;
    const nodes = Array.from(city.intersections.keys());
    if (nodes.length === 0) return 0;
    
    let totalReachable = 0;
    nodes.forEach(startId => {
      let reachable = 0;
      city.intersections.get(startId)?.connectedRoads.forEach(roadId => {
        const road = city.roads.get(roadId);
        if (road && road.travelTime <= 15) {
          reachable++;
        }
      });
      totalReachable += reachable;
    });
    return Math.min(100, Math.round((totalReachable / nodes.length) * 20));
  };

  const getPollution = (city: CityData | null) => {
    if (!city) return 0;
    let emissions = 0;
    city.roads.forEach(road => {
      emissions += road.density * 50 + (road.status === 'CONGESTED' ? 30 : 0);
    });
    return Math.min(100, Math.round(emissions / Math.max(1, city.roads.size / 2)));
  };

  const getCost = (interventionsList: any[]) => {
    let cost = 0;
    interventionsList.forEach(log => {
      if (log.type === 'ADD_EDGE') cost += 150000;
      else if (log.type === 'ADD_TRANSIT') cost += 300000;
      else if (log.type === 'UPDATE_ROAD') cost += 20000;
      else if (log.type === 'UPDATE_NODE') cost += 15000;
    });
    return cost;
  };

  const getEquity = (city: CityData | null) => {
    if (!city) return 100;
    const densities = Array.from(city.intersections.values()).map(n => n.trafficDensity);
    if (densities.length === 0) return 100;
    const mean = densities.reduce((a, b) => a + b, 0) / densities.length;
    const variance = densities.reduce((a, b) => a + (b - mean) ** 2, 0) / densities.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(0, Math.round(100 - stdDev * 120));
  };

  const activeCost = getCost(interventions);
  const activeAccessibility = getAccessibility(cityData);
  const activePollution = getPollution(cityData);
  const activeEquity = getEquity(cityData);

  const baseAccessibility = getAccessibility(baselineCityData);
  const basePollution = getPollution(baselineCityData);
  const baseEquity = getEquity(baselineCityData);

  // Compute Multi-Objective Weighted Scores (0-100)
  const calculateWeightedScore = (
    speed: number,
    congestion: number,
    access: number,
    cost: number,
    pollution: number,
    equity: number
  ) => {
    // Normalize cost (0 to 1M scale)
    const normalizedCostScore = Math.max(0, 100 - (cost / 10000));
    // Speed is positive, congestion is negative impact
    const speedScore = Math.min(100, speed * 2);
    const congestionScore = Math.max(0, 100 - congestion);
    const trafficScore = (speedScore + congestionScore) / 2;

    const totalWeight = weights.traffic + weights.accessibility + weights.cost + weights.pollution + weights.equity;
    const wTraffic = weights.traffic / totalWeight;
    const wAccess = weights.accessibility / totalWeight;
    const wCost = weights.cost / totalWeight;
    const wPollution = weights.pollution / totalWeight;
    const wEquity = weights.equity / totalWeight;

    const score = 
      trafficScore * wTraffic +
      access * wAccess +
      normalizedCostScore * wCost +
      (100 - pollution) * wPollution +
      equity * wEquity;

    return Math.round(score);
  };

  const proposedScore = calculateWeightedScore(
    simState.globalMetrics.averageSpeed,
    simState.globalMetrics.congestionLevel,
    activeAccessibility,
    activeCost,
    activePollution,
    activeEquity
  );

  const baselineScore = calculateWeightedScore(
    baselineMetrics ? baselineMetrics.averageSpeed : 45,
    baselineMetrics ? baselineMetrics.congestionLevel : 0,
    baseAccessibility,
    0, // base cost is 0
    basePollution,
    baseEquity
  );

  // Save current experiment
  const handleSaveExperiment = () => {
    const newExp = {
      id: `exp_${Date.now()}`,
      name: experimentName,
      timestamp: new Date().toLocaleString(),
      metrics: {
        proposed: {
          speed: simState.globalMetrics.averageSpeed,
          travelTime: simState.globalMetrics.averageTravelTime,
          congestion: simState.globalMetrics.congestionLevel,
          throughput: simState.globalMetrics.throughput,
          accessibility: activeAccessibility,
          pollution: activePollution,
          equity: activeEquity,
          cost: activeCost,
          weightedScore: proposedScore
        },
        baseline: {
          speed: baselineMetrics ? baselineMetrics.averageSpeed : 45,
          travelTime: baselineMetrics ? baselineMetrics.averageTravelTime : 10,
          congestion: baselineMetrics ? baselineMetrics.congestionLevel : 0,
          throughput: baselineMetrics ? baselineMetrics.throughput : 0,
          accessibility: baseAccessibility,
          pollution: basePollution,
          equity: baseEquity,
          cost: 0,
          weightedScore: baselineScore
        }
      }
    };

    const updated = [...savedExperiments, newExp];
    setSavedExperiments(updated);
    localStorage.setItem('urban_intelligence_experiments', JSON.stringify(updated));
  };

  // Clear experiments
  const handleClearExperiments = () => {
    setSavedExperiments([]);
    localStorage.removeItem('urban_intelligence_experiments');
  };

  // Export JSON file
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedExperiments, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${experimentName.replace(/\s+/g, '_')}_data.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV of history
  const handleExportCSV = () => {
    if (metricsHistory.length === 0) return;
    const headers = ['Timestamp', 'Avg Speed (km/h)', 'Travel Time (s)', 'Congestion (%)'];
    const rows = metricsHistory.map(pt => [pt.time, pt.speed, pt.travelTime, pt.congestion]);
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    rows.forEach(row => {
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", "traffic_history_metrics.csv");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // SVG Chart drawer helper
  const renderLineChart = (data: any[], key: string, color: string, maxVal: number) => {
    if (data.length < 2) {
      return (
        <div style={{ display: 'flex', height: '110px', justifyContent: 'center', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
          Simulation running, gathering metrics...
        </div>
      );
    }
    const width = 340;
    const height = 110;
    const padding = 15;
    
    const points = data.map((d, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - (d[key] / maxVal) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-color)" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--border-color)" strokeWidth="1" />
        
        {/* Grid Line */}
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#141a24" strokeWidth="0.5" strokeDasharray="3,3" />

        {/* Polylines */}
        <polyline fill="none" stroke={color} strokeWidth="1.8" points={points} />

        {/* Start / End values text */}
        <text x={padding} y={height - 2} fill="var(--text-muted)" fontSize="8px" fontFamily="var(--font-mono)">
          {data[0].time.split(' ')[0]}
        </text>
        <text x={width - padding * 2} y={height - 2} fill="var(--text-muted)" fontSize="8px" fontFamily="var(--font-mono)">
          {data[data.length - 1].time.split(' ')[0]}
        </text>
        <text x={2} y={padding + 5} fill={color} fontSize="8px" fontFamily="var(--font-mono)">
          {data[data.length - 1][key]}
        </text>
      </svg>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, height: '100%', overflowY: 'auto' }}>
      
      {/* LEFT: Charts & Comparison Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* LINE CHARTS GRID */}
        <Panel title="REAL-TIME METRICS ANALYSIS">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px' }}>
              <span className="text-xs text-secondary font-medium">Congestion Index vs Time</span>
              {renderLineChart(metricsHistory, 'congestion', 'var(--color-warning)', 100)}
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px' }}>
              <span className="text-xs text-secondary font-medium">Average Speed (km/h) vs Time</span>
              {renderLineChart(metricsHistory, 'speed', 'var(--color-accent)', 100)}
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px' }}>
              <span className="text-xs text-secondary font-medium">Average Travel Time (s) vs Time</span>
              {renderLineChart(metricsHistory, 'travelTime', '#10b981', 40)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px dashed var(--border-color)', borderRadius: '4px', padding: '10px' }}>
              <span className="text-xs text-muted">EXPORT CSV METRICS HISTORY</span>
              <Button
                onClick={handleExportCSV}
                disabled={metricsHistory.length === 0}
                icon={<FileSpreadsheet size={12} />}
                style={{ marginTop: '8px', fontSize: '11px' }}
              >
                DOWNLOAD CSV METRICS
              </Button>
            </div>
          </div>
        </Panel>

        {/* COMPARISON METRICS GRID */}
        <Panel title="SCENARIO METRICS SCORECARD">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px' }}>EVALUATION OBJECTIVE</th>
                  <th style={{ padding: '8px' }}>BASELINE STATE</th>
                  <th style={{ padding: '8px' }}>PROPOSED STATE</th>
                  <th style={{ padding: '8px' }}>DELTA (%)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>Average Speed</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{baselineMetrics ? baselineMetrics.averageSpeed : 45} km/h</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{simState.globalMetrics.averageSpeed} km/h</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', color: simState.globalMetrics.averageSpeed >= (baselineMetrics?.averageSpeed || 45) ? '#10b981' : '#ef4444' }}>
                    {(((simState.globalMetrics.averageSpeed - (baselineMetrics?.averageSpeed || 45)) / (baselineMetrics?.averageSpeed || 45)) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>Average Travel Time</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{baselineMetrics ? baselineMetrics.averageTravelTime : 10} s</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{simState.globalMetrics.averageTravelTime} s</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', color: simState.globalMetrics.averageTravelTime <= (baselineMetrics?.averageTravelTime || 10) ? '#10b981' : '#ef4444' }}>
                    {(((simState.globalMetrics.averageTravelTime - (baselineMetrics?.averageTravelTime || 10)) / (baselineMetrics?.averageTravelTime || 10)) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>Congestion Level</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{baselineMetrics ? baselineMetrics.congestionLevel : 0}%</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{simState.globalMetrics.congestionLevel}%</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', color: simState.globalMetrics.congestionLevel <= (baselineMetrics?.congestionLevel || 0) ? '#10b981' : '#ef4444' }}>
                    {simState.globalMetrics.congestionLevel - (baselineMetrics?.congestionLevel || 0)}%
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>Throughput Rate</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{baselineMetrics ? baselineMetrics.throughput : 0} veh/m</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{simState.globalMetrics.throughput} veh/m</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', color: simState.globalMetrics.throughput >= (baselineMetrics?.throughput || 0) ? '#10b981' : '#ef4444' }}>
                    {baselineMetrics?.throughput ? (((simState.globalMetrics.throughput - baselineMetrics.throughput) / baselineMetrics.throughput) * 100).toFixed(1) : '0.0'}%
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>Simulated Accessibility</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{baseAccessibility}%</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{activeAccessibility}%</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', color: activeAccessibility >= baseAccessibility ? '#10b981' : '#ef4444' }}>
                    {activeAccessibility - baseAccessibility}%
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px', fontWeight: 500 }}>Pollution Proxy</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{basePollution}%</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)' }}>{activePollution}%</td>
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', color: activePollution <= basePollution ? '#10b981' : '#ef4444' }}>
                    {activePollution - basePollution}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: '10px' }}>
            <span className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={10} />
              SIMULATED ACCESSIBILITY: Reachable neighbor destinations within a 15-second travel time.
            </span>
            <span className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={10} />
              POLLUTION PROXY: Estimated emissions index based on vehicle queuing and density (Not a real air quality model).
            </span>
          </div>
        </Panel>
      </div>

      {/* RIGHT: Multi-Objective trade-off & Weights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* WEIGHT ADJUSTER */}
        <Panel title="MULTI-OBJECTIVE TRADE-OFFS">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="text-xs text-muted">USER-DEFINED OBJECTIVE WEIGHTS</span>
            
            {/* TRAFFIC SLIDER */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span className="text-secondary">Traffic Flow (Congestion)</span>
                <span className="text-mono">{weights.traffic}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.traffic}
                onChange={(e) => setWeights(prev => ({ ...prev, traffic: parseInt(e.target.value) }))}
                style={{ accentColor: 'var(--color-accent)' }}
              />
            </div>

            {/* ACCESSIBILITY SLIDER */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span className="text-secondary">Simulated Accessibility</span>
                <span className="text-mono">{weights.accessibility}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.accessibility}
                onChange={(e) => setWeights(prev => ({ ...prev, accessibility: parseInt(e.target.value) }))}
                style={{ accentColor: 'var(--color-accent)' }}
              />
            </div>

            {/* COST SLIDER */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span className="text-secondary">Financial Cost Budget</span>
                <span className="text-mono">{weights.cost}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.cost}
                onChange={(e) => setWeights(prev => ({ ...prev, cost: parseInt(e.target.value) }))}
                style={{ accentColor: 'var(--color-accent)' }}
              />
            </div>

            {/* POLLUTION SLIDER */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span className="text-secondary">Pollution Proxy</span>
                <span className="text-mono">{weights.pollution}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.pollution}
                onChange={(e) => setWeights(prev => ({ ...prev, pollution: parseInt(e.target.value) }))}
                style={{ accentColor: 'var(--color-accent)' }}
              />
            </div>

            {/* EQUITY SLIDER */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span className="text-secondary">Social Equity</span>
                <span className="text-mono">{weights.equity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights.equity}
                onChange={(e) => setWeights(prev => ({ ...prev, equity: parseInt(e.target.value) }))}
                style={{ accentColor: 'var(--color-accent)' }}
              />
            </div>
          </div>
        </Panel>

        {/* SCENARIO WEIGHTED RANKINGS */}
        <Panel title="MODEL WEIGHTED RANKING">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Proposed score card */}
              <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span className="text-secondary font-medium">Proposed Scenario Score</span>
                  <span className="text-mono font-bold" style={{ color: 'var(--color-accent)' }}>
                    {proposedScore} / 100
                  </span>
                </div>
                <div style={{ height: '5px', backgroundColor: '#1e293b', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${proposedScore}%`, backgroundColor: 'var(--color-accent)' }} />
                </div>
              </div>

              {/* Baseline score card */}
              <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span className="text-secondary font-medium">Baseline Scenario Score</span>
                  <span className="text-mono font-bold" style={{ color: '#64748b' }}>
                    {baselineScore} / 100
                  </span>
                </div>
                <div style={{ height: '5px', backgroundColor: '#1e293b', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${baselineScore}%`, backgroundColor: '#64748b' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', padding: '8px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
              <AlertCircle size={14} className="text-muted" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span className="text-xs text-muted" style={{ fontSize: '10px', lineHeight: 1.4 }}>
                This ranking and weighted score represents trade-offs that depend on user-defined objective weights. No single scenario is universally best.
              </span>
            </div>
          </div>
        </Panel>

        {/* LOCAL STORAGE ARCHIVE */}
        <Panel title="EXPERIMENT EXPORTER">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="text-xs text-secondary" htmlFor="exp-name-input">Save Experiment Label</label>
              <input
                id="exp-name-input"
                type="text"
                value={experimentName}
                onChange={(e) => setExperimentName(e.target.value)}
                style={{
                  padding: '6px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Button
                onClick={handleSaveExperiment}
                icon={<Save size={12} />}
                style={{ fontSize: '11px', padding: '6px' }}
              >
                SAVE LOG
              </Button>
              <Button
                onClick={handleExportJSON}
                disabled={savedExperiments.length === 0}
                icon={<Download size={12} />}
                style={{ fontSize: '11px', padding: '6px' }}
              >
                EXPORT JSON
              </Button>
            </div>

            {savedExperiments.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-xs text-muted">SAVED ARTIFACTS ({savedExperiments.length})</span>
                  <Button
                    onClick={handleClearExperiments}
                    style={{ fontSize: '9px', padding: '2px 4px', color: 'var(--color-danger)' }}
                  >
                    CLEAR ALL
                  </Button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: '80px', overflowY: 'auto' }}>
                  {savedExperiments.map(exp => (
                    <div 
                      key={exp.id} 
                      style={{ display: 'flex', justifyContent: 'space-between', padding: '4px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '3px', fontSize: '9px' }}
                    >
                      <span className="text-secondary">{exp.name}</span>
                      <span className="text-mono text-muted">{exp.timestamp.split(',')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Panel>

      </div>
    </div>
  );
};
export default Analytics;
