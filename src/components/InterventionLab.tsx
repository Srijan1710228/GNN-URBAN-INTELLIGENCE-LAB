import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Panel, Button, StatusIndicator } from './UIComponents';
import { Save, Plus, ArrowRight, ShieldCheck, MapPin, Gauge } from 'lucide-react';
import { CityCanvas } from './CityCanvas';

export const InterventionLab: React.FC = () => {
  const {
    cityData,
    selectedNodeId,
    selectedEdgeId,
    addRoadIntervention,
    changeRoadCapacityIntervention,
    changeRoadSpeedIntervention,
    addTransitStationIntervention,
    baselineCityData,
    saveBaselineState,
    interventions
  } = useApp();

  // Add Road Form State
  const [roadStart, setRoadStart] = useState<string>('');
  const [roadEnd, setRoadEnd] = useState<string>('');
  const [roadType, setRoadType] = useState<'LOCAL' | 'ARTERIAL' | 'HIGHWAY'>('ARTERIAL');

  const selectedRoad = selectedEdgeId ? cityData.roads.get(selectedEdgeId) : null;
  const selectedNode = selectedNodeId ? cityData.intersections.get(selectedNodeId) : null;

  const handleAddRoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadStart || !roadEnd || roadStart === roadEnd) return;
    addRoadIntervention(roadStart, roadEnd, roadType);
    // Reset selectors
    setRoadStart('');
    setRoadEnd('');
  };

  const handleUpgradeTransit = () => {
    if (!selectedNodeId) return;
    addTransitStationIntervention(selectedNodeId);
  };

  // List of intersection IDs for select options
  const intersectionIds = Array.from(cityData.intersections.keys()).sort();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, height: '100%' }}>
      
      {/* LEFT SIDE: Interactive simulation map canvas with overlay instructions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Panel 
          title="Interactive Intervention Map"
          headerActions={
            <span className="text-xs text-muted">
              Select elements on the map to modify capacity/speed limit or add transit
            </span>
          }
        >
          <div style={{ flex: 1, position: 'relative', minHeight: '460px', height: '100%' }}>
            <CityCanvas />
          </div>
        </Panel>
      </div>

      {/* RIGHT SIDE: Control panel inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* BASELINE SNAPSHOT PANEL */}
        <Panel title="BASELINE PROFILE">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StatusIndicator status={baselineCityData ? 'success' : 'idle'} label={baselineCityData ? 'SECURED' : 'UNSAVED'} />
                <span className="text-xs font-semibold">
                  {baselineCityData ? 'BASELINE PROFILE SECURED' : 'NO BASELINE CAPTURED'}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-secondary">
              Baseline profiles save the pre-intervention structure to compare simulation changes.
            </p>

            <Button
              onClick={saveBaselineState}
              icon={baselineCityData ? <ShieldCheck size={12} /> : <Save size={12} />}
              variant={baselineCityData ? 'default' : 'primary'}
              style={{ width: '100%', fontSize: '11px', padding: '6px' }}
            >
              {baselineCityData ? 'RE-SAVE CURRENT AS BASELINE' : 'SAVE BASELINE SNAPSHOT'}
            </Button>
          </div>
        </Panel>

        {/* ROAD NETWORK BUILDER (ADD ROAD) */}
        <Panel title="ROAD CONNECTION BUILDER">
          <form onSubmit={handleAddRoad} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 12px 1fr', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label className="text-xs text-secondary" htmlFor="road-start-select">From Node</label>
                <select
                  id="road-start-select"
                  value={roadStart}
                  onChange={(e) => setRoadStart(e.target.value)}
                  style={{
                    padding: '6px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}
                >
                  <option value="">-- Select --</option>
                  {intersectionIds.map(id => (
                    <option key={id} value={id}>{id.replace('int_', 'Node ')}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <ArrowRight size={12} className="text-muted" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label className="text-xs text-secondary" htmlFor="road-end-select">To Node</label>
                <select
                  id="road-end-select"
                  value={roadEnd}
                  onChange={(e) => setRoadEnd(e.target.value)}
                  style={{
                    padding: '6px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}
                >
                  <option value="">-- Select --</option>
                  {intersectionIds.map(id => (
                    <option key={id} value={id}>{id.replace('int_', 'Node ')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="text-xs text-secondary" htmlFor="road-type-select">Road Layout Profile</label>
              <select
                id="road-type-select"
                value={roadType}
                onChange={(e) => setRoadType(e.target.value as any)}
                style={{
                  padding: '6px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}
              >
                <option value="LOCAL">LOCAL ROAD (1 Lane, 30 km/h)</option>
                <option value="ARTERIAL">ARTERIAL ROAD (2 Lanes, 50 km/h)</option>
                <option value="HIGHWAY">EXPRESS HIGHWAY (4 Lanes, 80 km/h)</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={!roadStart || !roadEnd || roadStart === roadEnd}
              icon={<Plus size={12} />}
              style={{ width: '100%', fontSize: '11px', padding: '6px', marginTop: '4px' }}
            >
              BUILD NEW ROAD PATH
            </Button>
          </form>
        </Panel>

        {/* METRO TRANSIT STATION UPGRADE */}
        <Panel title="TRANSIT HUB DESIGNER">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {selectedNode ? (
              <>
                <div>
                  <span className="text-xs text-muted">SELECTED LOCATION</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '4px' }}>
                    <MapPin size={12} style={{ color: 'var(--color-accent)' }} />
                    <span className="text-mono text-xs font-semibold">{selectedNodeId}</span>
                  </div>
                </div>

                <Button
                  onClick={handleUpgradeTransit}
                  icon={<Plus size={12} />}
                  style={{ width: '100%', fontSize: '11px', padding: '6px' }}
                >
                  UPGRADE TO METRO STATION
                </Button>
              </>
            ) : (
              <span className="text-xs text-muted" style={{ textAlign: 'center', padding: '10px 0' }}>
                SELECT A NODE ON MAP TO UPGRADE TO METRO TRANSIT STATION
              </span>
            )}
          </div>
        </Panel>

        {/* ROAD ATTRIBUTE TUNER (CAPACITY & SPEED LIMIT) */}
        <Panel title="ROAD ATTRIBUTE TUNER">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {selectedRoad ? (
              <>
                <div>
                  <span className="text-xs text-muted">TUNING PATH</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '4px' }}>
                    <Gauge size={12} style={{ color: 'var(--color-warning)' }} />
                    <span className="text-mono text-xs font-semibold">{selectedRoad.id}</span>
                  </div>
                </div>

                {/* CAPACITY SLIDER */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="text-xs text-secondary" htmlFor="capacity-slider">Flow Capacity</label>
                    <span className="text-mono text-xs">{selectedRoad.capacity} veh/h</span>
                  </div>
                  <input
                    id="capacity-slider"
                    type="range"
                    min="500"
                    max="6000"
                    step="100"
                    value={selectedRoad.capacity}
                    onChange={(e) => changeRoadCapacityIntervention(selectedRoad.id, parseInt(e.target.value))}
                    style={{ accentColor: 'var(--color-warning)' }}
                  />
                </div>

                {/* SPEED LIMIT SLIDER */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="text-xs text-secondary" htmlFor="speed-slider">Speed Limit</label>
                    <span className="text-mono text-xs">{selectedRoad.speedLimit} km/h</span>
                  </div>
                  <input
                    id="speed-slider"
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={selectedRoad.speedLimit}
                    onChange={(e) => changeRoadSpeedIntervention(selectedRoad.id, parseInt(e.target.value))}
                    style={{ accentColor: 'var(--color-warning)' }}
                  />
                </div>
              </>
            ) : (
              <span className="text-xs text-muted" style={{ textAlign: 'center', padding: '10px 0' }}>
                SELECT A ROAD ON THE MAP TO TUNE CAPACITY & SPEED LIMITS
              </span>
            )}
          </div>
        </Panel>

        {/* LOGS PANEL */}
        <Panel title="INTERVENTION LOGS">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '110px', overflowY: 'auto' }}>
            {interventions.length === 0 ? (
              <span className="text-xs text-muted" style={{ textAlign: 'center', padding: '10px 0' }}>
                NO INTERVENTIONS RECORDED
              </span>
            ) : (
              interventions.map(log => (
                <div 
                  key={log.id} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    padding: '6px', 
                    backgroundColor: 'rgba(255,255,255,0.01)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '4px',
                    fontSize: '10px' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span className="text-mono">{log.type}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <span className="text-secondary" style={{ marginTop: '2px' }}>{log.description}</span>
                </div>
              ))
            )}
          </div>
        </Panel>

      </div>
    </div>
  );
};
export default InterventionLab;
