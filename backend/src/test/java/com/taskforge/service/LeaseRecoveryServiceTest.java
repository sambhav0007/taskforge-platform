package com.taskforge.service;

import com.taskforge.domain.entity.Job;
import com.taskforge.domain.enums.JobStatus;
import com.taskforge.repository.JobRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class LeaseRecoveryServiceTest {

    private JobRepository jobRepository;
    private LeaseRecoveryService recoveryService;

    @BeforeEach
    void setUp() {
        jobRepository = mock(JobRepository.class);
        recoveryService = new LeaseRecoveryService(jobRepository);
    }

    @Test
    void testRecoversExpiredLeaseAndAppliesRetryBackoff() {
        Job expiredJob = new Job();
        expiredJob.setId(UUID.randomUUID());
        expiredJob.setStatus(JobStatus.RUNNING);
        expiredJob.setWorkerId("crashed-worker-99");
        expiredJob.setLeaseExpiresAt(Instant.now().minusSeconds(10));
        expiredJob.setAttemptNumber(1);
        expiredJob.setMaxRetries(3);
        expiredJob.setClaimGeneration(42L);

        when(jobRepository.findExpiredLeaseJobs(any(Instant.class))).thenReturn(List.of(expiredJob));

        recoveryService.recoverExpiredLeases();

        assertEquals(JobStatus.RETRY_WAIT, expiredJob.getStatus());
        assertEquals(null, expiredJob.getWorkerId());
        assertEquals(null, expiredJob.getLeaseExpiresAt());

        verify(jobRepository, times(1)).save(expiredJob);
    }
}
