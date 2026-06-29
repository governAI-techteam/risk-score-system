import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LogsPanel.css';

function LogsPanel({ history, showLogs, setShowLogs }) {
  const getActionColor = (action) => {
    const colors = {
      'ALLOW': 'safe',
      'SANITIZE': 'warning',
      'BLOCK': 'danger'
    };
    return colors[action] || 'neutral';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const truncate = (text, maxLength = 40) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="logs-panel glass-card">
      <div 
        className="panel-header"
        onClick={() => setShowLogs(!showLogs)}
      >
        <div className="header-left">
          <span>📜</span>
          <span>Session Logs</span>
          <span className="log-count">({history.length})</span>
        </div>
        <motion.span 
          className="toggle-icon"
          animate={{ rotate: showLogs ? 180 : 0 }}
        >
          ▼
        </motion.span>
      </div>

      <AnimatePresence>
        {showLogs && (
          <motion.div 
            className="logs-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="logs-list">
              {history.slice().reverse().map((log, index) => (
                <motion.div 
                  key={log.id}
                  className="log-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="log-header">
                    <span className="log-time">{formatTime(log.timestamp)}</span>
                    <span className={`log-action log-action-${getActionColor(log.riskScore.action)}`}>
                      {log.riskScore.action}
                    </span>
                    <span className="log-score">{log.riskScore.score}/10</span>
                  </div>
                  <div className="log-preview">
                    {truncate(log.input.original)}
                  </div>
                  <div className="log-type">
                    {log.analysis.type}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LogsPanel;