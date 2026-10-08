package com.taskforge.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskforge.domain.dto.CreateJobRequest;
import com.taskforge.domain.entity.Job;
import com.taskforge.domain.enums.JobStatus;
import com.taskforge.handler.JobHandlerRegistry;
import com.taskforge.repository.JobRepository;
import com.taskforge.repository.OutboxEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class JobSchedulerServiceTest {

    private JobRepository jobRepository;
    private OutboxEventRepository outboxEventRepository;
    private JobHandlerRegistry jobHandlerRegistry;
    private TenantQuotaService tenantQuotaService;
    private JobSchedulerService schedulerService;

    @BeforeEach
    void setUp() {
        jobRepository = mock(JobRepository.class);
        outboxEventRepository = mock(OutboxEventRepository.class);
        jobHandlerRegistry = mock(JobHandlerRegistry.class);
        tenantQuotaService = mock(TenantQuotaService.class);

        schedulerService = new JobSchedulerService(
            jobRepository,
            outboxEventRepository,
            jobHandlerRegistry,
            tenantQuotaService,
            new ObjectMapper()
        );
    }

    @Test
    void testSubmitJobCreatesJobAndTransactionalOutboxEvent() {
        when(jobHandlerRegistry.hasHandler("CSV_REPORT")).thenReturn(true);
        when(jobRepository.save(any(Job.class))).thenAnswer(invocation -> {
            Job j = invocation.getArgument(0);
            if (j.getId() == null) {
                j.setId(java.util.UUID.randomUUID());
            }
            return j;
        });

        CreateJobRequest request = new CreateJobRequest();
        request.setName("Monthly Financial Audit");
        request.setTaskType("CSV_REPORT");
        request.setPayload(Map.of("month", "September-2026"));
        request.setPriority(10);

        Job createdJob = schedulerService.submitJob(request);

        assertNotNull(createdJob);
        assertEquals("Monthly Financial Audit", createdJob.getName());
        assertEquals("CSV_REPORT", createdJob.getTaskType());
        assertEquals(JobStatus.QUEUED, createdJob.getStatus());

        // Verify Transactional Outbox event created in same boundary
        verify(outboxEventRepository, times(1)).save(any());
        verify(jobRepository, times(1)).save(any());
    }
}
