import React from 'react';
import './TopBar.css';

interface TopBarProps {
  status: string;
  activeTab: 'playground' | 'scanner';
  setActiveTab: (tab: 'playground' | 'scanner') => void;
}

const TopBar: React.FC<TopBarProps> = ({ status, activeTab, setActiveTab }) => {
  const isDanger = status === 'UNDER_ATTACK';
  const isSuspicious = status === 'SUSPICIOUS';
  
  return (
    <header className="module-border topbar-header" style={{ 
      borderBottom: `1px solid var(--border-color)`,
      background: 'var(--surface)',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    }}>
      {/* Brand Logo */}
      <div className="topbar-brand-container">
        <div 
          className="topbar-brand"
          style={{ 
            color: 'var(--primary)',
            fontWeight: '800',
            fontSize: '22px'
          }}
          onClick={() => setActiveTab('playground')}
        >
          PromptLy
        </div>
        <div className="topbar-divider" />
        <div className="topbar-meta">
          PROMPT_INJECTION_DEFENSE
        </div>
      </div>

      {/* Simplified Tabs (Only Playground and Scanner) */}
      <nav className="topbar-tabs">
        <button 
          className={`topbar-tab-btn ${activeTab === 'playground' ? 'active' : ''}`}
          onClick={() => setActiveTab('playground')}
        >
          TEXT_CHECKER
        </button>
        <button 
          className={`topbar-tab-btn ${activeTab === 'scanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('scanner')}
        >
          FILE_SCANNER
        </button>
      </nav>

      {/* Stats Indicators */}
      <div className="topbar-status-container">
        <div className="topbar-status-indicator">
          <span className="indicator-label">GATEWAY_STATUS</span>
          <span className={`status-chip ${isDanger ? 'status-danger' : isSuspicious ? 'status-warning' : 'status-safe'}`}>
            {status}
          </span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
