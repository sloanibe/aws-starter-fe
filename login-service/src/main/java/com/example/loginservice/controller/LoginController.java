package com.example.loginservice.controller;

import com.example.loginservice.dto.LoginRequest;
import com.example.loginservice.dto.LoginResponse;
import com.example.loginservice.service.LoginService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/login")
@RequiredArgsConstructor
public class LoginController {

    private final LoginService loginService;

    @PostMapping
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        log.info("LOGIN-SERVICE: Received login request for user: {} ({})", 
                loginRequest.getName() != null ? loginRequest.getName() : "unknown", 
                loginRequest.getEmail() != null ? loginRequest.getEmail() : "unknown@example.com");
        
        try {
            // Use the actual login service implementation
            LoginResponse response = loginService.login(loginRequest);
            log.info("LOGIN-SERVICE: Login successful for user: {}", response.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("LOGIN-SERVICE: Error processing login request", e);
            LoginResponse errorResponse = LoginResponse.builder()
                    .success(false)
                    .message("Login failed: " + e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
