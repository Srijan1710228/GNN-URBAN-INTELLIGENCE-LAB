import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Panel, Button, StatusIndicator } from './UIComponents';
import { Play, CheckCircle, RotateCcw, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { runScenarioSimulation } from '../simulation/scenarioEngine';
import type { Scenario } from '../simulation/scenarioEngine';
import { compareScenarioMetrics } from '../simulation/scenarioComparison';
import type { ComparisonResult } from '../simulation/scenarioComparison';

export const ScenarioLab: React.FC = () => {
  const { cityData, seed, simState } = useApp();

  // Initialize Scenario A, B, C
  const [scenarios, setScenarios] = useState<Scenario[]>(() => [
    {
      id: 'scen_a',
      name: 'Express Highway Corridor (Scenario A)',
      description: 'Establishes a 4-lane highway connection from northern suburbs to center commercial hub to bypass arterial bottle-necks.',
      baselineCityData: cityData,
      interventions: {
        addRoads: [
          { startId: 'int_10', endId: 'int_45', roadType: 'HIGHWAY' },
          { startId: 'int_45', endId: 'int_80', roadType: 'HIGHWAY' }
        ],
        transitUpgrades: [],
        tunedRoads: []
      },
      status: 'PENDING'
    },
    {
      id: 'scen_b',
      name: 'Transit-Oriented Metro Upgrades (Scenario B)',
      description: 'Upgrades high-traffic intersections to active Metro Transit Stations to study mass transit capacity relief.',
      baselineCityData: cityData,
      interventions: {
        addRoads: [],
        transitUpgrades: ['int_15', 'int_55', 'int_75'],
        tunedRoads: []
      },
      status: 'PENDING'
    },
    {
      id: 'scen_c',
      name: 'Arterial Flow Maximization (Scenario C)',
      description: 'Maximizes lane capacities and speed limits on all major arterial connections to evaluate maximum network throughput.',
      baselineCityData: cityData,
      interventions: {
        addRoads: [],
        transitUpgrades: [],
        tunedRoads: Array.from(cityData.roads.keys()).filter((_, idx) => idx % 4 === 0).map(roadId => ({
          roadId,
          capacity: 4500,
          speedLimit: 70
        }))
      },
      status: 'PENDING'
    }
  ]);

  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const handleRunScenario = (scenId: string) => {
    // Set running state
    setScenarios(prev => prev.map(s => s.id === scenId ? { ...s, status: 'RUNNING' } : s));
    setActiveScenarioId(scenId);

    // Run simulation
    setTimeout(() => {
      const targetScen = scenarios.find(s => s.id === scenId)!;
      // Re-capture fresh baselineCityData to match current seed
      targetScen.baselineCityData = cityData;
      const completed = runScenarioSimulation(targetScen, seed, 150);

      setScenarios(prev => prev.map(s => s.id === scenId ? completed : s));
    }, 100);
  };

  const handleResetScenario = (scenId: string) => {
    setScenarios(prev => prev.map(s => s.id === scenId ? { ...s, status: 'PENDING', results: undefined, modifiedCityData: undefined } : s));
    if (activeScenarioId === scenId) setActiveScenarioId(null);
  };

  const activeScenario = scenarios.find(s => s.id === activeScenarioId);
  const comparisonResults: ComparisonResult[] = (activeScenario && activeScenario.results)
    ? compareScenarioMetrics(simState.globalMetrics, activeScenario.results)
    : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, height: '100%' }}>
      
      {/* LEFT: Scenario Selection and Description cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Panel title="MODEL-BASED SCENARIOS (COUNTERFACTUALS)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            
            {/* CAUTION SCIENTIFIC DISCLAIMER WARNING */}
            <div 
              style={{ 
                padding: '12px 16px', 
                backgroundColor: 'rgba(245, 158, 11, 0.04)', 
                border: '1px solid rgba(245, 158, 11, 0.25)', 
                borderRadius: '4px',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start'
              }}
            >
              <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '11px', lineHeight: 1.45, color: '#f59e0b' }}>
                <strong>MODEL-BASED COUNTERFACTUAL SCENARIO SIMULATION</strong>
                <p style={{ marginTop: '2px', color: 'rgba(255,255,255,0.7)' }}>
                  This scenario represents the simulated consequences under the mathematical assumptions of the model. It does not by itself establish causal effects in the real world.
                </p>
              </div>
            </div>

            {scenarios.map(scen => (
              <div 
                key={scen.id}
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderColor: activeScenarioId === scen.id ? 'var(--color-accent)' : 'var(--border-color)',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 600 }}>{scen.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <StatusIndicator 
                      status={scen.status === 'COMPLETED' ? 'success' : scen.status === 'RUNNING' ? 'active' : 'idle'}
                      label={scen.status}
                    />
                  </div>
                </div>

                <p className="text-xs text-secondary">{scen.description}</p>

                {/* Scenario Intervention Specs */}
                <div style={{ display: 'flex', gap: 12, fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {scen.interventions.addRoads.length > 0 && <span>• Roads to add: {scen.interventions.addRoads.length}</span>}
                  {scen.interventions.transitUpgrades.length > 0 && <span>• Metro upgrades: {scen.interventions.transitUpgrades.length}</span>}
                  {scen.interventions.tunedRoads.length > 0 && <span>• Tuned roads: {scen.interventions.tunedRoads.length}</span>}
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: '4px' }}>
                  {scen.status !== 'COMPLETED' ? (
                    <Button
                      onClick={() => handleRunScenario(scen.id)}
                      disabled={scen.status === 'RUNNING'}
                      icon={<Play size={12} />}
                      style={{ fontSize: '11px', padding: '6px 12px' }}
                    >
                      {scen.status === 'RUNNING' ? 'SIMULATING...' : 'RUN SCENARIO'}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => setActiveScenarioId(scen.id)}
                        variant={activeScenarioId === scen.id ? 'primary' : 'default'}
                        icon={<CheckCircle size={12} />}
                        style={{ fontSize: '11px', padding: '6px 12px' }}
                      >
                        VIEW COMPARISON
                      </Button>
                      <Button
                        onClick={() => handleResetScenario(scen.id)}
                        icon={<RotateCcw size={12} />}
                        style={{ fontSize: '11px', padding: '6px 12px' }}
                      >
                        RESET
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* RIGHT: Comparison metrics dashboard panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Panel title="SCENARIO COMPARATOR">
          {activeScenario && activeScenario.results ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <span className="text-xs text-muted">COMPARING WITH CURRENT SIMULATION</span>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)', marginTop: '2px' }}>
                  {activeScenario.name}
                </h4>
              </div>

              {/* Comparison table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {comparisonResults.map(res => {
                  const isBetter = res.status === 'better';
                  const isWorse = res.status === 'worse';
                  const color = isBetter ? '#10b981' : isWorse ? '#ef4444' : 'var(--text-secondary)';
                  const Icon = isBetter ? TrendingUp : isWorse ? TrendingDown : null;

                  return (
                    <div 
                      key={res.metric}
                      style={{
                        padding: '10px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span className="text-secondary font-medium">{res.metric}</span>
                        <span className="text-mono font-bold" style={{ color }}>
                          {res.scenario.toFixed(1)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                        <span>Current: {res.baseline.toFixed(1)}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 2, color }}>
                          {Icon && <Icon size={10} />}
                          {res.delta > 0 ? '+' : ''}{res.delta.toFixed(1)} ({res.delta > 0 ? '+' : ''}{res.percentChange.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ padding: '60px 16px', textAlign: 'center' }}>
              <span className="text-xs text-muted">RUN A SCENARIO AND CHOOSE VIEW COMPARISON TO INSPECT ANALYTICAL RESULTS</span>
            </div>
          )}
        </Panel>
      </div>

    </div>
  );
};
export default ScenarioLab;
