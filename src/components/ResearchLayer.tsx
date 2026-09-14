import React from 'react';
import { useApp } from '../context/AppContext';
import { Panel } from './UIComponents';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { buildUrbanGraph } from '../simulation/graphBuilder';
import { getNodeNeighbors, getNodeDegree } from '../simulation/graphAlgorithms';

export const ResearchLayer: React.FC = () => {
  const { cityData, selectedNodeId, simState, proposedGraph } = useApp();

  const graph = buildUrbanGraph(cityData, simState);
  const selectedNode = selectedNodeId ? graph.nodes.get(selectedNodeId) : null;
  const proposedNode = selectedNodeId ? proposedGraph.nodes.get(selectedNodeId) : null;
  const neighbors = selectedNodeId ? getNodeNeighbors(selectedNodeId, graph) : [];
  const degree = selectedNodeId ? getNodeDegree(selectedNodeId, graph) : 0;

  // Conceptual Explainability calculations
  const getImportantNeighbors = () => {
    if (!selectedNodeId || neighbors.length === 0) return [];
    return neighbors.map((nId, idx) => {
      const node = graph.nodes.get(nId)!;
      // Mock an attention/influence score based on traffic density and degree
      const score = Math.min(98, Math.round(50 + (node.features.trafficDensity * 40) + (idx * 2)));
      return { id: nId, score };
    }).sort((a, b) => b.score - a.score);
  };

  const getImportantFeatures = () => {
    if (!selectedNode || !proposedNode) return [];
    return [
      { name: 'Traffic Density / Flow Rate', score: Math.round(selectedNode.features.trafficDensity * 90) + 5 },
      { name: 'Queued Vehicles Count', score: Math.min(95, selectedNode.features.queueLength * 12 + 5) },
      { name: 'Zone Type Influence', score: proposedNode.type === 'commercial' ? 80 : proposedNode.type === 'residential' ? 60 : 30 },
      { name: 'Connected Roads Degree', score: Math.min(100, degree * 20) }
    ].sort((a, b) => b.score - a.score);
  };

  const importantNeighbors = getImportantNeighbors();
  const importantFeatures = getImportantFeatures();

  const pipeline = [
    { name: 'OBSERVE', desc: 'Simulate urban traffic movements' },
    { name: 'REPRESENT', desc: 'Convert road networks to topological G(t)' },
    { name: 'LEARN', desc: 'Message passing representations' },
    { name: 'PREDICT', desc: 'GNN traffic forecasting layers' },
    { name: 'INTERVENE', desc: 'Apply structural updates to topology' },
    { name: 'SIMULATE', desc: 'Test interventions under model rules' },
    { name: 'COMPARE', desc: 'Analyze score changes from baseline' },
    { name: 'EXPLAIN', desc: 'Spatially trace message propagation' },
    { name: 'DECISION SUPPORT', desc: 'Multi-objective trade-off scores' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, height: '100%', overflowY: 'auto' }}>
      
      {/* LEFT: Scientific poster / Research roadmap */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Core Vision Panel */}
        <Panel title="RESEARCH CONTEXT & VISION">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ borderLeft: '3px solid var(--color-accent)', paddingLeft: '12px', fontStyle: 'italic', fontSize: '14px', lineHeight: 1.5 }}>
              "From learning the structure of the city to asking how the city may respond when its structure changes."
            </div>
            
            {/* Pipeline Flowchart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: '8px' }}>
              <span className="text-xs text-muted">URBAN INTELLIGENCE LABORATORY PIPELINE FLOW</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {pipeline.map((p, idx) => (
                  <div 
                    key={p.name}
                    style={{ 
                      padding: '8px', 
                      backgroundColor: 'var(--bg-secondary)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', color: 'var(--color-accent)' }}>
                      {idx + 1}. {p.name}
                    </div>
                    <span className="text-secondary" style={{ fontSize: '9px' }}>{p.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        {/* Research Questions & Hypotheses */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Panel title="RESEARCH QUESTIONS (RQs)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '11px', maxHeight: '280px', overflowY: 'auto' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span className="font-semibold text-mono text-primary">RQ1: Network Representation</span>
                <p className="text-secondary">How should an urban environment be represented as a topological graph grid?</p>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span className="font-semibold text-mono text-primary">RQ2: Relational Relevance</span>
                <p className="text-secondary">Which relational dimensions matter? (Geographic, Physical, Mobility, or zoning relations)</p>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span className="font-semibold text-mono text-primary">RQ3: Temporal Modeling</span>
                <p className="text-secondary">How should real-time dynamic congestion vectors be represented over static networks?</p>
              </div>
              <div>
                <span className="font-semibold text-mono text-primary">RQ4: Causal Counterfactuals</span>
                <p className="text-secondary">Can GNN surrogate models reliably predict results under structural modifications?</p>
              </div>
            </div>
          </Panel>

          <Panel title="HYPOTHESES TO TEST">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '11px', maxHeight: '280px', overflowY: 'auto' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span className="font-semibold text-mono text-primary">H1: Relational Bias</span>
                <p className="text-secondary">Explicit relational graph structure improves prediction compared with models that ignore adjacency links.</p>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span className="font-semibold text-mono text-primary">H2: Dynamic Sensitivity</span>
                <p className="text-secondary">Dynamic temporal graphs improve forecast accuracy under changing peak hour constraints.</p>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span className="font-semibold text-mono text-primary">H3: Surrogate Viability</span>
                <p className="text-secondary">A validated GNN surrogate enables fast spatial optimization compared to heavy micro-simulations.</p>
              </div>
              <div>
                <span className="font-semibold text-mono text-primary">H4: Interpretability</span>
                <p className="text-secondary">Attention-weighted message passing exposes bottleneck structures to city planners.</p>
              </div>
            </div>
          </Panel>
        </div>

        {/* Research Challenges */}
        <Panel title="RESEARCH & EMPIRICAL CHALLENGES">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '11px' }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <AlertCircle size={12} className="text-muted" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span className="text-secondary">
                <strong>Abstraction Bias:</strong> Urban graphs simplify complex three-dimensional cities into simple static nodes.
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <AlertCircle size={12} className="text-muted" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span className="text-secondary">
                <strong>Predictive ≠ Causal:</strong> High forecasting validation rates do not prove causal validity of interventions.
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <AlertCircle size={12} className="text-muted" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span className="text-secondary">
                <strong>Induced Demand Shift:</strong> Adding roads alters driver behavior, shifting bottlenecks rather than clearing them.
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <AlertCircle size={12} className="text-muted" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span className="text-secondary">
                <strong>Multi-Objective Discordance:</strong> Optimizing throughput rates often degrades emissions proxies.
              </span>
            </div>
          </div>
        </Panel>
      </div>

      {/* RIGHT: Explainability Sandbox */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* EXPLAINABILITY CARD */}
        <Panel title="GNN SPATIAL EXPLAINER">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            
            {/* Strict conceptual explainer warning */}
            <div style={{ display: 'flex', gap: 8, padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '4px' }}>
              <ShieldAlert size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '10px', lineHeight: 1.45, color: '#ef4444' }}>
                <strong>CONCEPTUAL EXPLANATION LAYER</strong>
                <p style={{ marginTop: '2px', color: 'rgba(255,255,255,0.7)' }}>
                  This panel models theoretical explainability. Node attention weights are mock indices calculated under GNN heuristics and do not represent a real SHAP or GNNExplainer run.
                </p>
              </div>
            </div>

            {selectedNode && proposedNode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '12px' }}>
                <div>
                  <span className="text-xs text-muted">TARGET NODE UNDER ANALYSIS</span>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '2px' }}>{selectedNodeId}</div>
                </div>

                {/* Important Neighbors */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="text-xs text-muted">MOST INFLUENTIAL NEIGHBOR NODES</span>
                  {importantNeighbors.slice(0, 3).map(n => (
                    <div 
                      key={n.id}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '6px', 
                        backgroundColor: 'var(--bg-secondary)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '3px' 
                      }}
                    >
                      <span className="text-mono">{n.id}</span>
                      <span className="text-mono font-semibold" style={{ color: 'var(--color-accent)' }}>
                        {n.score}% Influence
                      </span>
                    </div>
                  ))}
                </div>

                {/* Important Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                  <span className="text-xs text-muted">FEATURE ATTRIBUTION SUMMARY</span>
                  {importantFeatures.map(f => (
                    <div key={f.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
                        <span>{f.name}</span>
                        <span>{f.score}%</span>
                      </div>
                      <div style={{ height: '4px', backgroundColor: '#1e293b', borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
                        <div style={{ height: '100%', width: `${f.score}%`, backgroundColor: 'var(--color-accent)' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Topology Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px solid var(--border-color)', paddingTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Degree Centrality:</span>
                    <span className="text-mono">{degree} connections</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Message Passing Path:</span>
                    <span className="text-mono">Isolated 1-Hop Ego Network</span>
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                <span className="text-xs text-muted">SELECT ANY INTERSECTION ON THE ACTIVE CITY MAP TO RUN CONCEPTUAL GNN EXPLAINER</span>
              </div>
            )}

          </div>
        </Panel>

      </div>
      
    </div>
  );
};
export default ResearchLayer;
