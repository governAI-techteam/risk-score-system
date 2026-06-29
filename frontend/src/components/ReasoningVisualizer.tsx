import React from 'react';
import { motion } from 'framer-motion';

const ReasoningVisualizer = ({ reasoning, assessment }) => {
  const isDanger = assessment.action === 'BLOCK';

  return (
    <section className="module module-border">
      <div className="module-header">
        <h2 className="module-title">NEURAL_REASONING_LOG</h2>
        <span style={{ fontSize: '10px', color: 'var(--on-surface-variant)' }}>SEQUENCE_TRACE_DEPTH_v2</span>
      </div>

      <div className="reasoning-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {reasoning.map((item, index) => (
          <motion.div 
            key={index}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.15 }}
            className={`reasoning-item ${isDanger && index > 0 ? 'danger' : ''}`}
            style={{ padding: '8px', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '11px', color: 'var(--primary-container)' }}>
                [{String(index + 1).padStart(2, '0')}] {item.step.toUpperCase()}
              </span>
              <span style={{ fontSize: '9px', color: 'var(--outline)' }}>
                CONFIDENCE: {(item.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--on-surface-variant)', lineHeight: '1.4' }}>
              {item.detail}
            </div>
            <div style={{ 
              position: 'absolute', 
              left: 0, 
              top: 0, 
              bottom: 0, 
              width: '2px', 
              background: 'var(--primary-container)',
              opacity: item.confidence
            }} />
          </motion.div>
        ))}
      </div>
      
      <div style={{ 
        marginTop: '12px', 
        display: 'flex', 
        justifyContent: 'space-between',
        fontSize: '10px', 
        color: 'var(--outline)',
        fontStyle: 'italic'
      }}>
        <span>FLOW: INPUT → DETECTION → INTENT → ACTION</span>
        <span>HASH: {Math.random().toString(16).slice(2, 10).toUpperCase()}</span>
      </div>
    </section>
  );
};

export default ReasoningVisualizer;