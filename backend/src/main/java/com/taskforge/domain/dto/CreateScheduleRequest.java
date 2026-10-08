package com.taskforge.domain.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public class CreateScheduleRequest {

    @NotBlank(message = "Schedule name is required")
    private String name;

    @NotBlank(message = "Task type is required")
    private String taskType;

    @NotBlank(message = "Cron expression is required")
    private String cronExpression;

    private Map<String, Object> payload;
    private Integer priority = 5;
    private Integer maxRetries = 3;

    public CreateScheduleRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTaskType() { return taskType; }
    public void setTaskType(String taskType) { this.taskType = taskType; }

    public String getCronExpression() { return cronExpression; }
    public void setCronExpression(String cronExpression) { this.cronExpression = cronExpression; }

    public Map<String, Object> getPayload() { return payload; }
    public void setPayload(Map<String, Object> payload) { this.payload = payload; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }

    public Integer getMaxRetries() { return maxRetries; }
    public void setMaxRetries(Integer maxRetries) { this.maxRetries = maxRetries; }
}
