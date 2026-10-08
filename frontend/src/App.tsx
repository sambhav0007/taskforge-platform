import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsOverview } from './components/MetricsOverview';
import { JobsTable } from './components/JobsTable';
import { NewJobModal } from './components/NewJobModal';
import { ExecutionDrawer } from './components/ExecutionDrawer';
import { SchedulesTab } from './components/SchedulesTab';
import { WorkersTab } from './components/WorkersTab';

import type {
  Job,
  JobStatus,
  JobSchedule,
  WorkerLease,
  MetricsSummary,
  CreateJobDto,
  CreateScheduleDto,
} from './types/taskforge';

import {
  fetchMetrics,
  fetchJobs,
  fetchSchedules,
  fetchWorkers,
  fetchTaskTypes,
  submitJob,
  retryJob,
  cancelJob,
  createSchedule,
  loginDemoAdmin,
} from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'schedules' | 'workers'>('jobs');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'ALL'>('ALL');
  
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [schedules, setSchedules] = useState<JobSchedule[]>([]);
  const [workers, setWorkers] = useState<WorkerLease[]>([]);
  const [taskTypes, setTaskTypes] = useState<string[]>(['CSV_REPORT', 'EMAIL_NOTIFICATION', 'DATA_CLEANUP', 'IMAGE_PROCESSING']);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isNewJobOpen, setIsNewJobOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [m, j, s, w, tt] = await Promise.all([
        fetchMetrics(),
        fetchJobs(statusFilter === 'ALL' ? undefined : statusFilter),
        fetchSchedules(),
        fetchWorkers(),
        fetchTaskTypes()
      ]);
      setMetrics(m);
      setJobs(j);
      setSchedules(s);
      setWorkers(w);
      if (tt && tt.length > 0) setTaskTypes(tt);
    } catch (e) {
      console.error('Failed loading data', e);
    } finally {
      setIsRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      loadData();
    }, 4000);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleSubmitJob = async (dto: CreateJobDto) => {
    await submitJob(dto);
    await loadData();
  };

  const handleRetryJob = async (id: string) => {
    await retryJob(id);
    await loadData();
  };

  const handleCancelJob = async (id: string) => {
    await cancelJob(id);
    await loadData();
  };

  const handleCreateSchedule = async (dto: CreateScheduleDto) => {
    await createSchedule(dto);
    await loadData();
  };

  const handleLoginDemo = async () => {
    await loginDemoAdmin();
    await loadData();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewJob={() => setIsNewJobOpen(true)}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
        onLoginDemo={handleLoginDemo}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '0 24px 40px 24px', flex: 1 }}>
        
        {/* Real-time Metrics Banner */}
        <MetricsOverview metrics={metrics} />

        {/* Dynamic View Tabs */}
        {activeTab === 'jobs' && (
          <JobsTable
            jobs={jobs}
            onSelectJob={(job) => setSelectedJob(job)}
            onRetryJob={handleRetryJob}
            onCancelJob={handleCancelJob}
            activeStatusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        )}

        {activeTab === 'schedules' && (
          <SchedulesTab
            schedules={schedules}
            onCreateSchedule={handleCreateSchedule}
            taskTypes={taskTypes}
          />
        )}

        {activeTab === 'workers' && (
          <WorkersTab workers={workers} />
        )}

      </main>

      {/* Submit Job Dialog */}
      <NewJobModal
        isOpen={isNewJobOpen}
        onClose={() => setIsNewJobOpen(false)}
        onSubmit={handleSubmitJob}
        taskTypes={taskTypes}
      />

      {/* Job Execution Drawer Trace */}
      <ExecutionDrawer
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />

    </div>
  );
}

export default App;
