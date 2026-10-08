package com.taskforge.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskforge.domain.dto.CreateJobRequest;
import com.taskforge.domain.entity.Job;
import com.taskforge.domain.entity.OutboxEvent;
import com.taskforge.domain.enums.JobStatus;
import com.taskforge.handler.JobHandlerRegistry;
import com.taskforge.repository.JobRepository;
import com.taskforge.repository.OutboxEventRepository;
import com.taskforge.security.TenantContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class JobSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(JobSchedulerService.class);

    private final JobRepository jobRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final JobHandlerRegistry jobHandlerRegistry;
    private final TenantQuotaService tenantQuotaService;
    private final ObjectMapper objectMapper;

    @Value("${taskforge.worker.id:worker-local-1}")
    private String workerId;

    @Value("${taskforge.lease.duration-seconds:30}")
    private long leaseDurationSeconds;

    public JobSchedulerService(JobRepository jobRepository,
                               OutboxEventRepository outboxEventRepository,
                               JobHandlerRegistry jobHandlerRegistry,
                               TenantQuotaService tenantQuotaService,
                               ObjectMapper objectMapper) {
        this.jobRepository = jobRepository;
        this.outboxEventRepository = outboxEventRepository;
        this.jobHandlerRegistry = jobHandlerRegistry;
        this.tenantQuotaService = tenantQuotaService;
        this.objectMapper = objectMapper;
    }

    // TOPIC 5: Transactional Outbox Pattern & Dual Write Prevention
    // In ONE database transaction, write both the Job record and the OutboxEvent record!
    @Transactional
    public Job submitJob(CreateJobRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            tenantId = UUID.fromString("00000000-0000-0000-0000-000000000001"); // Default fallback demo tenant
        }

        // Validate Task Handler registration (Plugin Architecture - Topic 7)
        if (!jobHandlerRegistry.hasHandler(request.getTaskType())) {
            throw new IllegalArgumentException("Unsupported task type: " + request.getTaskType());
        }

        // Validate Tenant Quotas & Rate Limits (Topic 9)
        tenantQuotaService.checkQuotaAndRateLimit(tenantId);

        Job job = new Job();
        job.setTenantId(tenantId);
        job.setName(request.getName());
        job.setTaskType(request.getTaskType());
        try {
            job.setPayload(objectMapper.writeValueAsString(request.getPayload()));
        } catch (Exception e) {
            job.setPayload("{}");
        }
        job.setPriority(request.getPriority() != null ? request.getPriority() : 5);
        job.setMaxRetries(request.getMaxRetries() != null ? request.getMaxRetries() : 3);
        
        Instant scheduledTime = request.getScheduledAt() != null ? request.getScheduledAt() : Instant.now();
        job.setScheduledAt(scheduledTime);

        // Determine initial status: QUEUED if ready immediately, SCHEDULED if delayed
        if (scheduledTime.isBefore(Instant.now().plusMillis(100))) {
            job.setStatus(JobStatus.QUEUED);
        } else {
            job.setStatus(JobStatus.SCHEDULED);
        }

        Job savedJob = jobRepository.save(job);

        // Write Outbox Event inside the SAME transaction boundary!
        createOutboxEvent("JOB_CREATED", savedJob);

        log.info("Job submitted successfully [ID: {}, TaskType: {}, Status: {}]", savedJob.getId(), savedJob.getTaskType(), savedJob.getStatus());
        return savedJob;
    }

    // Move ready SCHEDULED jobs into QUEUED state
    @Scheduled(fixedDelay = 2000)
    @Transactional
    public void processScheduledJobs() {
        List<Job> pending = jobRepository.findPendingScheduledJobs(Instant.now());
        for (Job job : pending) {
            job.setStatus(JobStatus.QUEUED);
            jobRepository.save(job);
            createOutboxEvent("JOB_QUEUED", job);
        }
        
        // Move RETRY_WAIT jobs back to QUEUED
        List<Job> retries = jobRepository.findRetryWaitJobsReady(Instant.now());
        for (Job job : retries) {
            job.setStatus(JobStatus.QUEUED);
            jobRepository.save(job);
            createOutboxEvent("JOB_QUEUED", job);
        }
    }

    // TOPIC 3: Database Concurrency & Pessimistic Locking FOR UPDATE SKIP LOCKED
    // Schedulers atomically claim queued jobs, assign leases and increment fencing token generation (Topic 4)
    @Scheduled(fixedDelay = 1000)
    @Transactional
    public void claimAndDispatchJobs() {
        Instant now = Instant.now();
        List<Job> eligibleJobs;
        try {
            eligibleJobs = jobRepository.claimEligibleJobsSkipLockedNative(now, 10);
        } catch (Exception e) {
            eligibleJobs = jobRepository.claimEligibleJobsWithPessimisticLock(now, PageRequest.of(0, 10));
        }

        for (Job job : eligibleJobs) {
            // Claiming job: update status, set lease duration, increment fencing token (claim_generation)
            job.setStatus(JobStatus.RUNNING);
            job.setWorkerId(workerId);
            job.setLeaseExpiresAt(now.plusSeconds(leaseDurationSeconds));
            job.setClaimGeneration(job.getClaimGeneration() + 1); // Fencing token increment
            job.setAttemptNumber(job.getAttemptNumber() + 1);

            jobRepository.save(job);

            // Emit Outbox event for Kafka worker dispatch
            createOutboxEvent("JOB_CLAIMED", job);
            log.info("Claimed job [ID: {}, Generation: {}, Worker: {}]", job.getId(), job.getClaimGeneration(), workerId);
        }
    }

    private void createOutboxEvent(String eventType, Job job) {
        try {
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("jobId", job.getId().toString());
            eventData.put("tenantId", job.getTenantId().toString());
            eventData.put("taskType", job.getTaskType());
            eventData.put("payload", job.getPayload());
            eventData.put("claimGeneration", job.getClaimGeneration());
            eventData.put("workerId", job.getWorkerId());
            eventData.put("attemptNumber", job.getAttemptNumber());

            OutboxEvent outboxEvent = new OutboxEvent(
                eventType,
                job.getId(),
                objectMapper.writeValueAsString(eventData)
            );
            outboxEventRepository.save(outboxEvent);
        } catch (Exception e) {
            log.error("Failed to serialize outbox event payload for job {}", job.getId(), e);
        }
    }
}
