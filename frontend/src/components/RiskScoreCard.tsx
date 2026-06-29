import React from 'react';

interface Assessment {
  riskScore: number;
  severity: string;
  action: string;
  attackType?: string;
  intent?: string;
  confidence: number;
}

interface RiskScoreCardProps {
  assessment: Assessment;
}

const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ assessment }) => {
  const isHighRisk = assessment.riskScore >= 7.5;
  const isMedRisk = assessment.riskScore >= 4.0;
  const isLowRisk = assessment.riskScore < 4.0;

  let statusColor = 'var(--safe-text)';
  let statusBg = 'var(--safe-bg)';
  let statusBorder = 'var(--safe-border)';

  if (isHighRisk) {
    statusColor = 'var(--danger-text)';
    statusBg = 'var(--danger-bg)';
    statusBorder = 'var(--danger-border)';
  } else if (isMedRisk) {
    statusColor = 'var(--warning-text)';
    statusBg = 'var(--warning-bg)';
    statusBorder = 'var(--warning-border)';
  }

  return (
    <section 
      className="module module-border" 
      style={{ 
        borderColor: statusBorder,
        background: statusBg 
      }}
    >
      <div className="module-header" style={{ borderBottom: `1px solid ${statusBorder}` }}>
        <h2 className="module-title" style={{ color: statusColor }}>SECURITY_ASSESSMENT</h2>
        <span 
          className="status-chip" 
          style={{ 
            color: statusColor, 
            background: 'var(--surface)', 
            border: `1px solid ${statusBorder}`,
            fontWeight: 'bold'
          }}
        >
          {assessment.action}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', alignItems: 'center' }}>
        {/* Score Column */}
        <div style={{ textAlign: 'center', borderRight: `1px solid ${statusBorder}`, paddingRight: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '4px' }}>RISK_SCORE</div>
          <div style={{ 
            fontSize: '40px', 
            fontWeight: '800', 
            color: statusColor,
            lineHeight: 1.1
          }}>
            {assessment.riskScore.toFixed(1)}
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/10</span>
          </div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: statusColor, marginTop: '4px', textTransform: 'uppercase' }}>
            {assessment.severity} SEVERITY
          </div>
        </div>
        
        {/* Indicators Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Attack Type:</span>
            <span style={{ fontWeight: 'bold', color: statusColor }}>{assessment.attackType || 'None'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Intent Clues:</span>
            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{assessment.intent || 'None Detected'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Confidence:</span>
            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{(assessment.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RiskScoreCard;