import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import type { NavTab } from './components/TopBar';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { Inspector } from './components/Inspector';
import { Panel, Modal, Button } from './components/UIComponents';
import { CityCanvas } from './components/CityCanvas';
import { GnnLab } from './components/GnnLab';
import { InterventionLab } from './components/InterventionLab';
import { ScenarioLab } from './components/ScenarioLab';
import { Analytics } from './components/Analytics';
import { ResearchAssistant } from './components/ResearchAssistant';
import { ResearchLayer } from './components/ResearchLayer';
import './App.css';

const AppContent: React.FC = () => {
  const { viewMode, setViewMode } = useApp();
  const [activeTab, setActiveTab] = useState<NavTab>('RESEARCH');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState<boolean>(false);
  const [helpOpen, setHelpOpen] = useState<boolean>(false);

  // Helper to render mode switch buttons
  const renderModeSwitches = () => {
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={() => setViewMode('CITY')}
          className="btn"
          style={{
            padding: '2px 8px',
            fontSize: '9px',
            fontWeight: 600,
            backgroundColor: viewMode === 'CITY' ? 'var(--color-accent-dim)' : '',
            borderColor: viewMode === 'CITY' ? 'var(--color-accent)' : '',
            color: viewMode === 'CITY' ? 'var(--color-accent)' : ''
          }}
        >
          SHOW PHYSICAL CITY
        </button>
        <button
          onClick={() => setViewMode('GRAPH')}
          className="btn"
          style={{
            padding: '2px 8px',
            fontSize: '9px',
            fontWeight: 600,
            backgroundColor: viewMode === 'GRAPH' ? 'var(--color-accent-dim)' : '',
            borderColor: viewMode === 'GRAPH' ? 'var(--color-accent)' : '',
            color: viewMode === 'GRAPH' ? 'var(--color-accent)' : ''
          }}
        >
          SHOW GRAPH
        </button>
        <button
          onClick={() => setViewMode('HYBRID')}
          className="btn"
          style={{
            padding: '2px 8px',
            fontSize: '9px',
            fontWeight: 600,
            backgroundColor: viewMode === 'HYBRID' ? 'var(--color-accent-dim)' : '',
            borderColor: viewMode === 'HYBRID' ? 'var(--color-accent)' : '',
            color: viewMode === 'HYBRID' ? 'var(--color-accent)' : ''
          }}
        >
          SHOW BOTH
        </button>
      </div>
    );
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'RESEARCH':
        return (
          <Panel 
            title="Urban Intelligence Research Overview"
            headerActions={<span className="text-xs text-muted">RESEARCH FRAMEWORK</span>}
          >
            <div style={{ width: '100%', height: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <ResearchLayer />
            </div>
          </Panel>
        );
      case 'SIMULATION':
        return (
          <Panel 
            title="City Simulation Laboratory"
            headerActions={renderModeSwitches()}
          >
            <div style={{ width: '100%', height: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <CityCanvas />
            </div>
          </Panel>
        );
      case 'GRAPH':
        return (
          <Panel 
            title="Mathematical Graph Projection"
            headerActions={renderModeSwitches()}
          >
            <div style={{ width: '100%', height: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <CityCanvas />
            </div>
          </Panel>
        );
      case 'GNN LAB':
        return (
          <Panel 
            title="Graph Neural Network Demonstration Lab"
            headerActions={<span className="text-xs text-muted">CONCEPTUAL GNN</span>}
          >
            <div style={{ width: '100%', height: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <GnnLab />
            </div>
          </Panel>
        );
      case 'INTERVENTIONS':
        return (
          <Panel 
            title="Urban Intervention Designer"
            headerActions={<span className="text-xs text-muted">URBAN INTERVENTION</span>}
          >
            <div style={{ width: '100%', height: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <InterventionLab />
            </div>
          </Panel>
        );
      case 'SCENARIOS':
        return (
          <Panel 
            title="Scenario Planning Sandbox"
            headerActions={<span className="text-xs text-muted">MODEL-BASED SCENARIOS</span>}
          >
            <div style={{ width: '100%', height: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <ScenarioLab />
            </div>
          </Panel>
        );
      case 'ANALYTICS':
        return (
          <Panel 
            title="Analytics Engine & Decision Support"
            headerActions={<span className="text-xs text-muted">MULTI-OBJECTIVE COMPARISON</span>}
          >
            <div style={{ width: '100%', height: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <Analytics />
            </div>
          </Panel>
        );
      case 'RESEARCH ASSISTANT':
        return (
          <Panel 
            title="GNN Research Mentor & Chatbot"
            headerActions={<span className="text-xs text-muted">RESEARCH ASSISTANT</span>}
          >
            <div style={{ width: '100%', height: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <ResearchAssistant />
            </div>
          </Panel>
        );
      default:
        return <div>Select a workspace tab</div>;
    }
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <TopBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenHelp={() => setHelpOpen(true)} 
      />

      <div className="main-workspace">
        {/* Left Sidebar */}
        <Sidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
        />

        {/* Center Content Area */}
        <main className="center-content">
          <div className="text-xs text-muted" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>ACTIVE WORKSPACE: {activeTab}</span>
            <span className="text-mono">COORDS: DEFAULT CITY GRID</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {renderContent()}
          </div>
        </main>

        {/* Right Inspector / Context Panel */}
        <Inspector 
          collapsed={inspectorCollapsed} 
          setCollapsed={setInspectorCollapsed} 
        />
      </div>

      {/* Info Handbook Modal */}
      <Modal 
        isOpen={helpOpen} 
        onClose={() => setHelpOpen(false)} 
        title="Urban Intelligence Lab Handbook"
        footer={<Button onClick={() => setHelpOpen(false)} variant="primary">Acknowledge</Button>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '13px', lineHeight: 1.5 }}>
          <p>
            Welcome to the <strong>Urban Intelligence Lab</strong> research dashboard. This simulation explores the sensitivity of urban structures to graph transformations.
          </p>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Keyboard Accessibility</h4>
            <ul style={{ listStyleType: 'disc', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <li>Use <kbd style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-tertiary)', padding: '2px 4px', border: '1px solid var(--border-color)', borderRadius: '3px' }}>Tab</kbd> and <kbd style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-tertiary)', padding: '2px 4px', border: '1px solid var(--border-color)', borderRadius: '3px' }}>Shift + Tab</kbd> to navigate buttons, fields, and tabs.</li>
              <li>Press <kbd style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-tertiary)', padding: '2px 4px', border: '1px solid var(--border-color)', borderRadius: '3px' }}>Enter</kbd> or <kbd style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-tertiary)', padding: '2px 4px', border: '1px solid var(--border-color)', borderRadius: '3px' }}>Space</kbd> to activate tabs, sliders, and buttons.</li>
              <li>Toggle collapsing side panels using their respective chevron buttons to adjust center workspace footprint.</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
