import React from 'react';

const LEDGauge = ({ value, label, max = 100 }) => {
  const segments = 20;
  const filledSegments = Math.floor((value / max) * segments);
  const isHighRisk = value > 70;
  const color = isHighRisk ? 'var(--secondary)' : 'var(--primary-container)';

  return (
    <div className="led-gauge" style={{ marginBottom: '16px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '4px',
        fontSize: '11px',
        color: 'var(--on-surface-variant)',
        fontWeight: 'bold',
        letterSpacing: '0.1em'
      }}>
        <span>{label.toUpperCase()}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div style={{ display: 'flex', gap: '2px' }}>
        {[...Array(segments)].map((_, i) => (
          <div
            key={i}
            style={{
              height: '12px',
              flex: 1,
              background: i < filledSegments ? color : '#1a1a1a',
              boxShadow: i < filledSegments ? `0 0 8px ${color}66` : 'none',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LEDGauge;
