package com.taskforge.domain.dto;

import java.util.Map;

public class MetricsSummaryResponse {

    private long totalJobs;
    private long queuedJobs;
    private long runningJobs;
    private long completedJobs;
    private long failedJobs;
    private long retryingJobs;
    private long activeWorkers;
    private double successRatePercent;
    private Map<String, Long> taskTypeDistribution;

    public MetricsSummaryResponse() {}

    public long getTotalJobs() { return totalJobs; }
    public void setTotalJobs(long totalJobs) { this.totalJobs = totalJobs; }

    public long getQueuedJobs() { return queuedJobs; }
    public void setQueuedJobs(long queuedJobs) { this.queuedJobs = queuedJobs; }

    public long getRunningJobs() { return runningJobs; }
    public void setRunningJobs(long runningJobs) { this.runningJobs = runningJobs; }

    public long getCompletedJobs() { return completedJobs; }
    public void setCompletedJobs(long completedJobs) { this.completedJobs = completedJobs; }

    public long getFailedJobs() { return failedJobs; }
    public void setFailedJobs(long failedJobs) { this.failedJobs = failedJobs; }

    public long getRetryingJobs() { return retryingJobs; }
    public void setRetryingJobs(long retryingJobs) { this.retryingJobs = retryingJobs; }

    public long getActiveWorkers() { return activeWorkers; }
    public void setActiveWorkers(long activeWorkers) { this.activeWorkers = activeWorkers; }

    public double getSuccessRatePercent() { return successRatePercent; }
    public void setSuccessRatePercent(double successRatePercent) { this.successRatePercent = successRatePercent; }

    public Map<String, Long> getTaskTypeDistribution() { return taskTypeDistribution; }
    public void setTaskTypeDistribution(Map<String, Long> taskTypeDistribution) { this.taskTypeDistribution = taskTypeDistribution; }
}
