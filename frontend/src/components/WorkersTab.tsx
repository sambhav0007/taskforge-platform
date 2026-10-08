import type { WorkerLease } from '../types/taskforge';
import { Server, Activity, ShieldCheck } from 'lucide-react';

interface WorkersTabProps {
  workers: WorkerLease[];
}

export const WorkersTab: React.FC<WorkersTabProps> = ({ workers }) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>Active Worker Node Cluster</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Distributed workers competing for jobs with FOR UPDATE SKIP LOCKED and heartbeat leases</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600 }}>
          <Activity size={15} />
          {workers.length} Healthy Worker Nodes
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {workers.map((worker) => (
          <div key={worker.workerId} className="glass-panel" style={{ padding: '20px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Server size={18} color="#06b6d4" />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    {worker.workerId}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    IP: {worker.ipAddress}
                  </div>
                </div>
              </div>

              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: '#34d399', padding: '3px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <ShieldCheck size={12} /> Healthy
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '0.78rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Active Leases</span>
                <strong style={{ color: '#818cf8', fontSize: '1.05rem', fontWeight: 700 }}>{worker.activeJobsCount} Jobs</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Last Heartbeat</span>
                <strong style={{ color: '#ffffff' }}>{new Date(worker.heartbeatAt).toLocaleTimeString()}</strong>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
