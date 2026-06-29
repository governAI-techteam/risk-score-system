import React, { useState } from 'react';
import TopBar from './components/TopBar';
import InputPanel from './components/InputPanel';
import RiskScoreCard from './components/RiskScoreCard';
import InputTransformation from './components/InputTransformation';
import SafeRewrite from './components/SafeRewrite';
import FileScanner from './components/FileScanner';
import { securityAPI } from './services/api';
import './styles/App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'playground' | 'scanner'>('playground');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeInput = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await securityAPI.analyze(input);
      if (response.data && response.data.success) {
        setResult(response.data.data);
      } else {
        setError("Invalid response from security core.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to PromptLy security core.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
    setError(null);
  };

  const getStatus = () => {
    if (loading) return "SCANNING";
    if (!result) return "SAFE";
    if (result?.assessment?.action === "BLOCK") return "UNDER_ATTACK";
    if (result?.assessment?.action === "SANITIZE") return "SUSPICIOUS";
    return "SAFE";
  };

  return (
    <div className="app">
      <TopBar status={getStatus()} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'scanner' ? (
          <FileScanner />
        ) : (
          <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <InputPanel
              input={input}
              setInput={setInput}
              onSubmit={analyzeInput}
              onClear={handleClear}
              loading={loading}
              metadata={result?.metadata}
            />

            {error && (
              <div className="module module-border" style={{ borderColor: 'var(--danger-border)', color: 'var(--danger-text)', background: 'var(--danger-bg)', padding: '12px' }}>
                ⚠️ ERROR: {error}
              </div>
            )}

            {loading && (
              <div className="module module-border" style={{ textAlign: 'center', padding: '40px', color: 'var(--primary)' }}>
                <div style={{ fontWeight: '600', fontSize: '15px' }}>
                  Analyzing payload inputs... Please wait.
                </div>
              </div>
            )}

            {result && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <RiskScoreCard assessment={result.assessment} />
                
                <InputTransformation 
                  original={result.input}
                  sanitized={result.sanitized}
                  removedSegments={result.removedSegments}
                  dataPreserved={result.dataPreserved}
                />

                {result.safeRewrite && (
                  <SafeRewrite suggestion={result.safeRewrite} />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{ 
        textAlign: 'center', 
        fontSize: '11px', 
        color: 'var(--text-secondary)', 
        marginTop: 'auto',
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        fontWeight: '500'
      }}>
        PromptLy // Simple & Secure LLM Guardrails // (C) 2026 PromptLy Group
      </footer>
    </div>
  );
}

export default App;