import { useState, useEffect } from 'react';
import type { Job, JobExecution } from '../types/taskforge';
import { fetchExecutions } from '../services/api';
import { X, ShieldAlert, Terminal, Copy, Check, Clock, Cpu, FileText } from 'lucide-react';

interface ExecutionDrawerProps {
  job: Job | null;
  onClose: () => void;
}

export const ExecutionDrawer: React.FC<ExecutionDrawerProps> = ({ job, onClose }) => {
  const [executions, setExecutions] = useState<JobExecution[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (job) {
      setLoading(true);
      fetchExecutions(job.id)
        .then(data => setExecutions(data))
        .catch(() => setExecutions([]))
        .finally(() => setLoading(false));
    }
  }, [job]);

  if (!job) return null;

  const handleCopyLogs = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '640px', height: '100%', borderRight: 0, borderTop: 0, borderBottom: 0, borderRadius: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className={`status-badge ${job.status}`}>
                <span className="status-dot"></span>
                {job.status}
              </span>
              <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                Generation #{job.claimGeneration}
              </span>
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>{job.taskType} Trace</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>ID: {job.id}</p>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content Scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Metadata Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={13} color="#818cf8" /> Fencing Token
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                Gen-{job.claimGeneration}
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Cpu size={13} color="#06b6d4" /> Claimed Worker Node
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {job.workerId || 'Unassigned / Pending'}
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} color="#34d399" /> Scheduled At
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>
                {new Date(job.scheduledAt).toLocaleString()}
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Retry Policy</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                Attempt {job.attemptNumber} of {job.maxRetries}
              </div>
            </div>
          </div>

          {/* Job Payload */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              <FileText size={15} color="#818cf8" />
              Payload Parameters
            </div>
            <pre style={{ padding: '12px 14px', borderRadius: '8px', background: '#090d16', border: '1px solid var(--border-color)', color: '#38bdf8', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', overflowX: 'auto' }}>
              {(() => {
                try {
                  return JSON.stringify(JSON.parse(job.payload), null, 2);
                } catch {
                  return job.payload;
                }
              })()}
            </pre>
          </div>

          {/* Execution Log History */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                <Terminal size={16} color="#34d399" />
                Worker Execution Logs ({executions.length})
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading execution traces...</div>
            ) : executions.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', borderRadius: '8px', background: 'var(--bg-surface)' }}>
                No execution attempts recorded yet. Job is queued for worker claim.
              </div>
            ) : (
              executions.map((exec, idx) => (
                <div key={exec.id || idx} style={{ borderRadius: '10px', background: '#090d16', border: '1px solid var(--border-color)', marginBottom: '14px', overflow: 'hidden' }}>
                  
                  {/* Log Header */}
                  <div style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
                      <span style={{ fontWeight: 700, color: exec.status === 'SUCCESS' ? '#34d399' : exec.status === 'FAILED' ? '#fb7185' : '#818cf8' }}>
                        [{exec.status}]
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>IdempotencyKey: {exec.idempotencyKey}</span>
                    </div>

                    <button
                      onClick={() => handleCopyLogs(exec.executionLogs)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      {copied ? <Check size={13} color="#34d399" /> : <Copy size={13} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  {/* Log Output Console */}
                  <div style={{ padding: '14px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: '240px', overflowY: 'auto' }}>
                    {exec.resultSummary && (
                      <div style={{ color: '#34d399', fontWeight: 600, marginBottom: '6px' }}>
                        ✓ {exec.resultSummary}
                      </div>
                    )}
                    {exec.errorMessage && (
                      <div style={{ color: '#fb7185', fontWeight: 600, marginBottom: '6px' }}>
                        ✗ {exec.errorMessage}
                      </div>
                    )}
                    {exec.executionLogs || '[No log output available for this step]'}
                  </div>

                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
