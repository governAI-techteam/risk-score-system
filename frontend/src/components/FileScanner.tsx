import React, { useState, useRef } from 'react';
import axios from 'axios';
import RiskScoreCard from './RiskScoreCard';
import './FileScanner.css';

interface LineItem {
  lineNumber: number;
  text: string;
  status: 'SAFE' | 'REMOVED' | 'FLAGGED';
  reason: string | null;
}

interface ScanResult {
  scanId: string;
  fileName: string;
  fileSize: number;
  verdict: string;
  riskScore: number;
  severity: string;
  piiCount: number;
  injectionsCount: number;
  malwareDetected?: boolean;
  malwareName?: string | null;
  malwareSource?: string | null;
  attackType?: string;
  intent?: string;
  lines: LineItem[];
  sanitizedContent: string;
}

const FileScanner: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'original' | 'sanitized'>('original');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processScan = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setScanning(true);
    setScanResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await axios.post('/api/scan-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Simulate a small network delay for smooth visual transition
      setTimeout(() => {
        if (response.data && response.data.success) {
          setScanResult(response.data.data);
        } else {
          setError('Scanning failed. Verify file formatting.');
        }
        setScanning(false);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setTimeout(() => {
        setError(err.response?.data?.error || 'Unable to scan document. Server connection failed.');
        setScanning(false);
      }, 1500);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processScan(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processScan(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = () => {
    if (!scanResult || scanResult.malwareDetected) return;
    window.open(`/api/download-sanitized/${scanResult.scanId}`, '_blank');
  };

  return (
    <div className="scanner-container">
      {/* Drag and Drop Zone */}
      {!scanning && !scanResult && (
        <div 
          className={`upload-zone module-border ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileInput}
            style={{ display: 'none' }}
            accept=".txt,.csv,.json,.md,.log,.png,.jpg,.jpeg"
          />
          <div className="upload-icon">📄</div>
          <h3 className="upload-title">Scan Document for Prompt Injection & Malware</h3>
          <p className="upload-desc">
            Supports: .txt, .json, .csv, .md, .log // Max size: 32MB
          </p>
          <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>
            Choose File
          </button>
        </div>
      )}

      {/* Loading Spinner */}
      {scanning && (
        <div className="scanning-state module-border" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px' }}>
          <div className="spinner" />
          <div style={{ marginTop: '20px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Parsing content & analyzing line security...
          </div>
        </div>
      )}

      {/* Results View */}
      {scanResult && !scanning && (
        <div className="results-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Critical Malware Warning Banner */}
          {scanResult.malwareDetected && (
            <div className="malware-alert-banner">
              <span className="malware-alert-icon">☣️</span>
              <div className="malware-alert-content">
                <h4 className="malware-alert-title">CRITICAL MALWARE THREAT DETECTED</h4>
                <p className="malware-alert-desc">
                  This document contains signature payloads flagged by <strong>{scanResult.malwareSource}</strong>. 
                  Threat signature: <span className="malware-name-tag">{scanResult.malwareName}</span>. Processing blocked immediately.
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Metadata Summary */}
            <div className="module-border asset-details-card">
              <div className="module-header">
                <h2 className="module-title">ASSET SUMMARY</h2>
                <button className="btn-ghost btn-secondary btn-sm" onClick={() => setScanResult(null)}>
                  Scan New File
                </button>
              </div>
              <div className="metadata-grid">
                <div className="meta-pair">
                  <span className="meta-label">FILENAME:</span>
                  <span className="meta-value" style={{ color: 'var(--text-primary)' }}>{scanResult.fileName}</span>
                </div>
                <div className="meta-pair">
                  <span className="meta-label">SIZE:</span>
                  <span className="meta-value">{scanResult.fileSize} Bytes</span>
                </div>
                <div className="meta-pair">
                  <span className="meta-label">MALWARE DETECT:</span>
                  <span className={`meta-value ${scanResult.malwareDetected ? 'status-danger' : 'status-safe'}`}>
                    {scanResult.malwareDetected ? 'DETECTED' : 'CLEAN'}
                  </span>
                </div>
                <div className="meta-pair">
                  <span className="meta-label">INJECTION COUNT:</span>
                  <span className="meta-value">{scanResult.injectionsCount} threats</span>
                </div>
              </div>

              <div className="asset-actions" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  className={`btn-ghost ${scanResult.malwareDetected ? 'btn-disabled' : ''}`} 
                  onClick={handleDownload} 
                  disabled={scanResult.malwareDetected}
                  style={{ width: '100%' }}
                >
                  {scanResult.malwareDetected ? '📥 Download Blocked (Malware)' : '📥 Download Clean File'}
                </button>
              </div>
            </div>

            {/* General Risk Assessment Card */}
            <RiskScoreCard 
              assessment={{
                riskScore: scanResult.riskScore,
                severity: scanResult.severity,
                action: scanResult.verdict,
                attackType: scanResult.attackType,
                intent: scanResult.intent,
                confidence: 0.95
              }} 
            />
          </div>

          {/* Line Auditor Highlighter */}
          <section className="line-inspection-panel module-border">
            <div className="module-header flex-header">
              <h2 className="module-title">LINE HIGHLIGHTER BROWSER</h2>
              <div className="view-toggle-bar">
                <button 
                  className={`toggle-btn ${viewMode === 'original' ? 'active' : ''}`}
                  onClick={() => setViewMode('original')}
                  disabled={scanResult.malwareDetected}
                  style={{ opacity: scanResult.malwareDetected ? 0.5 : 1, cursor: scanResult.malwareDetected ? 'not-allowed' : 'pointer' }}
                >
                  Show Original
                </button>
                <button 
                  className={`toggle-btn ${viewMode === 'sanitized' ? 'active' : ''}`}
                  onClick={() => setViewMode('sanitized')}
                  disabled={scanResult.malwareDetected}
                  style={{ opacity: scanResult.malwareDetected ? 0.5 : 1, cursor: scanResult.malwareDetected ? 'not-allowed' : 'pointer' }}
                >
                  Show Sanitized
                </button>
              </div>
            </div>

            <div className="line-feed-container">
              {scanResult.lines.map((line) => {
                const isRemoved = line.status === 'REMOVED';
                const isFlagged = line.status === 'FLAGGED';
                
                let displayedText = line.text;
                if (viewMode === 'sanitized' && isRemoved && !scanResult.malwareDetected) {
                  if (line.reason?.includes('Override') || line.reason?.includes('Suspicion')) {
                    displayedText = '[REMOVED: Potential Prompt Injection]';
                  } else if (line.reason?.includes('email')) {
                    displayedText = line.text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi, '[REDACTED: email]');
                  } else if (line.reason?.includes('phone')) {
                    displayedText = line.text.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED: phone]');
                  } else if (line.reason?.includes('ssn')) {
                    displayedText = line.text.replace(/\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, '[REDACTED: ssn]');
                  } else if (line.reason?.includes('api_key')) {
                    displayedText = 'API_KEY: [REDACTED]';
                  } else if (line.reason?.includes('password')) {
                    displayedText = 'PASSWORD: [REDACTED]';
                  } else if (line.reason?.includes('secret')) {
                    displayedText = 'SECRET: [REDACTED]';
                  }
                }

                return (
                  <div 
                    key={line.lineNumber} 
                    className={`inspect-line ${isRemoved ? 'line-removed' : isFlagged ? 'line-flagged' : 'line-safe'}`}
                  >
                    <span className="line-num">{String(line.lineNumber).padStart(3, '0')}</span>
                    <span className="line-text">{displayedText}</span>
                    {isRemoved && line.reason && (
                      <span className="line-alert-reason">{line.reason}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {error && (
        <div className="error-message module-border" style={{ borderColor: 'var(--danger-border)', background: 'var(--danger-bg)', color: 'var(--danger-text)' }}>
          ⚠️ ERROR: {error}
          <button className="btn-ghost btn-secondary btn-sm" onClick={() => setError(null)} style={{ marginLeft: 'auto' }}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default FileScanner;
