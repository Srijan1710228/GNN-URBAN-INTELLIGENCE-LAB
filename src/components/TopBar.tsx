import React from 'react';
import { StatusIndicator } from './UIComponents';
import { HelpCircle } from 'lucide-react';

export type NavTab = 
  | 'RESEARCH'
  | 'SIMULATION'
  | 'GRAPH'
  | 'GNN LAB'
  | 'INTERVENTIONS'
  | 'SCENARIOS'
  | 'ANALYTICS'
  | 'RESEARCH ASSISTANT';

interface TopBarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenHelp: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ activeTab, setActiveTab, onOpenHelp }) => {
  const tabs: NavTab[] = [
    'RESEARCH',
    'SIMULATION',
    'GRAPH',
    'GNN LAB',
    'INTERVENTIONS',
    'SCENARIOS',
    'ANALYTICS',
    'RESEARCH ASSISTANT'
  ];

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <h1 className="topbar-title">URBAN INTELLIGENCE LAB</h1>
        <span className="topbar-subtitle">From Graphs to GNNs to Urban Planning Intelligence</span>
      </div>

      <nav className="nav-tabs" role="tablist" aria-label="Application sections">
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`nav-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="topbar-actions">
        <StatusIndicator label="ENGINE: LIVE" status="active" />
        <button
          onClick={onOpenHelp}
          className="btn"
          style={{ padding: '6px', borderRadius: '50%' }}
          aria-label="Open information handbook"
        >
          <HelpCircle size={16} />
        </button>
      </div>
    </header>
  );
};
export default TopBar;
