package com.taskforge.controller;

import com.taskforge.domain.dto.CreateJobRequest;
import com.taskforge.domain.dto.JobResponse;
import com.taskforge.domain.entity.Job;
import com.taskforge.domain.entity.JobExecution;
import com.taskforge.domain.enums.JobStatus;
import com.taskforge.handler.JobHandlerRegistry;
import com.taskforge.repository.JobExecutionRepository;
import com.taskforge.repository.JobRepository;
import com.taskforge.security.TenantContext;
import com.taskforge.service.JobSchedulerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    private final JobSchedulerService jobSchedulerService;
    private final JobRepository jobRepository;
    private final JobExecutionRepository jobExecutionRepository;
    private final JobHandlerRegistry jobHandlerRegistry;

    public JobController(JobSchedulerService jobSchedulerService,
                         JobRepository jobRepository,
                         JobExecutionRepository jobExecutionRepository,
                         JobHandlerRegistry jobHandlerRegistry) {
        this.jobSchedulerService = jobSchedulerService;
        this.jobRepository = jobRepository;
        this.jobExecutionRepository = jobExecutionRepository;
        this.jobHandlerRegistry = jobHandlerRegistry;
    }

    @PostMapping
    public ResponseEntity<JobResponse> submitJob(@Valid @RequestBody CreateJobRequest request) {
        Job job = jobSchedulerService.submitJob(request);
        return ResponseEntity.ok(JobResponse.fromEntity(job));
    }

    @GetMapping
    public ResponseEntity<Page<JobResponse>> listJobs(
            @RequestParam(required = false) JobStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        UUID tenantId = TenantContext.getTenantId();

        Page<Job> jobs;
        if (tenantId != null) {
            if (status != null) {
                jobs = jobRepository.findByTenantIdAndStatus(tenantId, status, pageRequest);
            } else {
                jobs = jobRepository.findByTenantId(tenantId, pageRequest);
            }
        } else {
            if (status != null) {
                jobs = jobRepository.findAll((root, query, cb) -> cb.equal(root.get("status"), status), pageRequest);
            } else {
                jobs = jobRepository.findAll(pageRequest);
            }
        }

        return ResponseEntity.ok(jobs.map(JobResponse::fromEntity));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJob(@PathVariable UUID id) {
        return jobRepository.findById(id)
            .map(job -> ResponseEntity.ok(JobResponse.fromEntity(job)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<JobResponse> cancelJob(@PathVariable UUID id) {
        Optional<Job> optionalJob = jobRepository.findById(id);
        if (optionalJob.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Job job = optionalJob.get();
        if (job.getStatus() == JobStatus.RUNNING || job.getStatus() == JobStatus.QUEUED || job.getStatus() == JobStatus.SCHEDULED) {
            job.setStatus(JobStatus.CANCELLED);
            jobRepository.save(job);
        }
        return ResponseEntity.ok(JobResponse.fromEntity(job));
    }

    @PostMapping("/{id}/retry")
    public ResponseEntity<JobResponse> retryJob(@PathVariable UUID id) {
        Optional<Job> optionalJob = jobRepository.findById(id);
        if (optionalJob.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Job job = optionalJob.get();
        job.setStatus(JobStatus.QUEUED);
        job.setScheduledAt(Instant.now());
        job.setAttemptNumber(0);
        jobRepository.save(job);
        return ResponseEntity.ok(JobResponse.fromEntity(job));
    }

    @GetMapping("/{id}/executions")
    public ResponseEntity<List<JobExecution>> getJobExecutions(@PathVariable UUID id) {
        List<JobExecution> executions = jobExecutionRepository.findByJobIdOrderByStartedAtDesc(id);
        return ResponseEntity.ok(executions);
    }

    @GetMapping("/task-types")
    public ResponseEntity<Set<String>> getTaskTypes() {
        return ResponseEntity.ok(jobHandlerRegistry.getRegisteredTaskTypes());
    }
}
