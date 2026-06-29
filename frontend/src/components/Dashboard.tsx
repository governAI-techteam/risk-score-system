import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

interface Metrics {
  totalScans: number;
  blocked: number;
  sanitized: number;
  allowed: number;
  avgRisk: number;
}

interface Distributions {
  directAttacks: number;
  indirectAttacks: number;
  piiLeaks: number;
  cleanCount: number;
}

interface ScanRecord {
  scanId: string;
  fileName: string;
  fileSize: number;
  verdict: string;
  riskScore: number;
  severity: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics>({ totalScans: 0, blocked: 0, sanitized: 0, allowed: 0, avgRisk: 0 });
  const [distribution, setDistribution] = useState<Distributions>({ directAttacks: 0, indirectAttacks: 0, piiLeaks: 0, cleanCount: 0 });
  const [dailyActivity, setDailyActivity] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [analyticsRes, scansRes] = await Promise.all([
        axios.get('/api/analytics'),
        axios.get('/api/scans')
      ]);

      if (analyticsRes.data?.success) {
        setMetrics(analyticsRes.data.data.metrics);
        setDistribution(analyticsRes.data.data.distributions);
        setDailyActivity(analyticsRes.data.data.dailyActivity);
      }
      if (scansRes.data?.success) {
        setRecentScans(scansRes.data.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Poll every 15s for new telemetry
    return () => clearInterval(interval);
  }, []);

  const getBlockRate = () => {
    if (!metrics.totalScans) return '0%';
    return `${Math.round((metrics.blocked / metrics.totalScans) * 100)}%`;
  };

  const getSanitizeRate = () => {
    if (!metrics.totalScans) return '0%';
    return `${Math.round((metrics.sanitized / metrics.totalScans) * 100)}%`;
  };

  // Find max activity for scaling chart
  const maxActivity = Math.max(...dailyActivity, 1);

  return (
    <div className="dashboard-container">
      {/* Telemetry Counter Cards */}
      <section className="metrics-grid">
        <div className="metric-card module-border">
          <div className="metric-header">TOTAL_SCANS_PROCESSED</div>
          <div className="metric-value status-safe">{metrics.totalScans}</div>
          <div className="metric-footer">REAL_TIME_STREAM</div>
        </div>
        <div className="metric-card module-border red-glow">
          <div className="metric-header">THREATS_BLOCKED</div>
          <div className="metric-value status-danger">{metrics.blocked}</div>
          <div className="metric-footer">BLOCK_RATE: {getBlockRate()}</div>
        </div>
        <div className="metric-card module-border warning-glow">
          <div className="metric-header">DATA_SANITIZED</div>
          <div className="metric-value status-warning">{metrics.sanitized}</div>
          <div className="metric-footer">SANITIZATION_RATE: {getSanitizeRate()}</div>
        </div>
        <div className="metric-card module-border">
          <div className="metric-header">MEAN_RISK_INDEX</div>
          <div className="metric-value" style={{ color: metrics.avgRisk > 5 ? 'var(--secondary)' : 'var(--primary-container)' }}>
            {metrics.avgRisk}/10
          </div>
          <div className="metric-footer">DECISION_THRESHOLD: 4.5</div>
        </div>
      </section>

      {/* Visual Analytics Charts Section */}
      <section className="analytics-section">
        {/* Daily Activity Chart */}
        <div className="chart-wrapper module-border">
          <div className="module-header">
            <h2 className="module-title">DAILY_VOLUME_TELEMETRY</h2>
            <span className="module-meta">PAST_7_DAYS</span>
          </div>
          <div className="bar-chart">
            {dailyActivity.map((val, idx) => {
              const heightPct = (val / maxActivity) * 80 + 10; // scale from 10% to 90%
              const days = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'TODAY'];
              return (
                <div key={idx} className="bar-column">
                  <div className="bar-value">{val}</div>
                  <div className="bar-grow" style={{ height: `${heightPct}%` }}>
                    <div className="bar-glow-effect" />
                  </div>
                  <div className="bar-label">{days[idx]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Threat Distribution Chart */}
        <div className="chart-wrapper module-border">
          <div className="module-header">
            <h2 className="module-title">THREAT_VECTOR_CLASSIFICATION</h2>
            <span className="module-meta">DISTRIBUTION_MAP</span>
          </div>
          
          <div className="distribution-list">
            <div className="dist-item">
              <div className="dist-labels">
                <span className="dist-name">DIRECT_INJECTION (JAILBREAK)</span>
                <span className="dist-count status-danger">{distribution.directAttacks}</span>
              </div>
              <div className="dist-bar-track">
                <div className="dist-bar status-danger-bg" style={{ width: `${metrics.totalScans ? (distribution.directAttacks / metrics.totalScans) * 100 : 0}%` }} />
              </div>
            </div>

            <div className="dist-item">
              <div className="dist-labels">
                <span className="dist-name">INDIRECT_ATTACK (DOCUMENT)</span>
                <span className="dist-count status-warning">{distribution.indirectAttacks}</span>
              </div>
              <div className="dist-bar-track">
                <div className="dist-bar status-warning-bg" style={{ width: `${metrics.totalScans ? (distribution.indirectAttacks / metrics.totalScans) * 100 : 0}%` }} />
              </div>
            </div>

            <div className="dist-item">
              <div className="dist-labels">
                <span className="dist-name">PII_&_CREDENTIAL_LEAKS</span>
                <span className="dist-count" style={{ color: '#00bfff' }}>{distribution.piiLeaks}</span>
              </div>
              <div className="dist-bar-track">
                <div className="dist-bar" style={{ width: `${metrics.totalScans ? (distribution.piiLeaks / metrics.totalScans) * 100 : 0}%`, backgroundColor: '#00bfff' }} />
              </div>
            </div>

            <div className="dist-item">
              <div className="dist-labels">
                <span className="dist-name">CLEAN_TRAFFIC_VERIFIED</span>
                <span className="dist-count status-safe">{distribution.cleanCount}</span>
              </div>
              <div className="dist-bar-track">
                <div className="dist-bar status-safe-bg" style={{ width: `${metrics.totalScans ? (distribution.cleanCount / metrics.totalScans) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Operations Feed Table */}
      <section className="live-feed-section module-border">
        <div className="module-header">
          <h2 className="module-title">LIVE_SECURITY_EVENT_FEED</h2>
          <span className="status-chip status-safe pulse">ONLINE_TELEMETRY</span>
        </div>

        <div className="feed-table-container">
          <table className="feed-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>SCAN_ID</th>
                <th>SOURCE_ASSET</th>
                <th>VERDICT</th>
                <th>RISK_SCORE</th>
                <th>SEVERITY</th>
              </tr>
            </thead>
            <tbody>
              {recentScans.length > 0 ? (
                recentScans.map((scan) => {
                  const isBlock = scan.verdict === 'BLOCK';
                  const isSanitize = scan.verdict === 'SANITIZE';
                  return (
                    <tr key={scan.scanId} className="feed-row">
                      <td className="time-col">{new Date(scan.timestamp).toLocaleTimeString()}</td>
                      <td className="id-col">{scan.scanId}</td>
                      <td className="asset-col">{scan.fileName}</td>
                      <td className="verdict-col">
                        <span className={`verdict-badge ${isBlock ? 'v-block' : isSanitize ? 'v-sanitize' : 'v-allow'}`}>
                          {scan.verdict}
                        </span>
                      </td>
                      <td className="score-col">{scan.riskScore}/10</td>
                      <td className={`severity-col ${isBlock ? 'status-danger' : isSanitize ? 'status-warning' : 'status-safe'}`}>
                        {scan.severity}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--outline)' }}>
                    NO_RECENT_THREATS_DETECTED // GATEWAY_SECURE
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
