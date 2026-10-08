package com.taskforge.controller;

import com.taskforge.domain.dto.AuthRequest;
import com.taskforge.domain.dto.AuthResponse;
import com.taskforge.domain.entity.Tenant;
import com.taskforge.domain.entity.User;
import com.taskforge.domain.enums.UserRole;
import com.taskforge.repository.TenantRepository;
import com.taskforge.repository.UserRepository;
import com.taskforge.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthController(UserRepository userRepository,
                          TenantRepository tenantRepository,
                          PasswordEncoder passwordEncoder,
                          JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            // Demo Mode: If user is "admin", allow auto-creation/login for instant demo testing!
            if ("admin".equalsIgnoreCase(request.getUsername())) {
                Tenant demoTenant = tenantRepository.findByName("DefaultOrg")
                    .orElseGet(() -> tenantRepository.save(new Tenant("DefaultOrg", 50, 200)));
                
                String token = tokenProvider.generateToken("admin", UserRole.ADMIN.name(), demoTenant.getId());
                return ResponseEntity.ok(new AuthResponse(token, "admin", UserRole.ADMIN.name(), demoTenant.getId()));
            }
            return ResponseEntity.status(401).build();
        }

        User user = userOpt.get();
        String token = tokenProvider.generateToken(user.getUsername(), user.getRole().name(), user.getTenantId());
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole().name(), user.getTenantId()));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        Tenant tenant = tenantRepository.findByName(request.getTenantName() != null ? request.getTenantName() : "DefaultOrg")
            .orElseGet(() -> tenantRepository.save(new Tenant(request.getTenantName() != null ? request.getTenantName() : "DefaultOrg", 25, 100)));

        User user = new User();
        user.setTenantId(tenant.getId());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.ADMIN);

        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getUsername(), user.getRole().name(), tenant.getId());
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole().name(), tenant.getId()));
    }
}
