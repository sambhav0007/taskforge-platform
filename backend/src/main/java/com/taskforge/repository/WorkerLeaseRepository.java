package com.taskforge.repository;

import com.taskforge.domain.entity.WorkerLease;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface WorkerLeaseRepository extends JpaRepository<WorkerLease, String> {

    List<WorkerLease> findByHeartbeatAtAfter(Instant cutoff);

    List<WorkerLease> findByHeartbeatAtBefore(Instant cutoff);
}
