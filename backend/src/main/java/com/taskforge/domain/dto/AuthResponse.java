package com.taskforge.domain.dto;

import java.util.UUID;

public class AuthResponse {

    private String token;
    private String username;
    private String role;
    private UUID tenantId;

    public AuthResponse(String token, String username, String role, UUID tenantId) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.tenantId = tenantId;
    }

    public String getToken() { return token; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
    public UUID getTenantId() { return tenantId; }
}
