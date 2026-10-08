package com.taskforge.service;

import com.taskforge.domain.entity.Tenant;
import com.taskforge.domain.enums.JobStatus;
import com.taskforge.repository.JobRepository;
import com.taskforge.repository.TenantRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TenantQuotaService {

    private final TenantRepository tenantRepository;
    private final JobRepository jobRepository;

    public TenantQuotaService(TenantRepository tenantRepository, JobRepository jobRepository) {
        this.tenantRepository = tenantRepository;
        this.jobRepository = jobRepository;
    }

    public void checkQuotaAndRateLimit(UUID tenantId) {
        Optional<Tenant> tenantOpt = tenantRepository.findById(tenantId);
        if (tenantOpt.isEmpty()) {
            return; // Allow default fallback tenant
        }

        Tenant tenant = tenantOpt.get();
        List<JobStatus> activeStatuses = Arrays.asList(JobStatus.QUEUED, JobStatus.RUNNING, JobStatus.SCHEDULED);

        long activeCount = jobRepository.countByTenantIdAndStatusIn(tenantId, activeStatuses);

        if (activeCount >= tenant.getConcurrentJobLimit()) {
            throw new IllegalStateException(String.format(
                "Tenant [%s] exceeded maximum concurrent job limit (%d active / %d limit)",
                tenant.getName(), activeCount, tenant.getConcurrentJobLimit()
            ));
        }
    }
}
