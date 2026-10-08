package com.taskforge.handler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JobHandlerRegistry {

    private static final Logger log = LoggerFactory.getLogger(JobHandlerRegistry.class);
    private final Map<String, JobHandler<?>> handlers = new ConcurrentHashMap<>();

    @Autowired
    public JobHandlerRegistry(List<JobHandler<?>> handlerBeans) {
        for (JobHandler<?> handler : handlerBeans) {
            String type = handler.getTaskType();
            TaskDefinition annotation = handler.getClass().getAnnotation(TaskDefinition.class);
            if (annotation != null && !annotation.value().isBlank()) {
                type = annotation.value();
            }
            handlers.put(type.toUpperCase(), handler);
            log.info("Registered TaskHandler for type: [{}] -> class: {}", type.toUpperCase(), handler.getClass().getSimpleName());
        }
    }

    @SuppressWarnings("unchecked")
    public <T> JobHandler<T> getHandler(String taskType) {
        if (taskType == null) {
            throw new IllegalArgumentException("Task type cannot be null");
        }
        JobHandler<?> handler = handlers.get(taskType.trim().toUpperCase());
        if (handler == null) {
            throw new IllegalArgumentException("No handler registered for task type: " + taskType);
        }
        return (JobHandler<T>) handler;
    }

    public Set<String> getRegisteredTaskTypes() {
        return Collections.unmodifiableSet(handlers.keySet());
    }

    public boolean hasHandler(String taskType) {
        return taskType != null && handlers.containsKey(taskType.trim().toUpperCase());
    }
}
