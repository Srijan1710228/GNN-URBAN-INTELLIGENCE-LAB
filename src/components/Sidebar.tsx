import React from 'react';
import { useApp } from '../context/AppContext';
import { Panel, MetricCard, Button } from './UIComponents';
import { RefreshCw, ChevronLeft, ChevronRight, Shuffle, Play, Pause, RotateCcw } from 'lucide-react';
import { formatSimTime, getDemandPeakLabel } from '../simulation/simulationEngine';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { 
    gnnIterations, 
    setGnnIterations, 
    resetProposedGraph,
    activeScenario,
    setActiveScenario,
    seed,
    setSeed,
    regenerateCity,
    simState,
    setIsPlaying,
    setSimSpeed,
    setDemandSetting,
    resetSimulation
  } = useApp();

  const metrics = simState.globalMetrics;

  return (
    <aside 
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      aria-label="Simulation controls"
      style={{ position: 'relative' }}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="btn"
        style={{
          position: 'absolute',
          top: '12px',
          right: collapsed ? '-32px' : '8px',
          zIndex: 20,
          padding: '4px',
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
          borderRadius: '4px'
        }}
        aria-label={collapsed ? "Expand left sidebar" : "Collapse left sidebar"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {!collapsed && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* SIMULATION TIMER & SPEED CONTROLS */}
          <Panel title="LIVE SIMULATION">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0, 229, 255, 0.05)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <span className="text-mono" style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-accent)' }}>
                  {formatSimTime(simState.timeOfDaySeconds)}
                </span>
                <span className="text-xs text-secondary" style={{ fontSize: '9px' }}>
                  {getDemandPeakLabel(simState.timeOfDaySeconds)}
                </span>
              </div>

              {/* Play / Pause / Reset Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <Button 
                  onClick={() => setIsPlaying(true)} 
                  variant={simState.isPlaying ? 'primary' : 'default'}
                  icon={<Play size={12} />}
                  style={{ fontSize: '10px', padding: '6px' }}
                >
                  PLAY
                </Button>
                <Button 
                  onClick={() => setIsPlaying(false)} 
                  variant={!simState.isPlaying && simState.vehicles.length > 0 ? 'primary' : 'default'}
                  icon={<Pause size={12} />}
                  style={{ fontSize: '10px', padding: '6px' }}
                >
                  PAUSE
                </Button>
                <Button 
                  onClick={resetSimulation} 
                  icon={<RotateCcw size={12} />}
                  style={{ fontSize: '10px', padding: '6px' }}
                >
                  RESET
                </Button>
              </div>

              {/* Speed Multipliers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label className="text-xs text-secondary">Simulation Speed</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {([1, 2, 5, 10] as const).map(speed => (
                    <button
                      key={speed}
                      onClick={() => setSimSpeed(speed)}
                      className="btn"
                      style={{
                        flex: 1,
                        padding: '4px 0',
                        fontSize: '11px',
                        backgroundColor: simState.speed === speed ? 'var(--color-accent-dim)' : '',
                        borderColor: simState.speed === speed ? 'var(--color-accent)' : '',
                        color: simState.speed === speed ? 'var(--color-accent)' : ''
                      }}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Demand Setting */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label className="text-xs text-secondary" htmlFor="demand-setting">Traffic Demand Setting</label>
                <select
                  id="demand-setting"
                  value={simState.demandSetting}
                  onChange={(e) => setDemandSetting(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  <option value="LOW">Low Demand</option>
                  <option value="NORMAL">Normal Demand</option>
                  <option value="HIGH">High Demand</option>
                </select>
              </div>
            </div>
          </Panel>

          {/* REAL-TIME TRAFFIC METRICS */}
          <Panel title="REAL-TIME METRICS">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <MetricCard 
                label="VEHICLES" 
                value={metrics.vehicleCount} 
                subtext="Active in network"
              />
              <MetricCard 
                label="AVG SPEED" 
                value={`${metrics.averageSpeed} km/h`} 
                subtext="System speed"
              />
              <MetricCard 
                label="AVG DENSITY" 
                value={`${metrics.averageDensity}%`} 
                subtext="Road utilization"
              />
              <MetricCard 
                label="CONGESTION" 
                value={`${metrics.congestionLevel}%`} 
                statusColor={metrics.congestionLevel > 50 ? 'danger' : metrics.congestionLevel > 20 ? 'warning' : 'success'}
                subtext="Congested links"
              />
              <MetricCard 
                label="QUEUE SIZE" 
                value={metrics.totalQueueLength} 
                statusColor={metrics.totalQueueLength > 30 ? 'warning' : 'success'}
                subtext="Waiting at nodes"
              />
              <MetricCard 
                label="THROUGHPUT" 
                value={`${metrics.throughput}/min`} 
                subtext="Trips completed"
              />
            </div>
          </Panel>

          {/* SEED GENERATOR */}
          <Panel title="CITY GENERATOR">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label className="text-xs text-secondary" htmlFor="city-seed">Seed Parameter</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    id="city-seed"
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)'
                    }}
                  />
                  <Button 
                    onClick={() => regenerateCity(seed)}
                    title="Regenerate city with current seed"
                    style={{ padding: '6px' }}
                  >
                    <RefreshCw size={14} />
                  </Button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Button 
                  onClick={() => {
                    const newSeed = Math.floor(Math.random() * 100000);
                    regenerateCity(newSeed);
                  }}
                  icon={<Shuffle size={12} />}
                  style={{ fontSize: '11px', padding: '6px 4px' }}
                >
                  RANDOMIZE
                </Button>
                <Button 
                  onClick={() => regenerateCity(42)}
                  style={{ fontSize: '11px', padding: '6px 4px' }}
                >
                  RESET CITY
                </Button>
              </div>
            </div>
          </Panel>

          <Panel title="SIMULATION CONTROL">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label className="text-xs text-secondary" htmlFor="scenario-select">Active Scenario</label>
                <select
                  id="scenario-select"
                  value={activeScenario}
                  onChange={(e) => setActiveScenario(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  <option value="baseline">Baseline City</option>
                  <option value="proposed">Proposed Intervention</option>
                  <option value="comparison">Side-by-Side Comparison</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label className="text-xs text-secondary" htmlFor="gnn-iters">GNN Propagation Iterations</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    id="gnn-iters"
                    type="range"
                    min="1"
                    max="5"
                    value={gnnIterations}
                    onChange={(e) => setGnnIterations(parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--color-accent)' }}
                  />
                  <span className="text-mono text-sm">{gnnIterations}</span>
                </div>
              </div>

              <Button 
                onClick={resetProposedGraph}
                icon={<RefreshCw size={12} />}
                style={{ width: '100%', marginTop: '8px' }}
              >
                Reset Proposed City
              </Button>
            </div>
          </Panel>
        </div>
      )}
    </aside>
  );
};
export default Sidebar;
