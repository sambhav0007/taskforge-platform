package com.taskforge.handler.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskforge.handler.JobHandler;
import com.taskforge.handler.JobResult;
import com.taskforge.handler.TaskDefinition;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@TaskDefinition(value = "CSV_REPORT", description = "Generates aggregated CSV reports using streaming batches")
public class CsvReportJobHandler implements JobHandler<Map<String, Object>> {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public String getTaskType() {
        return "CSV_REPORT";
    }

    @SuppressWarnings("unchecked")
    @Override
    public Class<Map<String, Object>> getPayloadClass() {
        return (Class<Map<String, Object>>) (Class<?>) Map.class;
    }

    @Override
    public JobResult execute(Map<String, Object> payload) throws Exception {
        StringBuilder logBuffer = new StringBuilder();
        logBuffer.append("[LOG] Initializing CSV Streaming Report Task...\n");
        
        String fileId = (String) payload.getOrDefault("fileId", "report-default");
        String format = (String) payload.getOrDefault("format", "CSV");
        
        logBuffer.append(String.format("[LOG] Target File ID: %s, Format: %s\n", fileId, format));
        
        // Simulating batch streaming memory-efficient processing
        int totalRows = 10000;
        int batchSize = 1000;
        logBuffer.append(String.format("[LOG] Streaming %d rows in batches of %d...\n", totalRows, batchSize));
        
        for (int i = 1; i <= (totalRows / batchSize); i++) {
            Thread.sleep(100); // Simulate processing time
            logBuffer.append(String.format("[LOG] Batch %d/%d processed successfully.\n", i, totalRows / batchSize));
        }
        
        logBuffer.append("[LOG] CSV Report generated and written to storage.\n");
        return JobResult.success(
            String.format("Generated CSV report '%s' (%d records processed)", fileId, totalRows),
            logBuffer.toString()
        );
    }
}
