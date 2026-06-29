import React from 'react';
import { motion } from 'framer-motion';
import './ResponsePanel.css';

function ResponsePanel({ response }) {
  if (!response || !response.response) return null;

  return (
    <div className="response-panel glass-card">
      <div className="component-header">
        <span>🤖</span>
        <span>AI Response</span>
      </div>

      <div className="response-meta">
        <span className="meta-item">
          <span className="meta-label">Model:</span>
          <span className="meta-value">{response.model || 'Simulated AI'}</span>
        </span>
        <span className="meta-item">
          <span className="meta-label">Source:</span>
          <span className="meta-value">{response.source || 'simulated'}</span>
        </span>
        {response.tokens && (
          <span className="meta-item">
            <span className="meta-label">Tokens:</span>
            <span className="meta-value">{Math.round(response.tokens)}</span>
          </span>
        )}
      </div>

      <motion.div 
        className="response-content"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="response-text">
          {response.response.split('\n').map((line, index) => (
            <p key={index} className={line.trim() ? '' : 'empty-line'}>
              {line || '\u00A0'}
            </p>
          ))}
        </div>
      </motion.div>

      <div className="response-footer">
        <span className="footer-note">
          ✅ Response verified through security checkpoints
        </span>
      </div>
    </div>
  );
}

export default ResponsePanel;