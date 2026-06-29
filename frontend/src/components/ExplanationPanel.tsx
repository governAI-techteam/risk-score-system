import React from 'react';

const ExplanationPanel = ({ explanation, assessment }) => {
  const isDanger = assessment.action === 'BLOCK';
  const color = isDanger ? 'var(--secondary)' : 'var(--primary-container)';
  
  return (
    <section className={`module module-border ${isDanger ? 'risk-high' : ''}`}>
      <div className="module-header">
        <h2 className="module-title">SECURITY_EXPLANATION</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--outline)', marginBottom: '4px' }}>🔹 WHAT_HAPPENED</div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color }}>{explanation.what}</div>
        </div>
        
        <div>
          <div style={{ fontSize: '10px', color: 'var(--outline)', marginBottom: '4px' }}>🔹 WHY_DANGEROUS</div>
          <div style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>{explanation.why}</div>
        </div>
        
        <div>
          <div style={{ fontSize: '10px', color: 'var(--outline)', marginBottom: '4px' }}>🔹 SYSTEM_RESPONSE</div>
          <div style={{ fontSize: '13px', color: 'var(--tertiary-container)' }}>{explanation.systemDid}</div>
        </div>
      </div>
    </section>
  );
};

export default ExplanationPanel;