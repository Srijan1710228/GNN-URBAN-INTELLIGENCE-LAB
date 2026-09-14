import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Panel, Button } from './UIComponents';
import { buildUrbanGraph } from '../simulation/graphBuilder';
import { getNodeNeighbors } from '../simulation/graphAlgorithms';
import { Play, Pause, ChevronRight, RotateCcw } from 'lucide-react';

type GnnStage = 
  | 'NEIGHBORHOOD' 
  | 'MESSAGE_PASSING' 
  | 'AGGREGATION' 
  | 'NODE_UPDATE' 
  | 'NEW_EMBEDDING' 
  | 'PREDICTION';

export const GnnLab: React.FC = () => {
  const { cityData, simState, selectedNodeId, proposedPredictions } = useApp();

  const [activeStage, setActiveStage] = useState<GnnStage>('NEIGHBORHOOD');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [particleProgress, setParticleProgress] = useState<number>(0);
  const animationRef = useRef<number | null>(null);

  const graph = buildUrbanGraph(cityData, simState);
  const selectedNode = selectedNodeId ? graph.nodes.get(selectedNodeId) : null;
  const neighbors = selectedNodeId ? getNodeNeighbors(selectedNodeId, graph) : [];

  const predictions = selectedNodeId ? proposedPredictions.get(selectedNodeId) : null;

  // Stages sequence
  const stages: GnnStage[] = [
    'NEIGHBORHOOD',
    'MESSAGE_PASSING',
    'AGGREGATION',
    'NODE_UPDATE',
    'NEW_EMBEDDING',
    'PREDICTION'
  ];

  const handleStep = () => {
    const currIdx = stages.indexOf(activeStage);
    const nextIdx = (currIdx + 1) % stages.length;
    setActiveStage(stages[nextIdx]);
    if (stages[nextIdx] === 'MESSAGE_PASSING') {
      setParticleProgress(0);
    }
  };

  const handleReset = () => {
    setActiveStage('NEIGHBORHOOD');
    setIsPlaying(false);
    setParticleProgress(0);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  // Animate particle flow during MESSAGE_PASSING stage
  useEffect(() => {
    if (activeStage === 'MESSAGE_PASSING' && isPlaying) {
      const animate = () => {
        setParticleProgress(prev => {
          if (prev >= 1) {
            // Advance to next stage automatically when particles reach destination
            setIsPlaying(false);
            setActiveStage('AGGREGATION');
            return 1;
          }
          return prev + 0.02;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [activeStage, isPlaying]);

  // Handle Play/Pause
  useEffect(() => {
    if (isPlaying && activeStage !== 'MESSAGE_PASSING') {
      const timer = setTimeout(() => {
        handleStep();
      }, 2000); // 2 seconds per stage
      return () => clearTimeout(timer);
    }
  }, [isPlaying, activeStage]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Neighborhood aggregation math
  const getAggregatedFeatures = () => {
    if (neighbors.length === 0) return { pop: 0, comm: 0, green: 0 };
    let sumPop = 0, sumComm = 0, sumGreen = 0;
    neighbors.forEach(nId => {
      const n = graph.nodes.get(nId)!;
      sumPop += n.features.vehicleCount * 2; // scale for visualization
      sumComm += n.features.averageSpeed;
      sumGreen += n.features.queueLength;
    });
    return {
      pop: Math.round(sumPop / neighbors.length),
      comm: Math.round(sumComm / neighbors.length),
      green: Math.round(sumGreen / neighbors.length)
    };
  };

  const agg = getAggregatedFeatures();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, height: '100%' }}>
      {/* LEFT: VISUAL Whiteboard Graph Canvas */}
      <Panel title="CONCEPTUAL GNN WHITEBOARD">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
          {selectedNode ? (
            <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '340px', background: '#080a0e', borderRadius: '4px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              {/* Radial Node Drawing */}
              <svg width="450" height="320" style={{ position: 'relative', zIndex: 10 }}>
                {/* Target Node A (Center) */}
                <g transform="translate(225, 160)">
                  <circle 
                    r="24" 
                    fill="var(--color-accent-dim)" 
                    stroke="var(--color-accent)" 
                    strokeWidth="2.5"
                    style={{
                      transition: 'all 0.3s ease',
                      filter: activeStage === 'NODE_UPDATE' || activeStage === 'NEW_EMBEDDING' ? 'drop-shadow(0 0 8px var(--color-accent))' : ''
                    }}
                  />
                  <text dy="4" textAnchor="middle" fill="#ffffff" fontSize="10px" fontFamily="var(--font-mono)">
                    {selectedNode.id}
                  </text>
                  <text y="38" textAnchor="middle" fill="var(--color-accent)" fontSize="10px" fontWeight="bold">
                    TARGET NODE
                  </text>
                </g>

                {/* Neighbor Nodes */}
                {neighbors.slice(0, 5).map((nId, idx) => {
                  const node = graph.nodes.get(nId)!;
                  const total = Math.min(5, neighbors.length);
                  const angle = (idx * Math.PI * 2) / total - Math.PI / 2;
                  const radius = 110;
                  const nx = 225 + Math.cos(angle) * radius;
                  const ny = 160 + Math.sin(angle) * radius;

                  // Particle Coordinates (for message passing flow animation)
                  const px = nx + (225 - nx) * particleProgress;
                  const py = ny + (160 - ny) * particleProgress;

                  return (
                    <g key={nId}>
                      {/* Connector Line */}
                      <line
                        x1={nx}
                        y1={ny}
                        x2={225}
                        y2={160}
                        stroke="#1e293b"
                        strokeWidth="1.5"
                      />

                      {/* Moving Particle */}
                      {activeStage === 'MESSAGE_PASSING' && (
                        <circle
                          cx={px}
                          cy={py}
                          r="4"
                          fill="var(--color-accent)"
                          style={{ filter: 'drop-shadow(0 0 4px var(--color-accent))' }}
                        />
                      )}

                      {/* Neighbor Node Circle */}
                      <circle
                        cx={nx}
                        cy={ny}
                        r="16"
                        fill="#111827"
                        stroke={activeStage === 'NEIGHBORHOOD' ? '#00e5ff' : '#4b5563'}
                        strokeWidth="1.5"
                      />
                      <text
                        x={nx}
                        y={ny + 3}
                        textAnchor="middle"
                        fill="#9ca3af"
                        fontSize="8px"
                        fontFamily="var(--font-mono)"
                      >
                        {node.id.replace('int_', '')}
                      </text>
                      
                      {/* Small Feature Text tag */}
                      <text
                        x={nx}
                        y={ny - 20}
                        textAnchor="middle"
                        fill="#6b7280"
                        fontSize="8px"
                        fontFamily="var(--font-mono)"
                      >
                        {`[${(node.features.trafficDensity * 10).toFixed(0)}, ${node.features.queueLength}]`}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Status HUD overlay */}
              <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="text-xs text-muted">CURRENT STAGE</span>
                <span className="text-mono text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
                  {activeStage.replace('_', ' ')}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '340px', border: '1px dashed var(--border-color)', borderRadius: '4px' }}>
              <span className="text-sm text-secondary">SELECT A NODE IN THE SIMULATION / GRAPH TAB TO DEMONSTRATE</span>
            </div>
          )}

          {/* PIPELINE PROGRESS BAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="text-xs text-secondary">GNN PIPELINE FLOW</span>
            <div style={{ display: 'flex', gap: 4, width: '100%' }}>
              {stages.map((stage) => {
                const isActive = activeStage === stage;
                const isCompleted = stages.indexOf(activeStage) > stages.indexOf(stage);
                return (
                  <div
                    key={stage}
                    style={{
                      flex: 1,
                      height: '6px',
                      borderRadius: '2px',
                      backgroundColor: isActive 
                        ? 'var(--color-accent)' 
                        : isCompleted
                        ? 'var(--color-accent-dim)'
                        : '#1e293b',
                      transition: 'all 0.2s ease'
                    }}
                    title={stage}
                  />
                );
              })}
            </div>
            {/* Step text labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', textAlign: 'center', fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>NEIGHBOR</span>
              <span>PASSING</span>
              <span>AGGREGATE</span>
              <span>UPDATE</span>
              <span>EMBEDDING</span>
              <span>PREDICTION</span>
            </div>
          </div>
        </div>
      </Panel>

      {/* RIGHT: CONTROLS & EXPLANATION PANEL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Panel title="DEMONSTRATION PANEL">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '8px' }}>
              <span className="text-xs text-muted">Status</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '4px' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: isPlaying ? 'var(--color-accent)' : 'var(--text-muted)' }} />
                <span className="text-mono text-xs">{isPlaying ? 'PLAYING ANIMATION' : 'IDLE'}</span>
              </div>
            </div>

            {/* Play controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Button 
                onClick={togglePlay} 
                disabled={!selectedNodeId}
                variant={isPlaying ? 'primary' : 'default'}
                icon={isPlaying ? <Pause size={12} /> : <Play size={12} />}
                style={{ fontSize: '11px', padding: '6px 4px' }}
              >
                {isPlaying ? 'PAUSE' : 'PLAY GNN'}
              </Button>
              <Button 
                onClick={handleStep}
                disabled={!selectedNodeId || isPlaying}
                icon={<ChevronRight size={12} />}
                style={{ fontSize: '11px', padding: '6px 4px' }}
              >
                STEP
              </Button>
            </div>

            <Button 
              onClick={handleReset}
              disabled={!selectedNodeId}
              icon={<RotateCcw size={12} />}
              style={{ width: '100%', fontSize: '11px', padding: '6px' }}
            >
              RESET DEMO
            </Button>
          </div>
        </Panel>

        <Panel title="MATHEMATICAL FORMULATION">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '11px', lineHeight: 1.4 }}>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px', textAlign: 'center' }}>
              <span className="text-mono text-xs" style={{ color: 'var(--color-accent)' }}>
                hᵢ^(l+1) = UPDATE( hᵢ^(l), AGGREGATE( hⱼ^(l), j ∈ N(i) ) )
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="text-mono text-primary font-bold">hᵢ</span>
                <span className="text-secondary">Node embedding vector representation</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="text-mono text-primary font-bold">N(i)</span>
                <span className="text-secondary">Direct topology neighbor node index set</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="text-mono text-primary font-bold">AGG</span>
                <span className="text-secondary">Pooling function combining neighbor states</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="text-mono text-primary font-bold">UPD</span>
                <span className="text-secondary">Transformation mapping to update embedding</span>
              </div>
            </div>
          </div>
        </Panel>

        {selectedNodeId && (
          <Panel title="CURRENT PIPELINE DATA">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '11px' }}>
              {activeStage === 'NEIGHBORHOOD' && (
                <div>
                  <span className="text-xs text-muted">TARGET NODE: {selectedNodeId}</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span className="text-secondary">Neighbors Count:</span>
                    <span className="text-mono font-semibold">{neighbors.length}</span>
                  </div>
                </div>
              )}

              {activeStage === 'MESSAGE_PASSING' && (
                <div>
                  <span className="text-xs text-muted">PROPAGATING MESSAGES</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span className="text-secondary">Flow progress:</span>
                    <span className="text-mono font-semibold">{(particleProgress * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}

              {activeStage === 'AGGREGATION' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="text-xs text-muted">AGGREGATED FEATURES</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Mean vehicleCount:</span>
                    <span className="text-mono font-semibold">{agg.pop}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Mean Speed:</span>
                    <span className="text-mono font-semibold">{agg.comm} km/h</span>
                  </div>
                </div>
              )}

              {activeStage === 'NODE_UPDATE' && (
                <div>
                  <span className="text-xs text-muted">UPDATE FUNCTION TRANSFORMATION</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span className="text-secondary">Self state factor:</span>
                    <span className="text-mono font-semibold">0.65</span>
                  </div>
                </div>
              )}

              {activeStage === 'NEW_EMBEDDING' && (
                <div>
                  <span className="text-xs text-muted">UPDATED EMBEDDING VECTOR</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span className="text-secondary">Embedding (h_A):</span>
                    <span className="text-mono font-semibold">[0.82, 0.44, 0.12]</span>
                  </div>
                </div>
              )}

              {activeStage === 'PREDICTION' && predictions && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="text-xs text-muted">GNN SIMULATION OUTPUTS</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Predicted Congestion:</span>
                    <span className="text-mono font-semibold" style={{ color: 'var(--color-warning)' }}>
                      {predictions.trafficCongestion}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Predicted Activity:</span>
                    <span className="text-mono font-semibold" style={{ color: 'var(--color-accent)' }}>
                      {predictions.commercialActivity}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
};
export default GnnLab;
