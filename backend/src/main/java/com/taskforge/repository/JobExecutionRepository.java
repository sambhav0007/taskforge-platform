package com.taskforge.repository;

import com.taskforge.domain.entity.JobExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobExecutionRepository extends JpaRepository<JobExecution, UUID> {

    boolean existsByIdempotencyKey(String idempotencyKey);

    Optional<JobExecution> findByIdempotencyKey(String idempotencyKey);

    List<JobExecution> findByJobIdOrderByStartedAtDesc(UUID jobId);

    Optional<JobExecution> findFirstByJobIdOrderByStartedAtDesc(UUID jobId);
}
