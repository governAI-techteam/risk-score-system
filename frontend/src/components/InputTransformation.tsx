import React from 'react';

interface Segment {
  segment: string;
  reason: string;
}

interface InputTransformationProps {
  original: string;
  sanitized: string;
  removedSegments: Segment[];
  dataPreserved: number;
}

const InputTransformation: React.FC<InputTransformationProps> = ({ original, sanitized, removedSegments, dataPreserved }) => {
  return (
    <section className="module module-border">
      <div className="module-header">
        <h2 className="module-title">INPUT_TRANSFORMATION</h2>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>DATA_PRESERVED: {dataPreserved}%</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Before */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--danger-text)', marginBottom: '6px' }}>🔹 BEFORE (RAW PAYLOAD)</div>
          <div style={{ 
            padding: '12px', 
            background: 'var(--danger-bg)', 
            border: '1px solid var(--danger-border)',
            borderRadius: '6px',
            fontSize: '13px',
            minHeight: '80px',
            color: 'var(--danger-text)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            {original}
          </div>
        </div>

        {/* After */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--safe-text)', marginBottom: '6px' }}>🔹 AFTER (SANITIZED PAYLOAD)</div>
          <div style={{ 
            padding: '12px', 
            background: 'var(--safe-bg)', 
            border: '1px solid var(--safe-border)',
            borderRadius: '6px',
            fontSize: '13px',
            minHeight: '80px',
            color: 'var(--safe-text)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            {sanitized}
          </div>
        </div>
      </div>

      {/* Flagged segments panel */}
      {removedSegments && removedSegments.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px' }}>🔹 FILTERED SEGMENTS DETAILS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {removedSegments.map((seg, i) => (
              <div key={i} style={{ 
                padding: '6px 12px', 
                background: 'var(--danger-bg)', 
                border: '1px solid var(--danger-border)',
                borderRadius: '4px',
                color: 'var(--danger-text)',
                fontSize: '11px',
                display: 'inline-flex',
                gap: '8px'
              }}>
                <span style={{ fontWeight: 'bold' }}>"{seg.segment}"</span>
                <span style={{ opacity: 0.8 }}>→ {seg.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default InputTransformation;
