package com.taskforge.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskforge.domain.dto.CreateScheduleRequest;
import com.taskforge.domain.entity.JobSchedule;
import com.taskforge.repository.JobScheduleRepository;
import com.taskforge.security.TenantContext;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

    private final JobScheduleRepository scheduleRepository;
    private final ObjectMapper objectMapper;

    public ScheduleController(JobScheduleRepository scheduleRepository, ObjectMapper objectMapper) {
        this.scheduleRepository = scheduleRepository;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    public ResponseEntity<JobSchedule> createSchedule(@Valid @RequestBody CreateScheduleRequest request) {
        UUID tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            tenantId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        }

        CronExpression cron = CronExpression.parse(request.getCronExpression());
        ZonedDateTime nextRun = cron.next(ZonedDateTime.now());

        JobSchedule schedule = new JobSchedule();
        schedule.setTenantId(tenantId);
        schedule.setName(request.getName());
        schedule.setTaskType(request.getTaskType());
        schedule.setCronExpression(request.getCronExpression());
        try {
            schedule.setPayload(objectMapper.writeValueAsString(request.getPayload()));
        } catch (Exception e) {
            schedule.setPayload("{}");
        }
        schedule.setPriority(request.getPriority() != null ? request.getPriority() : 5);
        schedule.setMaxRetries(request.getMaxRetries() != null ? request.getMaxRetries() : 3);
        schedule.setEnabled(true);
        schedule.setNextRunAt(nextRun != null ? nextRun.toInstant() : Instant.now());

        JobSchedule saved = scheduleRepository.save(schedule);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<Page<JobSchedule>> listSchedules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID tenantId = TenantContext.getTenantId();
        PageRequest pageRequest = PageRequest.of(page, size);
        if (tenantId != null) {
            return ResponseEntity.ok(scheduleRepository.findByTenantId(tenantId, pageRequest));
        } else {
            return ResponseEntity.ok(scheduleRepository.findAll(pageRequest));
        }
    }
}
