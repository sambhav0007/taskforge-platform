package com.taskforge.handler;

public class JobResult {
    private final boolean success;
    private final String summary;
    private final String errorMessage;
    private final String logs;

    private JobResult(boolean success, String summary, String errorMessage, String logs) {
        this.success = success;
        this.summary = summary;
        this.errorMessage = errorMessage;
        this.logs = logs;
    }

    public static JobResult success(String summary, String logs) {
        return new JobResult(true, summary, null, logs);
    }

    public static JobResult failure(String errorMessage, String logs) {
        return new JobResult(false, null, errorMessage, logs);
    }

    public boolean isSuccess() { return success; }
    public String getSummary() { return summary; }
    public String getErrorMessage() { return errorMessage; }
    public String getLogs() { return logs; }
}
