import { useState } from 'react';
import type { CreateJobDto } from '../types/taskforge';
import { X, Send, Sliders, FileJson } from 'lucide-react';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateJobDto) => Promise<void>;
  taskTypes: string[];
}

export const NewJobModal: React.FC<NewJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  taskTypes,
}) => {
  const [taskType, setTaskType] = useState<string>(taskTypes[0] || 'DATA_CLEANUP');
  const [payloadText, setPayloadText] = useState<string>('{\n  "retentionDays": 30,\n  "targetTable": "audit_logs"\n}');
  const [priority, setPriority] = useState<number>(5);
  const [maxRetries, setMaxRetries] = useState<number>(3);
  const [delaySeconds, setDelaySeconds] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTaskTypeChange = (selected: string) => {
    setTaskType(selected);
    // Provide sensible default JSON templates for different task types
    if (selected === 'CSV_REPORT') {
      setPayloadText('{\n  "reportType": "MONTHLY_FINANCIAL",\n  "dateRange": "2026-10"\n}');
    } else if (selected === 'EMAIL_NOTIFICATION') {
      setPayloadText('{\n  "recipient": "devops@company.org",\n  "template": "ALERT_SUMMARY"\n}');
    } else if (selected === 'DATA_CLEANUP') {
      setPayloadText('{\n  "retentionDays": 30,\n  "targetTable": "audit_logs"\n}');
    } else if (selected === 'IMAGE_PROCESSING') {
      setPayloadText('{\n  "sourceUrl": "https://images.unsplash.com/sample.jpg",\n  "format": "WEBP"\n}');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch (err) {
      setError('Invalid JSON payload formatting. Please check syntax.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        taskType,
        payload: parsedPayload,
        priority,
        maxRetries,
        delaySeconds
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '90%', maxWidth: '560px', padding: '24px', position: 'relative', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>Submit New Orchestration Task</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Configure payload, priority, and retry policy</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185', fontSize: '0.82rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Task Type Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Task Handler Strategy
            </label>
            <select
              value={taskType}
              onChange={(e) => handleTaskTypeChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            >
              {taskTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* JSON Payload Editor */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                <FileJson size={14} color="#818cf8" />
                Payload (JSON)
              </label>
            </div>
            <textarea
              rows={5}
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#090d16',
                border: '1px solid var(--border-color)',
                color: '#38bdf8',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Priority & Retries Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                <Sliders size={12} /> Priority (1-10)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  color: '#ffffff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Max Retries
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  color: '#ffffff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Delay (Seconds)
              </label>
              <input
                type="number"
                min={0}
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  color: '#ffffff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
              }}
            >
              <Send size={16} />
              {isSubmitting ? 'Enqueuing...' : 'Enqueue Job'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
