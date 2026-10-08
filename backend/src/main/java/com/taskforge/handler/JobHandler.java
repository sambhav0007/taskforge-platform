package com.taskforge.handler;

public interface JobHandler<T> {

    String getTaskType();

    Class<T> getPayloadClass();

    JobResult execute(T payload) throws Exception;
}
