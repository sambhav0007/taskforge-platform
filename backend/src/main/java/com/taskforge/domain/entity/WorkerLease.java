package com.taskforge.domain.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "worker_leases")
public class WorkerLease {

    @Id
    @Column(name = "worker_id", nullable = false)
    private String workerId;

    @Column(nullable = false)
    private String hostname;

    @Column(name = "heartbeat_at", nullable = false)
    private Instant heartbeatAt = Instant.now();

    @Column(nullable = false)
    private String status = "HEALTHY";

    @Column(name = "active_jobs_count", nullable = false)
    private Integer activeJobsCount = 0;

    public WorkerLease() {}

    public WorkerLease(String workerId, String hostname) {
        this.workerId = workerId;
        this.hostname = hostname;
        this.heartbeatAt = Instant.now();
        this.status = "HEALTHY";
        this.activeJobsCount = 0;
    }

    public String getWorkerId() { return workerId; }
    public void setWorkerId(String workerId) { this.workerId = workerId; }

    public String getHostname() { return hostname; }
    public void setHostname(String hostname) { this.hostname = hostname; }

    public Instant getHeartbeatAt() { return heartbeatAt; }
    public void setHeartbeatAt(Instant heartbeatAt) { this.heartbeatAt = heartbeatAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getActiveJobsCount() { return activeJobsCount; }
    public void setActiveJobsCount(Integer activeJobsCount) { this.activeJobsCount = activeJobsCount; }
}
