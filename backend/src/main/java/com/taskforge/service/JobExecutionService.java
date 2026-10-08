package com.taskforge.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskforge.domain.entity.Job;
import com.taskforge.domain.entity.JobExecution;
import com.taskforge.domain.enums.ExecutionStatus;
import com.taskforge.domain.enums.JobStatus;
import com.taskforge.handler.JobHandler;
import com.taskforge.handler.JobHandlerRegistry;
import com.taskforge.handler.JobResult;
import com.taskforge.repository.JobExecutionRepository;
import com.taskforge.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class JobExecutionService {

    private static final Logger log = LoggerFactory.getLogger(JobExecutionService.class);

    private final JobRepository jobRepository;
    private final JobExecutionRepository jobExecutionRepository;
    private final JobHandlerRegistry jobHandlerRegistry;
    private final ObjectMapper objectMapper;

    // TOPIC 1: Java Concurrency and Virtual Threads
    // Executors.newVirtualThreadPerTaskExecutor() for scalable lightweight thread execution of blocking I/O tasks
    private final ExecutorService executor = Executors.newCachedThreadPool();

    @Value("${taskforge.lease.duration-seconds:30}")
    private long leaseDurationSeconds;

    public JobExecutionService(JobRepository jobRepository,
                               JobExecutionRepository jobExecutionRepository,
                               JobHandlerRegistry jobHandlerRegistry,
                               ObjectMapper objectMapper) {
        this.jobRepository = jobRepository;
        this.jobExecutionRepository = jobExecutionRepository;
        this.jobHandlerRegistry = jobHandlerRegistry;
        this.objectMapper = objectMapper;
    }

    public void processJobEvent(UUID jobId, Long claimGeneration, String workerId, String taskType, String payloadJson) {
        String idempotencyKey = jobId + "-gen-" + claimGeneration;

        // TOPIC 2: Deduplication and Idempotency Key Validation
        if (jobExecutionRepository.existsByIdempotencyKey(idempotencyKey)) {
            log.info("Duplicate job execution event ignored [IdempotencyKey: {}]", idempotencyKey);
            return;
        }

        executor.submit(() -> {
            try {
                executeWithLeaseAndFencing(jobId, claimGeneration, workerId, taskType, payloadJson, idempotencyKey);
            } catch (Exception ex) {
                log.error("Unhandled execution exception for Job ID {}", jobId, ex);
            }
        });
    }

    @Transactional
    public void executeWithLeaseAndFencing(UUID jobId, Long claimGeneration, String workerId, String taskType, String payloadJson, String idempotencyKey) {
        Optional<Job> optionalJob = jobRepository.findById(jobId);
        if (optionalJob.isEmpty()) {
            log.warn("Job not found for ID {}", jobId);
            return;
        }

        Job job = optionalJob.get();

        // TOPIC 4: Fencing Token Validation
        // Reject stale execution attempts if fencing token is smaller than current DB claim generation
        if (!job.getClaimGeneration().equals(claimGeneration)) {
            log.warn("Fencing token rejection! Incoming Token: {}, DB Token: {}. Rejecting stale worker execution.", claimGeneration, job.getClaimGeneration());
            recordFencedExecution(jobId, workerId, claimGeneration, idempotencyKey);
            return;
        }

        // Save execution record in RUNNING state
        JobExecution execution = new JobExecution(jobId, workerId, claimGeneration, idempotencyKey);
        jobExecutionRepository.save(execution);

        // Renew lease timestamp
        job.setLeaseExpiresAt(Instant.now().plusSeconds(leaseDurationSeconds));
        jobRepository.save(job);

        // Execute job handler using Strategy & Plugin Registry (Topic 7)
        JobResult result;
        try {
            JobHandler<Map<String, Object>> handler = jobHandlerRegistry.getHandler(taskType);
            Map<String, Object> payloadMap = objectMapper.readValue(payloadJson != null ? payloadJson : "{}", Map.class);
            
            result = handler.execute(payloadMap);
        } catch (Exception ex) {
            log.error("Error executing handler for taskType {}", taskType, ex);
            result = JobResult.failure(ex.getMessage(), "Exception: " + ex.getClass().getName() + " - " + ex.getMessage());
        }

        // Complete execution and update job state with fencing token check
        completeExecution(jobId, claimGeneration, execution.getId(), result);
    }

    @Transactional
    public void completeExecution(UUID jobId, Long claimGeneration, UUID executionId, JobResult result) {
        Optional<Job> optionalJob = jobRepository.findById(jobId);
        Optional<JobExecution> optionalExecution = jobExecutionRepository.findById(executionId);

        if (optionalJob.isEmpty() || optionalExecution.isEmpty()) {
            return;
        }

        Job job = optionalJob.get();
        JobExecution execution = optionalExecution.get();

        // TOPIC 4: Validate fencing token again before committing state update
        if (!job.getClaimGeneration().equals(claimGeneration)) {
            log.warn("Fencing token conflict during completion! Stale worker update rejected for job ID {}", jobId);
            execution.setStatus(ExecutionStatus.FENCED_OUT);
            execution.setCompletedAt(Instant.now());
            execution.setErrorMessage("Stale worker fencing token rejection");
            jobExecutionRepository.save(execution);
            return;
        }

        execution.setCompletedAt(Instant.now());
        execution.setExecutionLogs(result.getLogs());

        if (result.isSuccess()) {
            execution.setStatus(ExecutionStatus.SUCCESS);
            execution.setResultSummary(result.getSummary());

            job.setStatus(JobStatus.COMPLETED);
            job.setLeaseExpiresAt(null);
            log.info("Job completed successfully [ID: {}, Duration: {} ms]", jobId, execution.getCompletedAt().toEpochMilli() - execution.getStartedAt().toEpochMilli());
        } else {
            execution.setStatus(ExecutionStatus.FAILED);
            execution.setErrorMessage(result.getErrorMessage());

            // Handle Retries with Exponential Backoff
            if (job.getAttemptNumber() < job.getMaxRetries()) {
                job.setStatus(JobStatus.RETRY_WAIT);
                // Backoff delay: 5s * 2^(attempt-1)
                long backoffSeconds = 5L * (long) Math.pow(2, job.getAttemptNumber() - 1);
                job.setScheduledAt(Instant.now().plusSeconds(backoffSeconds));
                job.setLeaseExpiresAt(null);
                log.info("Job failed, scheduled retry wait attempt {}/{} in {}s [ID: {}]", job.getAttemptNumber(), job.getMaxRetries(), backoffSeconds, jobId);
            } else {
                job.setStatus(JobStatus.FAILED);
                job.setLeaseExpiresAt(null);
                log.warn("Job permanently failed after {} attempts [ID: {}]", job.getAttemptNumber(), jobId);
            }
        }

        jobExecutionRepository.save(execution);
        jobRepository.save(job);
    }

    private void recordFencedExecution(UUID jobId, String workerId, Long claimGeneration, String idempotencyKey) {
        JobExecution execution = new JobExecution(jobId, workerId, claimGeneration, idempotencyKey);
        execution.setStatus(ExecutionStatus.FENCED_OUT);
        execution.setCompletedAt(Instant.now());
        execution.setErrorMessage("Fencing Token Validation Failed: Worker owned stale generation token " + claimGeneration);
        jobExecutionRepository.save(execution);
    }
}
