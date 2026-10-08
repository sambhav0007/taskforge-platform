import type { Job, JobExecution, JobSchedule, WorkerLease, MetricsSummary, CreateJobDto, CreateScheduleDto, JobStatus } from '../types/taskforge';

const API_BASE_URL = 'http://localhost:8080/api/v1';

let authToken = localStorage.getItem('taskforge_token') || '';

export const setAuthToken = (token: string) => {
  authToken = token;
  if (token) {
    localStorage.setItem('taskforge_token', token);
  } else {
    localStorage.removeItem('taskforge_token');
  }
};

export const getAuthToken = () => authToken;

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

// Mock memory state for instant preview / offline fallback
const mockJobs: Job[] = [
  {
    id: '4f29a081-3c82-419b-a312-d81a94d01b12',
    tenantId: '00000000-0000-0000-0000-000000000001',
    taskType: 'DATA_CLEANUP',
    status: 'RUNNING',
    priority: 8,
    payload: JSON.stringify({ retentionDays: 30, targetTable: 'audit_logs' }),
    workerId: 'worker-node-alpha-1',
    claimGeneration: 14,
    scheduledAt: new Date(Date.now() - 120000).toISOString(),
    leaseExpiresAt: new Date(Date.now() + 25000).toISOString(),
    attemptNumber: 1,
    maxRetries: 3,
    createdAt: new Date(Date.now() - 120000).toISOString(),
    updatedAt: new Date(Date.now() - 5000).toISOString(),
  },
  {
    id: '9c8812e3-11aa-4921-9d10-82711ab4112e',
    tenantId: '00000000-0000-0000-0000-000000000001',
    taskType: 'CSV_REPORT',
    status: 'COMPLETED',
    priority: 5,
    payload: JSON.stringify({ reportType: 'MONTHLY_FINANCIAL', dateRange: '2026-09' }),
    workerId: 'worker-node-beta-2',
    claimGeneration: 3,
    scheduledAt: new Date(Date.now() - 600000).toISOString(),
    leaseExpiresAt: undefined,
    attemptNumber: 1,
    maxRetries: 3,
    createdAt: new Date(Date.now() - 600000).toISOString(),
    updatedAt: new Date(Date.now() - 580000).toISOString(),
  },
  {
    id: 'b71239cd-0012-4211-bb01-e9481238910d',
    tenantId: '00000000-0000-0000-0000-000000000001',
    taskType: 'EMAIL_NOTIFICATION',
    status: 'QUEUED',
    priority: 9,
    payload: JSON.stringify({ recipient: 'admin@enterprise.io', template: 'CRITICAL_ALERT' }),
    claimGeneration: 1,
    scheduledAt: new Date(Date.now() - 10000).toISOString(),
    attemptNumber: 1,
    maxRetries: 5,
    createdAt: new Date(Date.now() - 10000).toISOString(),
    updatedAt: new Date(Date.now() - 10000).toISOString(),
  },
  {
    id: 'e81239aa-44bb-4c22-8172-871291823901',
    tenantId: '00000000-0000-0000-0000-000000000001',
    taskType: 'IMAGE_PROCESSING',
    status: 'RETRY_WAIT',
    priority: 3,
    payload: JSON.stringify({ sourceUrl: 'https://images.unsplash.com/sample.jpg', format: 'WEBP' }),
    workerId: 'worker-node-alpha-1',
    claimGeneration: 2,
    scheduledAt: new Date(Date.now() + 15000).toISOString(),
    attemptNumber: 2,
    maxRetries: 3,
    createdAt: new Date(Date.now() - 300000).toISOString(),
    updatedAt: new Date(Date.now() - 40000).toISOString(),
  },
  {
    id: 'f9012384-9911-4771-a012-749129048123',
    tenantId: '00000000-0000-0000-0000-000000000001',
    taskType: 'DATA_CLEANUP',
    status: 'FAILED',
    priority: 4,
    payload: JSON.stringify({ retentionDays: 90, targetTable: 'temp_sessions' }),
    workerId: 'worker-node-gamma-3',
    claimGeneration: 3,
    scheduledAt: new Date(Date.now() - 900000).toISOString(),
    attemptNumber: 3,
    maxRetries: 3,
    createdAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date(Date.now() - 850000).toISOString(),
  }
];

const mockExecutions: Record<string, JobExecution[]> = {
  '4f29a081-3c82-419b-a312-d81a94d01b12': [
    {
      id: 'exec-1',
      jobId: '4f29a081-3c82-419b-a312-d81a94d01b12',
      workerId: 'worker-node-alpha-1',
      claimGeneration: 14,
      status: 'RUNNING',
      idempotencyKey: '4f29a081-3c82-419b-a312-d81a94d01b12-gen-14',
      executionLogs: '[LOG] Claimed job with fencing token 14\n[LOG] Initializing retention purge for audit_logs...\n[LOG] Scanning index partitions...',
      startedAt: new Date(Date.now() - 10000).toISOString(),
    }
  ],
  '9c8812e3-11aa-4921-9d10-82711ab4112e': [
    {
      id: 'exec-2',
      jobId: '9c8812e3-11aa-4921-9d10-82711ab4112e',
      workerId: 'worker-node-beta-2',
      claimGeneration: 3,
      status: 'SUCCESS',
      idempotencyKey: '9c8812e3-11aa-4921-9d10-82711ab4112e-gen-3',
      resultSummary: 'Report generated successfully: 485 pages, 14.2 MB PDF',
      executionLogs: '[LOG] Starting CSV report compilation...\n[LOG] Fetched 14,200 transactions for period 2026-09\n[LOG] Generated PDF artifact: /reports/2026-09-monthly.pdf\n[LOG] Execution completed in 1840ms',
      startedAt: new Date(Date.now() - 600000).toISOString(),
      completedAt: new Date(Date.now() - 580000).toISOString(),
    }
  ],
  'f9012384-9911-4771-a012-749129048123': [
    {
      id: 'exec-3',
      jobId: 'f9012384-9911-4771-a012-749129048123',
      workerId: 'worker-node-gamma-3',
      claimGeneration: 3,
      status: 'FAILED',
      idempotencyKey: 'f9012384-9911-4771-a012-749129048123-gen-3',
      errorMessage: 'DatabaseLockException: Connection timeout while acquiring exclusive lock on temp_sessions table',
      executionLogs: '[LOG] Attempting purge...\n[ERROR] Table locked by active transaction pid=48102\n[ERROR] Maximum retries (3/3) exceeded. Job failed permanently.',
      startedAt: new Date(Date.now() - 860000).toISOString(),
      completedAt: new Date(Date.now() - 850000).toISOString(),
    }
  ]
};

const mockSchedules: JobSchedule[] = [
  {
    id: 'sched-1',
    tenantId: '00000000-0000-0000-0000-000000000001',
    name: 'Nightly Audit Purge',
    taskType: 'DATA_CLEANUP',
    cronExpression: '0 0 2 * * ?',
    payload: JSON.stringify({ retentionDays: 30, targetTable: 'audit_logs' }),
    priority: 5,
    maxRetries: 3,
    enabled: true,
    lastRunAt: new Date(Date.now() - 86400000).toISOString(),
    nextRunAt: new Date(Date.now() + 43200000).toISOString(),
  },
  {
    id: 'sched-2',
    tenantId: '00000000-0000-0000-0000-000000000001',
    name: 'Hourly Health Notification',
    taskType: 'EMAIL_NOTIFICATION',
    cronExpression: '0 0 * * * ?',
    payload: JSON.stringify({ recipient: 'ops@company.com', template: 'HOURLY_DIGEST' }),
    priority: 8,
    maxRetries: 2,
    enabled: true,
    lastRunAt: new Date(Date.now() - 3600000).toISOString(),
    nextRunAt: new Date(Date.now() + 1800000).toISOString(),
  }
];

const mockWorkers: WorkerLease[] = [
  { workerId: 'worker-node-alpha-1', ipAddress: '10.0.4.12', activeJobsCount: 2, heartbeatAt: new Date().toISOString() },
  { workerId: 'worker-node-beta-2', ipAddress: '10.0.4.15', activeJobsCount: 1, heartbeatAt: new Date(Date.now() - 4000).toISOString() },
  { workerId: 'worker-node-gamma-3', ipAddress: '10.0.4.18', activeJobsCount: 0, heartbeatAt: new Date(Date.now() - 8000).toISOString() }
];

export async function fetchMetrics(): Promise<MetricsSummary> {
  try {
    const res = await fetch(`${API_BASE_URL}/metrics/dashboard`, { headers: getHeaders() });
    if (res.ok) return await res.json();
  } catch (e) {
    // fallback
  }

  const totalJobs = mockJobs.length;
  const queuedJobs = mockJobs.filter(j => j.status === 'QUEUED').length;
  const runningJobs = mockJobs.filter(j => j.status === 'RUNNING').length;
  const completedJobs = mockJobs.filter(j => j.status === 'COMPLETED').length;
  const failedJobs = mockJobs.filter(j => j.status === 'FAILED').length;
  const retryingJobs = mockJobs.filter(j => j.status === 'RETRY_WAIT').length;
  
  const dist: Record<string, number> = {};
  mockJobs.forEach(j => { dist[j.taskType] = (dist[j.taskType] || 0) + 1; });

  return {
    totalJobs,
    queuedJobs,
    runningJobs,
    completedJobs,
    failedJobs,
    retryingJobs,
    activeWorkers: mockWorkers.length,
    successRatePercent: 80.0,
    taskTypeDistribution: dist
  };
}

export async function fetchJobs(status?: JobStatus): Promise<Job[]> {
  try {
    const url = status ? `${API_BASE_URL}/jobs?status=${status}` : `${API_BASE_URL}/jobs`;
    const res = await fetch(url, { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      return data.content || data;
    }
  } catch (e) {
    // fallback
  }

  if (status) {
    return mockJobs.filter(j => j.status === status);
  }
  return [...mockJobs];
}

export async function submitJob(dto: CreateJobDto): Promise<Job> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dto),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // fallback
  }

  const newJob: Job = {
    id: `job-${Date.now()}`,
    tenantId: '00000000-0000-0000-0000-000000000001',
    taskType: dto.taskType,
    status: 'QUEUED',
    priority: dto.priority || 5,
    payload: JSON.stringify(dto.payload),
    claimGeneration: 1,
    scheduledAt: new Date(Date.now() + (dto.delaySeconds || 0) * 1000).toISOString(),
    attemptNumber: 1,
    maxRetries: dto.maxRetries || 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockJobs.unshift(newJob);
  return newJob;
}

export async function retryJob(id: string): Promise<Job> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}/retry`, { method: 'POST', headers: getHeaders() });
    if (res.ok) return await res.json();
  } catch (e) {
    // fallback
  }

  const job = mockJobs.find(j => j.id === id);
  if (job) {
    job.status = 'QUEUED';
    job.attemptNumber = 0;
    job.scheduledAt = new Date().toISOString();
  }
  return job!;
}

export async function cancelJob(id: string): Promise<Job> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}/cancel`, { method: 'POST', headers: getHeaders() });
    if (res.ok) return await res.json();
  } catch (e) {
    // fallback
  }

  const job = mockJobs.find(j => j.id === id);
  if (job) {
    job.status = 'CANCELLED';
  }
  return job!;
}

export async function fetchExecutions(jobId: string): Promise<JobExecution[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/executions`, { headers: getHeaders() });
    if (res.ok) return await res.json();
  } catch (e) {
    // fallback
  }

  return mockExecutions[jobId] || [
    {
      id: `exec-${Date.now()}`,
      jobId,
      workerId: 'worker-node-alpha-1',
      claimGeneration: 1,
      status: 'SUCCESS',
      idempotencyKey: `${jobId}-gen-1`,
      executionLogs: '[LOG] Execution completed with default mock log trace.\n[LOG] Fencing token generation verified.',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    }
  ];
}

export async function fetchTaskTypes(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/task-types`, { headers: getHeaders() });
    if (res.ok) return await res.json();
  } catch (e) {
    // fallback
  }
  return ['CSV_REPORT', 'EMAIL_NOTIFICATION', 'DATA_CLEANUP', 'IMAGE_PROCESSING'];
}

export async function fetchSchedules(): Promise<JobSchedule[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/schedules`, { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      return data.content || data;
    }
  } catch (e) {
    // fallback
  }
  return mockSchedules;
}

export async function createSchedule(dto: CreateScheduleDto): Promise<JobSchedule> {
  try {
    const res = await fetch(`${API_BASE_URL}/schedules`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dto),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // fallback
  }

  const newSched: JobSchedule = {
    id: `sched-${Date.now()}`,
    tenantId: '00000000-0000-0000-0000-000000000001',
    name: dto.name,
    taskType: dto.taskType,
    cronExpression: dto.cronExpression,
    payload: JSON.stringify(dto.payload),
    priority: dto.priority || 5,
    maxRetries: dto.maxRetries || 3,
    enabled: true,
    nextRunAt: new Date(Date.now() + 3600000).toISOString(),
  };
  mockSchedules.unshift(newSched);
  return newSched;
}

export async function fetchWorkers(): Promise<WorkerLease[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/workers`, { headers: getHeaders() });
    if (res.ok) return await res.json();
  } catch (e) {
    // fallback
  }
  return mockWorkers;
}

export async function loginDemoAdmin(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'password123' })
    });
    if (res.ok) {
      const data = await res.json();
      setAuthToken(data.token);
      return true;
    }
  } catch (e) {
    // fallback
  }
  setAuthToken('mock-jwt-admin-token-taskforge');
  return true;
}
