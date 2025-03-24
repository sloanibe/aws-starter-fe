package com.example.loginservice.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> test() {
        log.info("Test endpoint called");
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Login Service is working");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
