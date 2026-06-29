import React from 'react';

interface Metadata {
  inputType: string;
  length: number;
  source: string;
}

interface InputPanelProps {
  input: string;
  setInput: (val: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  loading: boolean;
  metadata?: Metadata;
}

const InputPanel: React.FC<InputPanelProps> = ({ input, setInput, onSubmit, onClear, loading, metadata }) => {
  return (
    <section className="module module-border">
      <div className="module-header">
        <h2 className="module-title">PROMPT_INJECT_SCANNER</h2>
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          {metadata && (
            <>
              <span>Type: {metadata.inputType}</span>
              <span>Length: {metadata.length} chars</span>
            </>
          )}
        </div>
      </div>
      
      <div className="terminal-input-container">
        <textarea
          className="terminal-input"
          placeholder="Paste or type a prompt here to analyze it for injection and data leaks..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{ height: '100px' }}
        />
      </div>

      <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
        <button 
          className="btn-ghost" 
          onClick={onSubmit} 
          disabled={loading || !input.trim()}
          style={{ flex: 2 }}
        >
          {loading ? 'ANALYZING...' : 'RUN_SECURITY_CHECK'}
        </button>
        <button 
          className="btn-ghost btn-secondary" 
          onClick={onClear}
          disabled={loading}
          style={{ flex: 1 }}
        >
          CLEAR
        </button>
      </div>
    </section>
  );
};

export default InputPanel;