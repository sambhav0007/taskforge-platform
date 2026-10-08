import React from 'react';
import { Cpu, Activity, Clock, ShieldCheck, RefreshCw, PlusCircle, Terminal } from 'lucide-react';
import { getAuthToken } from '../services/api';

interface NavbarProps {
  activeTab: 'jobs' | 'schedules' | 'workers';
  setActiveTab: (tab: 'jobs' | 'schedules' | 'workers') => void;
  onOpenNewJob: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onLoginDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewJob,
  onRefresh,
  isRefreshing,
  onLoginDemo,
}) => {
  const token = getAuthToken();

  return (
    <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 50, borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, marginBottom: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)' }}>
            <Cpu size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #ffffff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                TaskForge
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(129, 140, 248, 0.3)' }}>
                v1.0 DISTRIBUTED
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Job Orchestration & Worker Leasing Engine</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('jobs')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === 'jobs' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'jobs' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeTab === 'jobs' ? '0 0 12px var(--primary-glow)' : 'none'
            }}
          >
            <Activity size={16} />
            Jobs & Pipeline
          </button>

          <button
            onClick={() => setActiveTab('schedules')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === 'schedules' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'schedules' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeTab === 'schedules' ? '0 0 12px var(--primary-glow)' : 'none'
            }}
          >
            <Clock size={16} />
            Cron Schedules
          </button>

          <button
            onClick={() => setActiveTab('workers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === 'workers' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'workers' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeTab === 'workers' ? '0 0 12px var(--primary-glow)' : 'none'
            }}
          >
            <Terminal size={16} />
            Worker Cluster
          </button>
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onRefresh}
            title="Refresh Data"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-surface)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin' : ''} style={{ animation: isRefreshing ? 'spin-slow 1s linear infinite' : 'none' }} />
            Sync
          </button>

          <button
            onClick={onOpenNewJob}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(99, 102, 241, 0.4)',
              transition: 'transform 0.15s ease'
            }}
          >
            <PlusCircle size={16} />
            Submit Job
          </button>

          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.78rem', fontWeight: 600 }}>
              <ShieldCheck size={14} />
              Authenticated (Admin)
            </div>
          ) : (
            <button
              onClick={onLoginDemo}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                background: 'rgba(99, 102, 241, 0.1)',
                color: '#818cf8',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Demo Auth
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
