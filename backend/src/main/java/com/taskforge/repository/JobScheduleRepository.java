package com.taskforge.repository;

import com.taskforge.domain.entity.JobSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface JobScheduleRepository extends JpaRepository<JobSchedule, UUID> {

    List<JobSchedule> findByEnabledTrueAndNextRunAtBefore(Instant now);

    Page<JobSchedule> findByTenantId(UUID tenantId, Pageable pageable);
}
