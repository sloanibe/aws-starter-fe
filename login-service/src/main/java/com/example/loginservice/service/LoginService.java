package com.example.loginservice.service;

import com.example.loginservice.dto.LoginEvent;
import com.example.loginservice.dto.LoginRequest;
import com.example.loginservice.dto.LoginResponse;
import com.example.loginservice.model.User;
import com.example.loginservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoginService {

    private final UserRepository userRepository;
    private final LoginEventProducer loginEventProducer;

    public LoginResponse login(LoginRequest loginRequest) {
        log.info("Processing login request for: {} ({}) from org {}", 
                loginRequest.getName(), loginRequest.getEmail(), loginRequest.getOrganization());
        
        // Check if user exists
        Optional<User> existingUser = userRepository.findByEmail(loginRequest.getEmail());
        
        User user;
        if (existingUser.isPresent()) {
            // Update existing user
            user = existingUser.get();
            user.setLastLogin(LocalDateTime.now());
            if (loginRequest.getName() != null && !loginRequest.getName().isEmpty()) {
                user.setDisplayName(loginRequest.getName());
            }
            if (loginRequest.getOrganization() != null && !loginRequest.getOrganization().isEmpty()) {
                user.setOrganization(loginRequest.getOrganization());
            }
            log.info("Updating existing user: {}", user.getId());
        } else {
            // Create new user
            user = new User();
            user.setEmail(loginRequest.getEmail());
            user.setDisplayName(loginRequest.getName());
            user.setOrganization(loginRequest.getOrganization());
            user.setUsername(loginRequest.getEmail().split("@")[0]); // Simple username from email
            user.setCreatedAt(LocalDateTime.now());
            user.setLastLogin(LocalDateTime.now());
            user.setRole("USER");
            log.info("Creating new user with email: {}", user.getEmail());
        }
        
        // Save user
        user = userRepository.save(user);
        log.info("User saved successfully with ID: {}", user.getId());
        
        // Create login event
        LoginEvent loginEvent = LoginEvent.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getDisplayName())
                .organization(user.getOrganization())
                .loginTime(LocalDateTime.now())
                .build();
        
        // Send login event to RabbitMQ (if available)
        try {
            loginEventProducer.sendLoginEvent(loginEvent);
        } catch (Exception e) {
            log.warn("Failed to send login event to RabbitMQ, but login will proceed: {}", e.getMessage());
            // We don't rethrow the exception to prevent login failure if messaging fails
        }
        
        // Return login response
        return LoginResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getDisplayName())
                .organization(user.getOrganization())
                .success(true)
                .message("Login successful")
                .build();
    }
}
