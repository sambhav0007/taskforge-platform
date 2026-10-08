package com.taskforge.handler;

import com.taskforge.handler.impl.CsvReportJobHandler;
import com.taskforge.handler.impl.EmailNotificationJobHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class JobHandlerRegistryTest {

    private JobHandlerRegistry registry;

    @BeforeEach
    void setUp() {
        registry = new JobHandlerRegistry(List.of(
            new CsvReportJobHandler(),
            new EmailNotificationJobHandler()
        ));
    }

    @Test
    void testRegistryDiscoversAnnotatedHandlers() {
        Set<String> taskTypes = registry.getRegisteredTaskTypes();
        assertTrue(taskTypes.contains("CSV_REPORT"));
        assertTrue(taskTypes.contains("EMAIL_NOTIFICATION"));
    }

    @Test
    void testGetHandlerReturnsCorrectInstance() {
        JobHandler<?> handler = registry.getHandler("CSV_REPORT");
        assertNotNull(handler);
        assertEquals("CSV_REPORT", handler.getTaskType());
    }

    @Test
    void testThrowsExceptionForUnknownTaskType() {
        assertThrows(IllegalArgumentException.class, () -> registry.getHandler("NON_EXISTENT_TASK"));
    }
}
