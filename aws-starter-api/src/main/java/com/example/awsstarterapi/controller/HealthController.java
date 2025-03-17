package com.example.awsstarterapi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import software.amazon.awssdk.services.ses.SesClient;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private SesClient sesClient;

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        Map<String, Object> services = new HashMap<>();
        
        // Check MongoDB
        try {
            mongoTemplate.executeCommand("{ ping: 1 }");
            services.put("mongodb", Map.of(
                "status", "UP",
                "details", Map.of(
                    "database", mongoTemplate.getDb().getName()
                )
            ));
        } catch (Exception e) {
            services.put("mongodb", Map.of(
                "status", "DOWN",
                "error", e.getMessage()
            ));
        }

        // Check AWS SES
        try {
            sesClient.getSendQuota();
            services.put("email", Map.of(
                "status", "UP",
                "provider", "AWS SES"
            ));
        } catch (Exception e) {
            services.put("email", Map.of(
                "status", "DOWN",
                "error", e.getMessage()
            ));
        }

        // Add JVM metrics
        Runtime runtime = Runtime.getRuntime();
        Map<String, Object> jvm = new HashMap<>();
        jvm.put("totalMemory", runtime.totalMemory());
        jvm.put("freeMemory", runtime.freeMemory());
        jvm.put("maxMemory", runtime.maxMemory());
        jvm.put("processors", runtime.availableProcessors());

        health.put("status", "UP");
        health.put("services", services);
        health.put("jvm", jvm);

        return ResponseEntity.ok(health);
    }
}
