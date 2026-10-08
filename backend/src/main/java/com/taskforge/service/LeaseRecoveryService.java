package com.taskforge.service;

import com.taskforge.domain.entity.Job;
import com.taskforge.domain.enums.JobStatus;
import com.taskforge.repository.JobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class LeaseRecoveryService {

    private static final Logger log = LoggerFactory.getLogger(LeaseRecoveryService.class);

    private final JobRepository jobRepository;

    public LeaseRecoveryService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    // TOPIC 4: Lease Recovery Service
    // Periodically detects crashed worker jobs with expired leases and safely recovers them.
    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void recoverExpiredLeases() {
        Instant now = Instant.now();
        List<Job> expiredJobs = jobRepository.findExpiredLeaseJobs(now);

        if (expiredJobs.isEmpty()) {
            return;
        }

        log.info("Detected {} jobs with expired worker leases. Initiating lease recovery...", expiredJobs.size());

        for (Job job : expiredJobs) {
            String crashedWorker = job.getWorkerId();
            Long oldGeneration = job.getClaimGeneration();

            // Clear lease details
            job.setWorkerId(null);
            job.setLeaseExpiresAt(null);

            if (job.getAttemptNumber() < job.getMaxRetries()) {
                job.setStatus(JobStatus.RETRY_WAIT);
                long backoffSeconds = 5L * (long) Math.pow(2, job.getAttemptNumber());
                job.setScheduledAt(now.plusSeconds(backoffSeconds));
                log.warn("Recovered job [ID: {}] from crashed worker [{}]. Re-queuing in {}s (Previous Fencing Token: {})",
                        job.getId(), crashedWorker, backoffSeconds, oldGeneration);
            } else {
                job.setStatus(JobStatus.FAILED);
                log.error("Job [ID: {}] exceeded max retries during lease recovery from crashed worker [{}]", job.getId(), crashedWorker);
            }

            jobRepository.save(job);
        }
    }
}
