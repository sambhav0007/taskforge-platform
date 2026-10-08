package com.taskforge.handler.impl;

import com.taskforge.handler.JobHandler;
import com.taskforge.handler.JobResult;
import com.taskforge.handler.TaskDefinition;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@TaskDefinition(value = "ML_INFERENCE", description = "Executes heavy machine learning inference pipeline")
public class MlInferenceJobHandler implements JobHandler<Map<String, Object>> {

    @Override
    public String getTaskType() {
        return "ML_INFERENCE";
    }

    @SuppressWarnings("unchecked")
    @Override
    public Class<Map<String, Object>> getPayloadClass() {
        return (Class<Map<String, Object>>) (Class<?>) Map.class;
    }

    @Override
    public JobResult execute(Map<String, Object> payload) throws Exception {
        StringBuilder logs = new StringBuilder();
        logs.append("[LOG] Initializing ML Inference Task...\n");

        String modelId = (String) payload.getOrDefault("modelId", "xgboost-churn-v2");
        String datasetId = (String) payload.getOrDefault("datasetId", "ds-batch-2026-09");

        logs.append(String.format("[LOG] Loading model weights [%s] into memory...\n", modelId));
        logs.append(String.format("[LOG] Running matrix vector calculations on dataset [%s]...\n", datasetId));
        
        // Simulate compute task
        Thread.sleep(400);

        // Check if failure is requested in payload (for failure injection / testing)
        Boolean simulateFailure = (Boolean) payload.get("simulateFailure");
        if (Boolean.TRUE.equals(simulateFailure)) {
            logs.append("[ERROR] ML Inference failed: Out of GPU Memory (OOM simulated failure)\n");
            return JobResult.failure("Out of Memory exception in tensor allocation", logs.toString());
        }

        logs.append("[LOG] Inference compute completed successfully. Model Confidence Score: 0.942\n");
        return JobResult.success(
            String.format("ML Inference on model '%s' completed with confidence 0.942", modelId),
            logs.toString()
        );
    }
}
