import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Panel, MetricCard, Button } from './UIComponents';
import { Trash2, ChevronLeft, ChevronRight, Navigation, MapPin, Info, Eye } from 'lucide-react';
import { buildUrbanGraph } from '../simulation/graphBuilder';
import { getNodeNeighbors, getNodeDegree, calculateShortestPath } from '../simulation/graphAlgorithms';

interface InspectorProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const Inspector: React.FC<InspectorProps> = ({ collapsed, setCollapsed }) => {
  const {
    cityData,
    simState,
    selectedNodeId,
    selectedEdgeId,
    selectedNodeIds,
    selectedEdgeIds,
    gnnInfluenceHop,
    setGnnInfluenceHop,
    gnnInfluenceEnabled,
    setGnnInfluenceEnabled,
    proposedGraph,
    proposedPredictions,
    baselinePredictions,
    proposedCentrality,
    baselineCentrality,
    updateNodeFeatures,
    removeNode,
    removeEdge,
    routeStartId,
    routeEndId,
    setRouteStartId,
    setRouteEndId
  } = useApp();

  const [showInfoOpen, setShowInfoOpen] = useState<boolean>(false);

  const selectedNode = selectedNodeId ? proposedGraph.nodes.get(selectedNodeId) : null;
  const selectedEdge = selectedEdgeId ? proposedGraph.edges.get(selectedEdgeId) : null;

  // Build live graph for topology metrics
  const graph = buildUrbanGraph(cityData, simState);
  const liveNode = selectedNodeId ? graph.nodes.get(selectedNodeId) : null;
  const liveEdge = selectedEdgeId ? graph.edges.get(selectedEdgeId) : null;

  // Predict values for comparing
  const propPred = selectedNodeId ? proposedPredictions.get(selectedNodeId) : null;
  const basePred = selectedNodeId ? baselinePredictions.get(selectedNodeId) : null;

  // Centrality values
  const propCloseness = selectedNodeId ? proposedCentrality.closeness.get(selectedNodeId) : 0;
  const baseCloseness = selectedNodeId ? baselineCentrality.closeness.get(selectedNodeId) : 0;

  const propDegree = selectedNodeId ? proposedCentrality.degree.get(selectedNodeId) : 0;
  const baseDegree = selectedNodeId ? baselineCentrality.degree.get(selectedNodeId) : 0;

  const isAnySelected = selectedNodeIds.length > 0 || selectedEdgeIds.length > 0;

  // Node Name mapping
  const nodeNames: Record<string, string> = {
    'int_0': 'Cubbon Forest Entry',
    'int_1': 'Chinnaswamy West',
    'int_2': 'Queen\'s Statue',
    'int_3': 'Cubbon Park Metro',
    'int_4': 'MG Road Metro Junction',
    'int_5': 'Residency Crossroad',
    'int_6': 'Vittal Mallya Corner',
    'int_7': 'Brigade Corner',
    'int_8': 'Brigade Road Corridor',
    'int_9': 'Church Street West',
    'int_10': 'Museum Square',
    'int_11': 'Church Street East',
    'int_12': 'St. Mark\'s Corner',
    'int_13': 'Mayo Hall Junction',
    'int_14': 'Kasturba Road Junction',
    'int_15': 'Trinity Metro Hub',
    'int_16': 'Residency East Road',
    'int_17': 'Richmond Corner',
    'int_18': 'Commercial Street Cross',
    'int_19': 'MG Road East Junction',
    'int_20': 'St. John\'s Road Link',
    'int_21': 'Ulsoor Lake West',
    'int_22': 'Ulsoor Lake Promenade',
    'int_23': 'Cubbon Road East',
    'int_24': 'Commercial Street Entrance',
    'int_25': 'Richmond Circle Flyover',
    'int_26': 'Trinity Circle Junction',
    'int_27': 'HAL Airport Access Link'
  };

  // Helper to compute k-hop neighbors count for a node
  const getNeighborhoodStats = (nodeId: string) => {
    const visited = new Set<string>();
    visited.add(nodeId);
    
    // 1-hop
    const hop1 = getNodeNeighbors(nodeId, graph);
    hop1.forEach(n => visited.add(n));

    // 2-hop
    const hop2: string[] = [];
    hop1.forEach(n => {
      getNodeNeighbors(n, graph).forEach(nn => {
        if (!visited.has(nn)) {
          visited.add(nn);
          hop2.push(nn);
        }
      });
    });

    return {
      hop1Count: hop1.length,
      hop2Count: hop2.length,
      totalReceptive: visited.size - 1
    };
  };

  return (
    <aside 
      className={`inspector ${collapsed ? 'collapsed' : ''}`}
      aria-label="Selection inspector"
      style={{ position: 'relative' }}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="btn"
        style={{
          position: 'absolute',
          top: '12px',
          left: collapsed ? '-32px' : '8px',
          zIndex: 20,
          padding: '4px',
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
          borderRadius: '4px'
        }}
        aria-label={collapsed ? "Expand inspector panel" : "Collapse inspector panel"}
      >
        {collapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {!collapsed && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* SHOW INFO GLOBAL BUTTON TRIGGER */}
          <Panel title="URBAN INTELLIGENCE ACTION">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                <span>Selected Places: <strong style={{ color: 'var(--color-accent)' }}>{selectedNodeIds.length}</strong></span>
                <span>Selected Roads: <strong style={{ color: 'var(--color-accent)' }}>{selectedEdgeIds.length}</strong></span>
              </div>
              <Button 
                variant={isAnySelected ? 'primary' : 'default'}
                disabled={!isAnySelected}
                onClick={() => setShowInfoOpen(true)}
                icon={<Info size={14} />}
                style={{ width: '100%', padding: '8px', fontSize: '12px', fontWeight: 'bold' }}
              >
                SHOW INFO
              </Button>
            </div>
          </Panel>

          {/* GNN RECEPTIVE FIELD INFLUENCE MAP CONTROLS */}
          <Panel title="GNN RECEPTIVE OVERLAY">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="text-xs text-secondary">Enable Map Overlay:</span>
                <input 
                  type="checkbox" 
                  checked={gnnInfluenceEnabled} 
                  onChange={(e) => setGnnInfluenceEnabled(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </div>
              
              {gnnInfluenceEnabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                  <span className="text-xs text-muted">Receptive Field Hops:</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                    {[1, 2, 3].map(hop => (
                      <button
                        key={hop}
                        className={`btn ${gnnInfluenceHop === hop ? 'active' : ''}`}
                        style={{
                          fontSize: '10px',
                          padding: '4px 0',
                          backgroundColor: gnnInfluenceHop === hop ? 'var(--color-accent-dim)' : 'var(--bg-tertiary)',
                          borderColor: gnnInfluenceHop === hop ? 'var(--color-accent)' : 'var(--border-color)',
                          color: gnnInfluenceHop === hop ? 'var(--color-accent)' : 'var(--text-primary)',
                          cursor: 'pointer'
                        }}
                        onClick={() => setGnnInfluenceHop(hop)}
                      >
                        {hop}-HOP
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Panel>

          {selectedNode && liveNode ? (
            <>
              {/* NODE DETAILS PANEL */}
              <Panel 
                title="NODE GRAPH METRICS"
                headerActions={
                  <Button 
                    onClick={() => removeNode(selectedNode.id)}
                    style={{ padding: '4px', color: 'var(--color-danger)' }}
                    title="Delete Node"
                  >
                    <Trash2 size={12} />
                  </Button>
                }
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '13px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600 }}>{nodeNames[selectedNode.id] || selectedNode.label}</h4>
                    <span className="text-xs text-muted text-mono">Node ID: {liveNode.id}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-secondary text-xs">Degree:</span>
                      <span className="text-mono text-xs font-semibold">{getNodeDegree(liveNode.id, graph)}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span className="text-secondary text-xs">Neighbors:</span>
                      <span className="text-mono text-xs text-muted" style={{ wordBreak: 'break-all' }}>
                        {getNodeNeighbors(liveNode.id, graph).map(n => nodeNames[n] || n).join(', ') || 'None'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span className="text-secondary text-xs">Connected Roads:</span>
                      <span className="text-mono text-xs text-muted" style={{ wordBreak: 'break-all' }}>
                        {cityData.intersections.get(liveNode.id)?.connectedRoads.join(', ') || 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              </Panel>

              {/* ROUTING PATH LAB PANEL */}
              <Panel title="ROUTING LABORATORY">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>Start: <span className="text-mono text-primary">{routeStartId ? (nodeNames[routeStartId] || routeStartId) : 'Unset'}</span></span>
                    <span>End: <span className="text-mono text-primary">{routeEndId ? (nodeNames[routeEndId] || routeEndId) : 'Unset'}</span></span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <Button
                      onClick={() => setRouteStartId(selectedNode.id)}
                      icon={<MapPin size={12} />}
                      style={{ fontSize: '11px', padding: '6px 4px' }}
                    >
                      SET START
                    </Button>
                    <Button
                      onClick={() => setRouteEndId(selectedNode.id)}
                      icon={<Navigation size={12} />}
                      style={{ fontSize: '11px', padding: '6px 4px' }}
                    >
                      SET END
                    </Button>
                  </div>

                  {(routeStartId || routeEndId) && (
                    <Button
                      onClick={() => {
                        setRouteStartId(null);
                        setRouteEndId(null);
                      }}
                      style={{ width: '100%', fontSize: '11px', padding: '4px' }}
                    >
                      RESET ROUTE
                    </Button>
                  )}
                </div>
              </Panel>

              {/* LIVE SIMULATION STATUS PANEL */}
              <Panel title="LIVE TRAFFIC STATUS">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-xs text-secondary">Traffic Density:</span>
                    <span className="text-mono text-xs font-semibold">{(liveNode.features.trafficDensity * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-xs text-secondary">Vehicle Count:</span>
                    <span className="text-mono text-xs font-semibold">{liveNode.features.vehicleCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-xs text-secondary">Average Speed:</span>
                    <span className="text-mono text-xs font-semibold">{liveNode.features.averageSpeed} km/h</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-xs text-secondary">Queue Length:</span>
                    <span className="text-mono text-xs font-semibold">{liveNode.features.queueLength}</span>
                  </div>
                </div>
              </Panel>

              {/* EDIT NODE PROPERTIES PANEL */}
              <Panel title="NODE PROFILE DESIGNER">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label className="text-xs text-secondary" htmlFor="node-type">Zone Type</label>
                    <select
                      id="node-type"
                      value={selectedNode.type}
                      onChange={(e) => updateNodeFeatures(selectedNode.id, { type: e.target.value as any })}
                      style={{
                        padding: '6px',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      <option value="residential">Residential Suburb</option>
                      <option value="commercial">Commercial Hub</option>
                      <option value="industrial">Industrial Sector</option>
                      <option value="park">Green Space/Park</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label className="text-xs text-secondary" htmlFor="node-pop">Population Density</label>
                      <span className="text-mono text-xs">{selectedNode.population}%</span>
                    </div>
                    <input
                      id="node-pop"
                      type="range"
                      min="0"
                      max="100"
                      value={selectedNode.population}
                      onChange={(e) => updateNodeFeatures(selectedNode.id, { population: parseInt(e.target.value) })}
                      style={{ accentColor: 'var(--color-accent)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label className="text-xs text-secondary" htmlFor="node-comm">Commercial Density</label>
                      <span className="text-mono text-xs">{selectedNode.commercialDensity}%</span>
                    </div>
                    <input
                      id="node-comm"
                      type="range"
                      min="0"
                      max="100"
                      value={selectedNode.commercialDensity}
                      onChange={(e) => updateNodeFeatures(selectedNode.id, { commercialDensity: parseInt(e.target.value) })}
                      style={{ accentColor: 'var(--color-accent)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label className="text-xs text-secondary" htmlFor="node-green">Green Space Ratio</label>
                      <span className="text-mono text-xs">{selectedNode.greenSpace}%</span>
                    </div>
                    <input
                      id="node-green"
                      type="range"
                      min="0"
                      max="100"
                      value={selectedNode.greenSpace}
                      onChange={(e) => updateNodeFeatures(selectedNode.id, { greenSpace: parseInt(e.target.value) })}
                      style={{ accentColor: 'var(--color-accent)' }}
                    />
                  </div>
                </div>
              </Panel>

              {/* GNN IMPACT PREDICTIONS PANEL */}
              <Panel title="GNN IMPACT PREDICTIONS">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-xs text-secondary">Traffic Congestion</span>
                      <span className="text-mono text-xs text-secondary">Base: {basePred?.trafficCongestion}% → Prop: {propPred?.trafficCongestion}%</span>
                    </div>
                    <MetricCard label="" value={`${propPred?.trafficCongestion}%`} statusColor={propPred && basePred && propPred.trafficCongestion > basePred.trafficCongestion ? 'warning' : 'success'} />
                  </div>

                  <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-xs text-secondary">Commercial Activity</span>
                      <span className="text-mono text-xs text-secondary">Base: {basePred?.commercialActivity}% → Prop: {propPred?.commercialActivity}%</span>
                    </div>
                    <MetricCard label="" value={`${propPred?.commercialActivity}%`} statusColor="accent" />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-xs text-secondary">Environmental Stress</span>
                      <span className="text-mono text-xs text-secondary">Base: {basePred?.environmentalStress}% → Prop: {propPred?.environmentalStress}%</span>
                    </div>
                    <MetricCard label="" value={`${propPred?.environmentalStress}%`} statusColor={propPred && basePred && propPred.environmentalStress > basePred.environmentalStress ? 'danger' : 'success'} />
                  </div>
                </div>
              </Panel>

              <Panel title="GRAPH CENTRALITY">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <MetricCard 
                    label="Closeness" 
                    value={propCloseness ? propCloseness.toFixed(3) : '0.000'} 
                    subtext={`Base: ${baseCloseness ? baseCloseness.toFixed(3) : '0.000'}`}
                  />
                  <MetricCard 
                    label="Degree" 
                    value={propDegree ? propDegree.toFixed(3) : '0.000'} 
                    subtext={`Base: ${baseDegree ? baseDegree.toFixed(3) : '0.000'}`}
                  />
                </div>
              </Panel>
            </>
          ) : selectedEdge && liveEdge ? (
            <Panel 
              title="PATH INSPECTOR"
              headerActions={
                <Button 
                  onClick={() => removeEdge(selectedEdge.id)}
                  style={{ padding: '4px', color: 'var(--color-danger)' }}
                  title="Delete Path"
                >
                  <Trash2 size={12} />
                </Button>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600 }}>Connection Profile</h4>
                  <span className="text-xs text-muted text-mono">Road ID: {liveEdge.id}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Source Node:</span>
                    <span className="text-mono">{nodeNames[liveEdge.source] || liveEdge.source}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Target Node:</span>
                    <span className="text-mono">{nodeNames[liveEdge.target] || liveEdge.target}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Road Type:</span>
                    <span className="text-mono" style={{ textTransform: 'uppercase' }}>{liveEdge.features.roadType}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Length:</span>
                    <span className="text-mono">{liveEdge.features.length}m</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Capacity:</span>
                    <span className="text-mono">{liveEdge.features.capacity} veh/h</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Flow Rate:</span>
                    <span className="text-mono">{liveEdge.features.flow} veh/h</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Flow Density:</span>
                    <span className="text-mono">{(liveEdge.features.density * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-secondary">Travel Time:</span>
                    <span className="text-mono">{liveEdge.features.travelTime} seconds</span>
                  </div>
                </div>
              </div>
            </Panel>
          ) : (
            <div style={{ padding: '40px 16px', textAlign: 'center' }}>
              <span className="text-xs text-muted">SELECT AN ELEMENT TO INSPECT DETAILS</span>
            </div>
          )}
        </div>
      )}

      {/* DETAILED SHOW INFO MODAL OVERLAY */}
      {showInfoOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(5, 7, 10, 0.9)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '24px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Eye size={18} style={{ color: 'var(--color-accent)' }} />
                <h2 style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>
                  Model-Based Urban Graph Analysis & Receptive Field Details
                </h2>
              </div>
              <button 
                onClick={() => setShowInfoOpen(false)}
                className="btn"
                style={{ fontSize: '11px', padding: '4px 8px', cursor: 'pointer' }}
              >
                CLOSE
              </button>
            </div>

            {/* Modal Scroll Body */}
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* SECTION 1: SELECTION SUMMARY */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', margin: 0 }}>
                  I. Urban Element Identification
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Selected Nodes List */}
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '4px' }}>
                    <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                      Selected Places ({selectedNodeIds.length})
                    </h4>
                    {selectedNodeIds.length === 0 ? (
                      <span className="text-xs text-muted">No places selected. Click nodes on the map.</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {selectedNodeIds.map(nId => (
                          <span key={nId} className="text-mono" style={{ fontSize: '10px', backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '3px', border: '1px solid var(--border-color)' }}>
                            {nodeNames[nId] || nId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Edges List */}
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '4px' }}>
                    <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                      Selected Roads ({selectedEdgeIds.length})
                    </h4>
                    {selectedEdgeIds.length === 0 ? (
                      <span className="text-xs text-muted">No roads selected. Click road links on the map.</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {selectedEdgeIds.map(eId => (
                          <span key={eId} className="text-mono" style={{ fontSize: '10px', backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '3px', border: '1px solid var(--border-color)' }}>
                            {eId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: RELATIONSHIP & SHORTEST PATH ANALYSIS */}
              {selectedNodeIds.length >= 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, backgroundColor: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.15)', padding: '14px', borderRadius: '4px' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', margin: 0 }}>
                    II. Shortest Path & Accessibility Relationship
                  </h3>
                  {(() => {
                    const startNode = selectedNodeIds[0];
                    const endNode = selectedNodeIds[selectedNodeIds.length - 1];
                    const pathResult = calculateShortestPath(startNode, endNode, graph);

                    if (!pathResult) {
                      return <span className="text-xs text-muted">No path could be computed between {nodeNames[startNode] || startNode} and {nodeNames[endNode] || endNode} on the current graph topology.</span>;
                    }

                    const pathNames = pathResult.path.map(n => nodeNames[n] || n.replace('int_', 'N'));
                    return (
                      <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                          <span className="text-secondary font-semibold">Shortest Route Corridor:</span>
                          {pathNames.map((name, idx) => (
                            <React.Fragment key={idx}>
                              <span className="text-mono" style={{ color: 'var(--color-accent)' }}>{name}</span>
                              {idx < pathNames.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
                            </React.Fragment>
                          ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginTop: '4px' }}>
                          <MetricCard label="Total Route Distance" value={`${(pathResult.distance / 1000).toFixed(2)} km`} />
                          <MetricCard label="Estimated Travel Time" value={`${(pathResult.distance / 12).toFixed(1)} mins`} />
                          <MetricCard label="Intersections Traversed" value={pathResult.path.length} />
                          <MetricCard label="Bottleneck Congestion" value="Moderate" statusColor="warning" />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* SECTION 3: GNN RECEPTIVE FIELD & DYNAMICS WHITEBOARD */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', margin: 0 }}>
                  III. GNN Message Passing & Receptive Fields
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
                  {/* Equations & Whiteboard Math */}
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>
                      Spatial Message Aggregation
                    </h4>
                    <span className="text-xs text-muted">
                      Instead of treating nodes in isolation, GNNs recursively collect features from localized neighborhood boundaries.
                    </span>
                    <div style={{
                      backgroundColor: 'var(--bg-primary)',
                      padding: '12px 6px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      textAlign: 'center',
                      fontFamily: 'Courier, monospace',
                      fontSize: '11px',
                      color: 'var(--color-accent)',
                      margin: '6px 0'
                    }}>
                      h_i^(l+1) = UPDATE( h_i^(l), AGGREGATE( h_j^(l), j ∈ N(i) ) )
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div>• <strong style={{ color: 'var(--text-primary)' }}>h_i</strong>: Node representation vector embedding</div>
                      <div>• <strong style={{ color: 'var(--text-primary)' }}>N(i)</strong>: Local graph neighbor set</div>
                      <div>• <strong style={{ color: 'var(--text-primary)' }}>AGGREGATE</strong>: Combines neighborhoods via weighted sum</div>
                      <div>• <strong style={{ color: 'var(--text-primary)' }}>UPDATE</strong>: Generates new embedding mapping layers</div>
                    </div>
                  </div>

                  {/* Receptive Field Stats */}
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '14px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <h4 style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', margin: 0 }}>
                      Receptive Field Reaching
                    </h4>
                    {selectedNodeId ? (
                      (() => {
                        const stats = getNeighborhoodStats(selectedNodeId);
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '11.5px' }}>
                            <div>Target Node: <strong className="text-mono" style={{ color: 'var(--color-accent)' }}>{nodeNames[selectedNodeId] || selectedNodeId}</strong></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="text-secondary">1-Hop (Direct Neighbors):</span>
                                <span className="text-mono font-semibold" style={{ color: '#06b6d4' }}>{stats.hop1Count} nodes</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="text-secondary">2-Hop (Neighbors of Neighbors):</span>
                                <span className="text-mono font-semibold" style={{ color: '#f59e0b' }}>{stats.hop2Count} nodes</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className="text-secondary">Total Subgraph Influence:</span>
                                <span className="text-mono font-semibold" style={{ color: '#ef4444' }}>{stats.totalReceptive} nodes</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <span className="text-xs text-muted">Select a place node to inspect receptive field counts.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: GNN FEATURE VECTOR SCHEMA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', margin: 0 }}>
                  IV. GNN Feature Matrix Representation
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '11.5px' }}>
                  {/* Node Features Schema */}
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                      Node Input Feature Vector (X_node)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'monospace', fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                      <div>[0] Traffic Activity Rate (Density: 0.0 - 1.0)</div>
                      <div>[1] Population Profile (Density: 0% - 100%)</div>
                      <div>[2] Land-Use Class (Residential/Commercial/Ind/Park)</div>
                      <div>[3] Local Accessibility (Degree Count)</div>
                      <div>[4] Capacity Buffer (Signal timing threshold)</div>
                      <div>[5] Simulation Time (Seconds of Day)</div>
                    </div>
                  </div>

                  {/* Edge Features Schema */}
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                      Edge Input Feature Vector (X_edge)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'monospace', fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                      <div>[0] Geographic Distance (m)</div>
                      <div>[1] Road Lane Capacity (veh/hr)</div>
                      <div>[2] Current Traffic Volume (veh/hr)</div>
                      <div>[3] Average Speed limit (km/h)</div>
                      <div>[4] Estimated Link Travel Time (s)</div>
                      <div>[5] Functional Classification (Highway/Arterial/Local)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: "WHAT THE GNN SEES" NEIGHBOR ATTRIBUTE MATRIX */}
              {selectedNodeId && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', margin: 0 }}>
                    V. Local Neighborhood Attribute Matrix
                  </h3>
                  <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '8px' }}>Neighbor Node</th>
                          <th style={{ padding: '8px' }}>Type</th>
                          <th style={{ padding: '8px' }}>Traffic Activity</th>
                          <th style={{ padding: '8px' }}>Population Profile</th>
                          <th style={{ padding: '8px' }}>Distance Offset</th>
                          <th style={{ padding: '8px' }}>Attention Weight (α_ij)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getNodeNeighbors(selectedNodeId, graph).map(nId => {
                          const nNode = proposedGraph.nodes.get(nId);
                          const nLive = graph.nodes.get(nId);
                          if (!nNode || !nLive) return null;

                          // Distance
                          const dx = (liveNode?.x || 0) - nLive.x;
                          const dy = (liveNode?.y || 0) - nLive.y;
                          const distance = Math.sqrt(dx*dx + dy*dy);
                          
                          // Attention coefficient computation
                          const attention = (1 / (1 + distance / 200)).toFixed(2);

                          return (
                            <tr key={nId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '8px', fontWeight: 'bold' }}>{nodeNames[nId] || nId}</td>
                              <td style={{ padding: '8px', textTransform: 'capitalize' }}>{nNode.type}</td>
                              <td style={{ padding: '8px' }}>{(nLive.features.trafficDensity * 100).toFixed(0)}%</td>
                              <td style={{ padding: '8px' }}>{nNode.population}%</td>
                              <td style={{ padding: '8px' }}>{distance.toFixed(0)}m</td>
                              <td style={{ padding: '8px', color: 'var(--color-accent)', fontFamily: 'monospace' }}>{attention}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION 6: WHAT CAN THE GNN PREDICT (SIMULATED GNN OUTPUTS) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', margin: 0 }}>
                  VI. Simulated GNN Re-routing & Vulnerability Outputs
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  {/* Gauge 1 */}
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span className="text-secondary text-xs">Simulated Re-routing Propensity</span>
                    <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                      <div style={{ height: '100%', width: '78%', backgroundColor: 'var(--color-accent)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
                      <span className="text-muted">Low</span>
                      <span className="text-mono font-semibold" style={{ color: 'var(--color-accent)' }}>78%</span>
                    </div>
                  </div>

                  {/* Gauge 2 */}
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span className="text-secondary text-xs">Dynamic Bottleneck Risk Index</span>
                    <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                      <div style={{ height: '100%', width: '42%', backgroundColor: '#ef4444' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
                      <span className="text-muted">Low</span>
                      <span className="text-mono font-semibold" style={{ color: '#ef4444' }}>42%</span>
                    </div>
                  </div>

                  {/* Gauge 3 */}
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span className="text-secondary text-xs">Simulated Accessibility Gain</span>
                    <div style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                      <div style={{ height: '100%', width: '65%', backgroundColor: '#10b981' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
                      <span className="text-muted">Low</span>
                      <span className="text-mono font-semibold" style={{ color: '#10b981' }}>65%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 7: WHY THIS MATTERS FOR URBAN PLANNING & DISCLAIMERS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <div style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  color: '#f59e0b',
                  padding: '12px 14px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  lineHeight: '1.5'
                }}>
                  <strong style={{ textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Scientific Research Disclaimer:</strong>
                  This counterfactual scenario represents simulated consequences under the mathematical assumptions of the model. 
                  It serves as an interactive demonstration of GNN neighborhood aggregation dynamics. It does not by itself establish causal effects in the real-world.
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  <strong>Why this matters:</strong> Because urban places are interconnected, changing one location or infrastructure element can affect surrounding locations. 
                  A GNN can model these network relationships and provide a basis for evaluating system-level consequences.
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(255, 255, 255, 0.01)'
            }}>
              <button 
                onClick={() => setShowInfoOpen(false)}
                className="btn btn-primary"
                style={{ fontSize: '11px', padding: '6px 12px', cursor: 'pointer' }}
              >
                DISMISS
              </button>
            </div>

          </div>
        </div>
      )}

    </aside>
  );
};
export default Inspector;
