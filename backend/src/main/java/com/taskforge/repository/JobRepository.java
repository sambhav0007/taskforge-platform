package com.taskforge.repository;

import com.taskforge.domain.entity.Job;
import com.taskforge.domain.enums.JobStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID>, JpaSpecificationExecutor<Job> {

    // Pessimistic Locking with FOR UPDATE SKIP LOCKED to allow multiple schedulers/workers
    // to safely claim jobs without contention or duplicate execution.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query(value = "SELECT j FROM Job j WHERE j.status = 'QUEUED' AND j.scheduledAt <= :now ORDER BY j.priority DESC, j.scheduledAt ASC")
    List<Job> claimEligibleJobsWithPessimisticLock(@Param("now") Instant now, Pageable pageable);

    // Native query version supporting native PostgreSQL FOR UPDATE SKIP LOCKED
    @Query(value = "SELECT * FROM jobs WHERE status = 'QUEUED' AND scheduled_at <= :now ORDER BY priority DESC, scheduled_at ASC LIMIT :limit FOR UPDATE SKIP LOCKED", nativeQuery = true)
    List<Job> claimEligibleJobsSkipLockedNative(@Param("now") Instant now, @Param("limit") int limit);

    // Find jobs with expired leases for Recovery Service (Topic 4 - Leases & Heartbeats)
    @Query("SELECT j FROM Job j WHERE j.status = 'RUNNING' AND j.leaseExpiresAt IS NOT NULL AND j.leaseExpiresAt < :now")
    List<Job> findExpiredLeaseJobs(@Param("now") Instant now);

    // Find jobs scheduled to be moved to QUEUED
    @Query("SELECT j FROM Job j WHERE j.status = 'SCHEDULED' AND j.scheduledAt <= :now")
    List<Job> findPendingScheduledJobs(@Param("now") Instant now);

    // Find jobs in RETRY_WAIT ready to be requeued
    @Query("SELECT j FROM Job j WHERE j.status = 'RETRY_WAIT' AND j.scheduledAt <= :now")
    List<Job> findRetryWaitJobsReady(@Param("now") Instant now);

    Page<Job> findByTenantId(UUID tenantId, Pageable pageable);

    Page<Job> findByTenantIdAndStatus(UUID tenantId, JobStatus status, Pageable pageable);

    long countByTenantIdAndStatusIn(UUID tenantId, List<JobStatus> statuses);

    long countByStatus(JobStatus status);

    @Modifying
    @Query("UPDATE Job j SET j.leaseExpiresAt = :newExpiry WHERE j.id = :jobId AND j.workerId = :workerId AND j.claimGeneration = :generation")
    int renewLease(@Param("jobId") UUID jobId, @Param("workerId") String workerId, @Param("generation") Long generation, @Param("newExpiry") Instant newExpiry);

    @Modifying
    @Query("UPDATE Job j SET j.status = :newStatus, j.updatedAt = CURRENT_TIMESTAMP WHERE j.id = :jobId AND j.claimGeneration = :generation")
    int updateStatusWithFencingToken(@Param("jobId") UUID jobId, @Param("newStatus") JobStatus newStatus, @Param("generation") Long generation);
}
