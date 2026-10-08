import { useState } from 'react';
import type { Job, JobStatus } from '../types/taskforge';
import { Search, Eye, RotateCcw, XCircle, Filter } from 'lucide-react';

interface JobsTableProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onRetryJob: (id: string) => void;
  onCancelJob: (id: string) => void;
  activeStatusFilter: JobStatus | 'ALL';
  setStatusFilter: (status: JobStatus | 'ALL') => void;
}

export const JobsTable: React.FC<JobsTableProps> = ({
  jobs,
  onSelectJob,
  onRetryJob,
  onCancelJob,
  activeStatusFilter,
  setStatusFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const statuses: (JobStatus | 'ALL')[] = [
    'ALL',
    'QUEUED',
    'RUNNING',
    'COMPLETED',
    'FAILED',
    'RETRY_WAIT',
    'CANCELLED'
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = activeStatusFilter === 'ALL' || job.status === activeStatusFilter;
    const matchesSearch = 
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.taskType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.workerId && job.workerId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      
      {/* Table Toolbar */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        
        {/* Status Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
          <Filter size={15} color="var(--text-muted)" style={{ marginRight: '4px' }} />
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: activeStatusFilter === st ? 'var(--bg-surface)' : 'transparent',
                color: activeStatusFilter === st ? '#ffffff' : 'var(--text-muted)',
                outline: activeStatusFilter === st ? '1px solid var(--border-glow)' : 'none'
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search job ID, type, worker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              borderRadius: '6px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              color: '#ffffff',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>

      </div>

      {/* Table Data */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <th style={{ padding: '12px 20px' }}>Job ID / Type</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Priority</th>
              <th style={{ padding: '12px 16px' }}>Fencing Token</th>
              <th style={{ padding: '12px 16px' }}>Worker Node</th>
              <th style={{ padding: '12px 16px' }}>Attempt</th>
              <th style={{ padding: '12px 16px' }}>Scheduled</th>
              <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No orchestration jobs match the selected filter.
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Job ID & Type */}
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{job.taskType}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {job.id}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`status-badge ${job.status}`}>
                      <span className="status-dot"></span>
                      {job.status}
                    </span>
                  </td>

                  {/* Priority */}
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: 600, color: job.priority > 7 ? '#fb7185' : job.priority > 4 ? '#fbbf24' : '#818cf8' }}>
                      P{job.priority}
                    </span>
                  </td>

                  {/* Fencing Generation Token */}
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#38bdf8' }}>
                    Gen-{job.claimGeneration}
                  </td>

                  {/* Worker Node */}
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: job.workerId ? 'var(--text-main)' : 'var(--text-dim)' }}>
                    {job.workerId || '—'}
                  </td>

                  {/* Attempt / Max */}
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {job.attemptNumber} / {job.maxRetries}
                  </td>

                  {/* Scheduled Time */}
                  <td style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(job.scheduledAt).toLocaleTimeString()}
                  </td>

                  {/* Action Buttons */}
                  <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        onClick={() => onSelectJob(job)}
                        title="View Execution Trace & Logs"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-surface)',
                          color: '#818cf8',
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={13} />
                        Trace
                      </button>

                      {job.status === 'FAILED' && (
                        <button
                          onClick={() => onRetryJob(job.id)}
                          title="Manual Retry Job"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            background: 'rgba(245, 158, 11, 0.1)',
                            color: '#fbbf24',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          <RotateCcw size={13} />
                          Retry
                        </button>
                      )}

                      {(job.status === 'QUEUED' || job.status === 'RUNNING' || job.status === 'SCHEDULED') && (
                        <button
                          onClick={() => onCancelJob(job.id)}
                          title="Cancel Execution"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                            background: 'rgba(244, 63, 94, 0.1)',
                            color: '#fb7185',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          <XCircle size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
