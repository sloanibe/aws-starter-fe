package com.example.awsstarterapi.controller;

import com.example.awsstarterapi.model.UserEntity;
import com.example.awsstarterapi.repository.UserRepository;
import com.example.awsstarterapi.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

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
        user.setCreatedAt(LocalDateTime.now());
        user.setLastLogin(LocalDateTime.now());
        UserEntity savedUser = userRepository.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(
            savedUser.getEmail(),
            savedUser.getDisplayName() != null ? savedUser.getDisplayName() : savedUser.getUsername(),
            savedUser.getOrganization()
        );

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
}
