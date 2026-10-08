package com.taskforge.handler.impl;

import com.taskforge.handler.JobHandler;
import com.taskforge.handler.JobResult;
import com.taskforge.handler.TaskDefinition;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@TaskDefinition(value = "EMAIL_NOTIFICATION", description = "Dispatches queued email notifications")
public class EmailNotificationJobHandler implements JobHandler<Map<String, Object>> {

    @Override
    public String getTaskType() {
        return "EMAIL_NOTIFICATION";
    }

    @SuppressWarnings("unchecked")
    @Override
    public Class<Map<String, Object>> getPayloadClass() {
        return (Class<Map<String, Object>>) (Class<?>) Map.class;
    }

    @Override
    public JobResult execute(Map<String, Object> payload) throws Exception {
        StringBuilder logs = new StringBuilder();
        logs.append("[LOG] Preparing Email Dispatcher Task...\n");

        String recipient = (String) payload.getOrDefault("recipient", "user@example.com");
        String template = (String) payload.getOrDefault("template", "MONTHLY_STATEMENT");

        logs.append(String.format("[LOG] Recipient: %s, Template: %s\n", recipient, template));
        Thread.sleep(300); // Simulate SMTP network roundtrip
        logs.append("[LOG] Email delivered successfully via SMTP server.\n");

        return JobResult.success(
            String.format("Email notification sent to %s using template '%s'", recipient, template),
            logs.toString()
        );
    }
}
