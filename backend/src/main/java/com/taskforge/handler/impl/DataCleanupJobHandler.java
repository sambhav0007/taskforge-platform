package com.taskforge.handler.impl;

import com.taskforge.handler.JobHandler;
import com.taskforge.handler.JobResult;
import com.taskforge.handler.TaskDefinition;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@TaskDefinition(value = "DATA_CLEANUP", description = "Executes retention purge and database index maintenance")
public class DataCleanupJobHandler implements JobHandler<Map<String, Object>> {

    @Override
    public String getTaskType() {
        return "DATA_CLEANUP";
    }

    @SuppressWarnings("unchecked")
    @Override
    public Class<Map<String, Object>> getPayloadClass() {
        return (Class<Map<String, Object>>) (Class<?>) Map.class;
    }

    @Override
    public JobResult execute(Map<String, Object> payload) throws Exception {
        StringBuilder logs = new StringBuilder();
        logs.append("[LOG] Starting Data Cleanup & Maintenance Task...\n");

        int retentionDays = payload.containsKey("retentionDays") ? ((Number) payload.get("retentionDays")).intValue() : 30;
        String targetTable = (String) payload.getOrDefault("targetTable", "audit_logs");

        logs.append(String.format("[LOG] Purging records older than %d days from table [%s]...\n", retentionDays, targetTable));
        Thread.sleep(250); // Simulate execution
        logs.append("[LOG] Cleanup completed: 1,420 obsolete rows deleted.\n");

        return JobResult.success(
            String.format("Purged 1,420 rows from %s (retention: %d days)", targetTable, retentionDays),
            logs.toString()
        );
    }
}
