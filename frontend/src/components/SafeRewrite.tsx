import React from 'react';

interface SafeRewriteProps {
  suggestion: string;
}

const SafeRewrite: React.FC<SafeRewriteProps> = ({ suggestion }) => {
  return (
    <section 
      className="module module-border" 
      style={{ 
        borderColor: 'var(--safe-border)', 
        background: 'var(--safe-bg)' 
      }}
    >
      <div className="module-header" style={{ borderBottom: '1px solid var(--safe-border)' }}>
        <h2 className="module-title" style={{ color: 'var(--safe-text)' }}>💡 SAFE REWRITE SUGGESTION</h2>
      </div>
      
      <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--safe-text)', fontWeight: '500' }}>
        {suggestion}
      </div>
      
      <div style={{ 
        marginTop: '12px', 
        fontSize: '10px', 
        color: 'var(--outline)',
        textAlign: 'right',
        textTransform: 'uppercase',
        fontWeight: 'bold'
      }}>
        RECOMMENDED FOR SECURE PAYLOAD PROCESSING
      </div>
    </section>
  );
};

export default SafeRewrite;
