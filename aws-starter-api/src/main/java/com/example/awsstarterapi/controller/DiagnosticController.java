package com.example.awsstarterapi.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/diagnostic")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://aws-starter-app.s3-website-us-west-1.amazonaws.com",
    "https://d23g2ah1oukxrw.cloudfront.net",
    "https://sloandev.net",
    "https://www.sloandev.net",
    "https://api.sloandev.net"
})
public class DiagnosticController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/collections")
    public Map<String, Object> getCollections() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            Set<String> collectionNames = mongoTemplate.getCollectionNames();
            result.put("collections", collectionNames);
            result.put("success", true);
            result.put("count", collectionNames.size());
            
            // Check if tasks collection exists
            boolean tasksExists = collectionNames.contains("tasks");
            result.put("tasksCollectionExists", tasksExists);
            
            // Create tasks collection if it doesn't exist
            if (!tasksExists) {
                mongoTemplate.createCollection("tasks");
                result.put("tasksCollectionCreated", true);
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        
        return result;
    }
}
