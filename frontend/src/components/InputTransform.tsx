import React from 'react';
import { motion } from 'framer-motion';
import './InputTransform.css';

function InputTransform({ result }) {
  // 🛡️ Safety check (prevents crash completely)
  if (!result) return null;

  const {
    input,
    sanitized,
    action,
    riskScore
  } = result;

  // 🟢 SAFE CASE
  if (action === 'ALLOW') {
    return (
      <div className="input-transform glass-card">
        <div className="component-header">
          <span>🔄</span>
          <span>Input Transformation</span>
        </div>

        <div className="transform-status">
          <span className="status-icon">✅</span>
          <span>No transformation needed - Input is clean</span>
        </div>
      </div>
    );
  }

  // 🔴 ATTACK / SANITIZED CASE
  return (
    <div className="input-transform glass-card">
      <div className="component-header">
        <span>🔄</span>
        <span>Input Transformation</span>
      </div>

      <div className="transform-grid">

        {/* BEFORE */}
        <div className="transform-box">
          <div className="box-label">
            <span className="label-icon">📥</span>
            <span>BEFORE</span>
          </div>

          <div className="box-content">
            <pre>{input || "No input available"}</pre>
          </div>

          <div className="box-meta">
            {input ? input.length : 0} characters
          </div>
        </div>

        {/* ARROW */}
        <div className="transform-arrow">
          <span>→</span>
        </div>

        {/* AFTER */}
        <div className="transform-box">
          <div className="box-label box-label-safe">
            <span className="label-icon">🛡️</span>
            <span>AFTER</span>
          </div>

          <div className="box-content">
            <pre>{sanitized || "No sanitized output"}</pre>
          </div>

          <div className="box-meta">
            {sanitized ? sanitized.length : 0} characters
          </div>
        </div>

      </div>

      {/* OPTIONAL: Simulated Removed Segments */}
      {input && sanitized && input !== sanitized && (
        <div className="removed-segments">
          <div className="segments-label">
            <span className="label-icon">⚠️</span>
            <span>Removed Segments (Detected)</span>
          </div>

          <div className="segments-list">
            <motion.div
              className="segment-item"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="segment-content">
                Suspicious instructions removed
              </div>
              <div className="segment-reason">
                Detected prompt injection pattern
              </div>
            </motion.div>
          </div>
        </div>
      )}

    </div>
  );
}

export default InputTransform;