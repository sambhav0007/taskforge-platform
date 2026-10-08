import type { MetricsSummary } from '../types/taskforge';
import { Layers, PlayCircle, CheckCircle2, AlertTriangle, RefreshCcw, Server, PieChart } from 'lucide-react';

interface MetricsOverviewProps {
  metrics: MetricsSummary | null;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  if (!metrics) return null;

  const cards = [
    {
      title: 'Total Jobs',
      value: metrics.totalJobs,
      icon: <Layers size={20} color="#818cf8" />,
      gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.03))',
      borderColor: 'rgba(99, 102, 241, 0.3)',
      subtitle: 'Across active tenant'
    },
    {
      title: 'Running Tasks',
      value: metrics.runningJobs,
      icon: <PlayCircle size={20} color="#38bdf8" />,
      gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.03))',
      borderColor: 'rgba(6, 182, 212, 0.3)',
      subtitle: 'With worker leases'
    },
    {
      title: 'Completed',
      value: metrics.completedJobs,
      icon: <CheckCircle2 size={20} color="#34d399" />,
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.03))',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      subtitle: 'Processed cleanly'
    },
    {
      title: 'Failed',
      value: metrics.failedJobs,
      icon: <AlertTriangle size={20} color="#fb7185" />,
      gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(244, 63, 94, 0.03))',
      borderColor: 'rgba(244, 63, 94, 0.3)',
      subtitle: 'Exceeded max retries'
    },
    {
      title: 'Retrying / Waiting',
      value: metrics.retryingJobs + metrics.queuedJobs,
      icon: <RefreshCcw size={20} color="#fbbf24" />,
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.03))',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      subtitle: `${metrics.queuedJobs} queued, ${metrics.retryingJobs} backoff`
    },
  ];

  const taskTypes = Object.entries(metrics.taskTypeDistribution || {});

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      
      {cards.map((card, idx) => (
        <div key={idx} className="glass-panel" style={{ padding: '18px 20px', background: card.gradient, borderColor: card.borderColor }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>{card.title}</span>
            {card.icon}
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            {card.value}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{card.subtitle}</div>
        </div>
      ))}

      {/* Cluster & Success Rate Summary Card */}
      <div className="glass-panel" style={{ padding: '18px 20px', gridColumn: 'span 2', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} color="#06b6d4" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>Cluster Telemetry</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#34d399' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
            {metrics.activeWorkers} Active Nodes
          </div>
        </div>

        {/* Success Rate Bar */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Execution Success Rate</span>
            <span style={{ fontWeight: 700, color: metrics.successRatePercent > 80 ? '#34d399' : '#fbbf24' }}>
              {metrics.successRatePercent}%
            </span>
          </div>
          <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${metrics.successRatePercent}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Task Type mini distribution */}
        {taskTypes.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
              <PieChart size={12} />
              <span>Task Types Distribution</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {taskTypes.map(([type, count]) => (
                <div key={type} style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <strong style={{ color: '#818cf8' }}>{type}:</strong> {count}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
