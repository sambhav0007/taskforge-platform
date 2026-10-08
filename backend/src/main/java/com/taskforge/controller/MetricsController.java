package com.taskforge.controller;

import com.taskforge.domain.dto.MetricsSummaryResponse;
import com.taskforge.domain.entity.Job;
import com.taskforge.domain.enums.JobStatus;
import com.taskforge.repository.JobRepository;
import com.taskforge.repository.WorkerLeaseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/metrics")
public class MetricsController {

    private final JobRepository jobRepository;
    private final WorkerLeaseRepository workerLeaseRepository;

    public MetricsController(JobRepository jobRepository, WorkerLeaseRepository workerLeaseRepository) {
        this.jobRepository = jobRepository;
        this.workerLeaseRepository = workerLeaseRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<MetricsSummaryResponse> getDashboardMetrics() {
        MetricsSummaryResponse metrics = new MetricsSummaryResponse();

        long total = jobRepository.count();
        long queued = jobRepository.countByStatus(JobStatus.QUEUED);
        long running = jobRepository.countByStatus(JobStatus.RUNNING);
        long completed = jobRepository.countByStatus(JobStatus.COMPLETED);
        long failed = jobRepository.countByStatus(JobStatus.FAILED);
        long retrying = jobRepository.countByStatus(JobStatus.RETRY_WAIT);

        metrics.setTotalJobs(total);
        metrics.setQueuedJobs(queued);
        metrics.setRunningJobs(running);
        metrics.setCompletedJobs(completed);
        metrics.setFailedJobs(failed);
        metrics.setRetryingJobs(retrying);

        long activeWorkers = workerLeaseRepository.findByHeartbeatAtAfter(Instant.now().minusSeconds(30)).size();
        metrics.setActiveWorkers(activeWorkers);

        double successRate = total > 0 ? ((double) completed / (completed + failed > 0 ? completed + failed : 1)) * 100.0 : 100.0;
        metrics.setSuccessRatePercent(Math.round(successRate * 10.0) / 10.0);

        Map<String, Long> distribution = new HashMap<>();
        List<Job> allJobs = jobRepository.findAll();
        for (Job job : allJobs) {
            distribution.merge(job.getTaskType(), 1L, Long::sum);
        }
        metrics.setTaskTypeDistribution(distribution);

        return ResponseEntity.ok(metrics);
    }
}
