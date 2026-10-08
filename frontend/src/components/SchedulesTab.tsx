import { useState } from 'react';
import type { JobSchedule, CreateScheduleDto } from '../types/taskforge';
import { Plus, Calendar, CheckCircle, FileCode } from 'lucide-react';

interface SchedulesTabProps {
  schedules: JobSchedule[];
  onCreateSchedule: (dto: CreateScheduleDto) => Promise<void>;
  taskTypes: string[];
}

export const SchedulesTab: React.FC<SchedulesTabProps> = ({
  schedules,
  onCreateSchedule,
  taskTypes,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [taskType, setTaskType] = useState<string>(taskTypes[0] || 'DATA_CLEANUP');
  const [cronExpression, setCronExpression] = useState<string>('0 0 * * * ?');
  const [payloadText, setPayloadText] = useState<string>('{\n  "retentionDays": 30\n}');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let parsed = {};
      try { parsed = JSON.parse(payloadText); } catch {}
      await onCreateSchedule({
        name,
        taskType,
        cronExpression,
        payload: parsed,
      });
      setShowModal(false);
      setName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Recurring Cron Schedules</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Automated background task dispatchers managed by Spring TaskScheduler</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 0 14px rgba(99, 102, 241, 0.4)'
          }}
        >
          <Plus size={16} />
          Create Cron Schedule
        </button>
      </div>

      {/* Grid of Schedules */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {schedules.map((sched) => (
          <div key={sched.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(129, 140, 248, 0.3)' }}>
                  {sched.taskType}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: sched.enabled ? '#34d399' : 'var(--text-muted)' }}>
                  <CheckCircle size={13} />
                  {sched.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                {sched.name}
              </h3>

              <div style={{ padding: '8px 12px', borderRadius: '6px', background: '#090d16', border: '1px solid var(--border-color)', color: '#38bdf8', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCode size={14} color="#818cf8" />
                <span>{sched.cronExpression}</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} />
                Next: {new Date(sched.nextRunAt).toLocaleTimeString()}
              </div>
              <div>Priority {sched.priority}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '90%', maxWidth: '500px', padding: '24px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>Configure Recurring Cron Task</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Schedule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Data Sanitization"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: '#ffffff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Task Type</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: '#ffffff', fontSize: '0.85rem' }}
                >
                  {taskTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Cron Expression</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0 0 * * * ?"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#090d16', border: '1px solid var(--border-color)', color: '#38bdf8', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Payload (JSON)</label>
                <textarea
                  rows={3}
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#090d16', border: '1px solid var(--border-color)', color: '#38bdf8', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: '#ffffff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
