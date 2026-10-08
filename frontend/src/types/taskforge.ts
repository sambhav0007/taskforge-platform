export type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'RETRY_WAIT' | 'CANCELLED' | 'SCHEDULED';
export type JobPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface Job {
  id: string;
  tenantId: string;
  taskType: string;
  status: JobStatus;
  priority: number;
  payload: string;
  workerId?: string;
  claimGeneration: number;
  scheduledAt: string;
  leaseExpiresAt?: string;
  attemptNumber: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobExecution {
  id: string;
  jobId: string;
  workerId: string;
  claimGeneration: number;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'FENCED_OUT';
  idempotencyKey: string;
  resultSummary?: string;
  errorMessage?: string;
  executionLogs?: string;
  startedAt: string;
  completedAt?: string;
}

export interface JobSchedule {
  id: string;
  tenantId: string;
  name: string;
  taskType: string;
  cronExpression: string;
  payload: string;
  priority: number;
  maxRetries: number;
  enabled: boolean;
  lastRunAt?: string;
  nextRunAt: string;
}

export interface WorkerLease {
  workerId: string;
  ipAddress: string;
  activeJobsCount: number;
  heartbeatAt: string;
}

export interface MetricsSummary {
  totalJobs: number;
  queuedJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  retryingJobs: number;
  activeWorkers: number;
  successRatePercent: number;
  taskTypeDistribution: Record<string, number>;
}

export interface CreateJobDto {
  taskType: string;
  payload: Record<string, any>;
  priority?: number;
  maxRetries?: number;
  delaySeconds?: number;
}

export interface CreateScheduleDto {
  name: string;
  taskType: string;
  cronExpression: string;
  payload: Record<string, any>;
  priority?: number;
  maxRetries?: number;
}
