package com.example.awsstarterapi.util;

import com.example.awsstarterapi.model.TaskEntity;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.time.LocalDateTime;

public class MongoTaskWriter {
    private final MongoTemplate mongoTemplate;

    public MongoTaskWriter(String mongoUri, String database) {
        MongoClient mongoClient = MongoClients.create(mongoUri);
        this.mongoTemplate = new MongoTemplate(mongoClient, database);
    }

    public TaskEntity writeTask() {
        // Create a simple task
        TaskEntity task = new TaskEntity(
            "Test Task",
            "This is a test task created directly via MongoDB",
            "TODO",
            "HIGH",
            LocalDateTime.now().plusDays(7),
            "TEST"
        );

        // Save it using MongoTemplate
        TaskEntity savedTask = mongoTemplate.save(task, "tasks");
        System.out.println("Task saved with ID: " + savedTask.getId());
        
        // Verify we can read it back
        TaskEntity foundTask = mongoTemplate.findById(savedTask.getId(), TaskEntity.class, "tasks");
        System.out.println("Found task: " + foundTask);

        return savedTask;
    }

    public static void main(String[] args) {
        String mongoUri = "mongodb://admin:admin123@localhost:27017/aws_starter_db?authSource=admin";
        MongoTaskWriter writer = new MongoTaskWriter(mongoUri, "aws_starter_db");
        writer.writeTask();
    }
}
