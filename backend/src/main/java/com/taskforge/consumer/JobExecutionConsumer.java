package com.taskforge.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskforge.service.JobExecutionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class JobExecutionConsumer {

    private static final Logger log = LoggerFactory.getLogger(JobExecutionConsumer.class);

    private final JobExecutionService jobExecutionService;
    private final ObjectMapper objectMapper;

    public JobExecutionConsumer(JobExecutionService jobExecutionService, ObjectMapper objectMapper) {
        this.jobExecutionService = jobExecutionService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "${taskforge.kafka.topic:taskforge.jobs}", groupId = "${spring.kafka.consumer.group-id:taskforge-worker-group}")
    public void consume(String message) {
        try {
            log.debug("Kafka received job payload: {}", message);
            JsonNode root = objectMapper.readTree(message);

            UUID jobId = UUID.fromString(root.get("jobId").asText());
            Long claimGeneration = root.get("claimGeneration").asLong();
            String workerId = root.get("workerId").asText();
            String taskType = root.get("taskType").asText();
            String payloadJson = root.get("payload").asText();

            jobExecutionService.processJobEvent(jobId, claimGeneration, workerId, taskType, payloadJson);

        } catch (Exception ex) {
            log.error("Failed to parse Kafka message: {}", message, ex);
        }
    }
}
