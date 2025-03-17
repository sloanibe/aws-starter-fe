package com.example.awsstarterapi.controller;

import com.example.awsstarterapi.model.UserEntity;
import com.example.awsstarterapi.repository.UserRepository;
import com.example.awsstarterapi.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/users")
public class UserController extends BaseController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @GetMapping
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        return success(userRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserEntity> getUserById(@PathVariable String id) {
        return userRepository.findById(id)
                .map(this::success)
                .orElseGet(this::notFound);
    }

    @PostMapping
    public ResponseEntity<UserEntity> createUser(@RequestBody UserEntity user) {
        log.info("Creating new user: {} ({}) from org {}", user.getDisplayName(), user.getEmail(), user.getOrganization());
        user.setCreatedAt(LocalDateTime.now());
        user.setLastLogin(LocalDateTime.now());
        UserEntity savedUser = userRepository.save(user);

        // Send welcome email
        log.info("Attempting to send welcome email to {} ({}) from org {}", 
                user.getDisplayName(), user.getEmail(), user.getOrganization());
        emailService.sendWelcomeEmail(user.getEmail(), user.getDisplayName(), user.getOrganization());
        log.info("Welcome email sent successfully");

        return created(savedUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserEntity> updateUser(@PathVariable String id, @RequestBody UserEntity userDetails) {
        return userRepository.findById(id)
                .map(existingUser -> {
                    if (userDetails.getUsername() != null) {
                        existingUser.setUsername(userDetails.getUsername());
                    }
                    if (userDetails.getEmail() != null) {
                        existingUser.setEmail(userDetails.getEmail());
                    }
                    return success(userRepository.save(existingUser));
                })
                .orElseGet(this::notFound);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> {
                    userRepository.deleteById(id);
                    return noContent();
                })
                .orElseGet(this::notFound);
    }

    @PostMapping("/guest")
    public ResponseEntity<UserEntity> loginAsGuest(@RequestBody Map<String, String> guestInfo) {
        String email = guestInfo.get("email");
        String name = guestInfo.get("name");

        // Create a guest user
        UserEntity guestUser = new UserEntity();
        guestUser.setUsername("guest");
        guestUser.setEmail(email);
        guestUser.setDisplayName(name);
        guestUser.setCreatedAt(LocalDateTime.now());
        guestUser.setLastLogin(LocalDateTime.now());
        guestUser.setOrganization("Guest");

        UserEntity savedUser = userRepository.save(guestUser);

        // Send both welcome and guest visit notifications
        log.info("Sending welcome email to guest: {} ({})", name, email);
        emailService.sendWelcomeEmail(email, name, "Guest");
        
        log.info("Sending guest visit notification for: {} ({})", name, email);
        emailService.sendGuestVisitNotification(email, name);

        return created(savedUser);
    }
}
