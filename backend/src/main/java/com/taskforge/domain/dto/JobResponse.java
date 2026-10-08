package com.taskforge.domain.dto;

import com.taskforge.domain.entity.Job;
import com.taskforge.domain.enums.JobStatus;

import java.time.Instant;
import java.util.UUID;

public class JobResponse {

    private UUID id;
    private UUID tenantId;
    private String name;
    private String taskType;
    private String payload;
    private JobStatus status;
    private Integer priority;
    private Instant scheduledAt;
    private Instant createdAt;
    private Instant updatedAt;
    private Integer attemptNumber;
    private Integer maxRetries;
    private String workerId;
    private Instant leaseExpiresAt;
    private Long claimGeneration;
    private Long version;

    public static JobResponse fromEntity(Job job) {
        JobResponse dto = new JobResponse();
        dto.setId(job.getId());
        dto.setTenantId(job.getTenantId());
        dto.setName(job.getName());
        dto.setTaskType(job.getTaskType());
        dto.setPayload(job.getPayload());
        dto.setStatus(job.getStatus());
        dto.setPriority(job.getPriority());
        dto.setScheduledAt(job.getScheduledAt());
        dto.setCreatedAt(job.getCreatedAt());
        dto.setUpdatedAt(job.getUpdatedAt());
        dto.setAttemptNumber(job.getAttemptNumber());
        dto.setMaxRetries(job.getMaxRetries());
        dto.setWorkerId(job.getWorkerId());
        dto.setLeaseExpiresAt(job.getLeaseExpiresAt());
        dto.setClaimGeneration(job.getClaimGeneration());
        dto.setVersion(job.getVersion());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getTenantId() { return tenantId; }
    public void setTenantId(UUID tenantId) { this.tenantId = tenantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTaskType() { return taskType; }
    public void setTaskType(String taskType) { this.taskType = taskType; }

    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }

    public JobStatus getStatus() { return status; }
    public void setStatus(JobStatus status) { this.status = status; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }

    public Instant getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(Instant scheduledAt) { this.scheduledAt = scheduledAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public Integer getAttemptNumber() { return attemptNumber; }
    public void setAttemptNumber(Integer attemptNumber) { this.attemptNumber = attemptNumber; }

    public Integer getMaxRetries() { return maxRetries; }
    public void setMaxRetries(Integer maxRetries) { this.maxRetries = maxRetries; }

    public String getWorkerId() { return workerId; }
    public void setWorkerId(String workerId) { this.workerId = workerId; }

    public Instant getLeaseExpiresAt() { return leaseExpiresAt; }
    public void setLeaseExpiresAt(Instant leaseExpiresAt) { this.leaseExpiresAt = leaseExpiresAt; }

    public Long getClaimGeneration() { return claimGeneration; }
    public void setClaimGeneration(Long claimGeneration) { this.claimGeneration = claimGeneration; }

    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
}
