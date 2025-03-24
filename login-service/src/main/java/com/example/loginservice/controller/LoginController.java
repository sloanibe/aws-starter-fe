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
        log.info("LOGIN-SERVICE: DEBUGGING MODE - Bypassing normal authentication flow");
        
        // Create a simple success response without invoking the service
        LoginResponse response = LoginResponse.builder()
                .id("debug-user-id")
                .email(loginRequest.getEmail() != null ? loginRequest.getEmail() : "debug@example.com")
                .name(loginRequest.getName() != null ? loginRequest.getName() : "Debug User")
                .organization(loginRequest.getOrganization() != null ? loginRequest.getOrganization() : "Debug Org")
                .success(true)
                .message("Login successful (DEBUG MODE)")
                .build();
                
        log.info("LOGIN-SERVICE: Returning debug success response");
        return ResponseEntity.ok(response);
    }
}
