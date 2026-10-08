package com.taskforge.domain.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tenants")
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "concurrent_job_limit", nullable = false)
    private Integer concurrentJobLimit = 10;

    @Column(name = "rate_limit_per_minute", nullable = false)
    private Integer rateLimitPerMinute = 60;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Tenant() {}

    public Tenant(String name, Integer concurrentJobLimit, Integer rateLimitPerMinute) {
        this.name = name;
        this.concurrentJobLimit = concurrentJobLimit != null ? concurrentJobLimit : 10;
        this.rateLimitPerMinute = rateLimitPerMinute != null ? rateLimitPerMinute : 60;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getConcurrentJobLimit() { return concurrentJobLimit; }
    public void setConcurrentJobLimit(Integer concurrentJobLimit) { this.concurrentJobLimit = concurrentJobLimit; }

    public Integer getRateLimitPerMinute() { return rateLimitPerMinute; }
    public void setRateLimitPerMinute(Integer rateLimitPerMinute) { this.rateLimitPerMinute = rateLimitPerMinute; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
