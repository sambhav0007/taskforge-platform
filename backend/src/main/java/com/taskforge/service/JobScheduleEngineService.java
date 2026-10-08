package com.taskforge.service;

import com.taskforge.domain.dto.CreateJobRequest;
import com.taskforge.domain.entity.JobSchedule;
import com.taskforge.repository.JobScheduleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.List;

@Service
public class JobScheduleEngineService {

    private static final Logger log = LoggerFactory.getLogger(JobScheduleEngineService.class);

    private final JobScheduleRepository scheduleRepository;
    private final JobSchedulerService jobSchedulerService;

    public JobScheduleEngineService(JobScheduleRepository scheduleRepository, JobSchedulerService jobSchedulerService) {
        this.scheduleRepository = scheduleRepository;
        this.jobSchedulerService = jobSchedulerService;
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void evaluateCronSchedules() {
        Instant now = Instant.now();
        List<JobSchedule> dueSchedules = scheduleRepository.findByEnabledTrueAndNextRunAtBefore(now);

        for (JobSchedule schedule : dueSchedules) {
            try {
                CreateJobRequest request = new CreateJobRequest();
                request.setName(schedule.getName() + " [Cron Run]");
                request.setTaskType(schedule.getTaskType());
                request.setPriority(schedule.getPriority());
                request.setMaxRetries(schedule.getMaxRetries());

                jobSchedulerService.submitJob(request);

                // Compute next execution time from CronExpression
                CronExpression cron = CronExpression.parse(schedule.getCronExpression());
                ZonedDateTime next = cron.next(ZonedDateTime.now());
                
                schedule.setLastRunAt(now);
                schedule.setNextRunAt(next != null ? next.toInstant() : now.plusSeconds(3600));
                scheduleRepository.save(schedule);

                log.info("Triggered cron schedule [ID: {}, Name: {}]", schedule.getId(), schedule.getName());
            } catch (Exception e) {
                log.error("Failed to evaluate schedule ID: {}", schedule.getId(), e);
            }
        }
    }
}
