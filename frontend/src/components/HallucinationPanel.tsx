import React from 'react';
import { motion } from 'framer-motion';
import './HallucinationPanel.css';

function HallucinationPanel({ hallucination }) {
  const { confidence, reasoning, indicators, evaluation } = hallucination;

  const getConfidenceColor = () => {
    if (confidence.level === 'HIGH') return 'safe';
    if (confidence.level === 'MEDIUM') return 'warning';
    return 'danger';
  };

  const getConfidenceWidth = () => {
    return `${confidence.score * 10}%`;
  };

  return (
    <div className="hallucination-panel glass-card">
      <div className="component-header">
        <span>🔬</span>
        <span>Hallucination Analysis</span>
      </div>

      <div className="confidence-section">
        <div className="confidence-header">
          <span className="confidence-label">Confidence Level</span>
          <span className={`confidence-value confidence-${getConfidenceColor()}`}>
            {confidence.level}
          </span>
        </div>
        
        <div className="confidence-bar">
          <motion.div 
            className={`confidence-fill confidence-${getConfidenceColor()}`}
            initial={{ width: 0 }}
            animate={{ width: getConfidenceWidth() }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        
        <div className="confidence-meta">
          <span>Score: {confidence.score}/10</span>
        </div>
      </div>

      <div className="reasoning-section">
        <div className="section-label">
          <span>📝</span>
          <span>Reason</span>
        </div>
        <p className="reasoning-text">{reasoning.reason}</p>
      </div>

      <div className="interpretation-section">
        <div className="section-label">
          <span>💭</span>
          <span>Interpretation</span>
        </div>
        <div className={`interpretation-box interpretation-${getConfidenceColor()}`}>
          <p>{reasoning.interpretation}</p>
        </div>
      </div>

      <div className="factors-section">
        <div className="section-label">
          <span>⚖️</span>
          <span>Confidence Factors</span>
        </div>
        <div className="factors-list">
          {confidence.factors.map((factor, index) => (
            <div key={index} className={`factor-tag factor-${factor.impact}`}>
              {factor.factor}: {factor.description}
            </div>
          ))}
        </div>
      </div>

      {indicators && indicators.length > 0 && (
        <div className="indicators-section">
          <div className="section-label">
            <span>⚠️</span>
            <span>Detected Indicators</span>
          </div>
          <div className="indicators-list">
            {indicators.map((indicator, index) => (
              <div key={index} className={`indicator-item indicator-${indicator.severity}`}>
                <span className="indicator-type">{indicator.type.replace(/_/g, ' ')}</span>
                <span className="indicator-count">{indicator.matches} match(es)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="metrics-section">
        <div className="section-label">
          <span>📊</span>
          <span>Quality Metrics</span>
        </div>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-name">Logical Consistency</span>
            <span className={`metric-value metric-${evaluation.logicalConsistency.score >= 7 ? 'safe' : 'warning'}`}>
              {evaluation.logicalConsistency.assessment}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-name">Clarity</span>
            <span className={`metric-value metric-${evaluation.clarity.score >= 7 ? 'safe' : 'warning'}`}>
              {evaluation.clarity.assessment}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-name">Specificity</span>
            <span className={`metric-value metric-${evaluation.specificity.score >= 6 ? 'safe' : 'warning'}`}>
              {evaluation.specificity.assessment}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-name">Source Attribution</span>
            <span className={`metric-value metric-${evaluation.sourceAttribution.score >= 6 ? 'safe' : 'warning'}`}>
              {evaluation.sourceAttribution.assessment}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HallucinationPanel;