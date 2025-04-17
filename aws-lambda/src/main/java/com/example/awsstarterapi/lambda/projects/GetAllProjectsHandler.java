package com.example.awsstarterapi.lambda.projects;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent;
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent;
import com.example.awsstarterapi.lambda.projects.model.ProjectEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Lambda function handler for retrieving all projects.
 * This replaces the Spring Boot controller endpoint: GET /projects
 */
public class GetAllProjectsHandler implements RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private static final Logger logger = LoggerFactory.getLogger(GetAllProjectsHandler.class);
    private final MongoClient mongoClient;
    private final ObjectMapper objectMapper;
    
    public GetAllProjectsHandler() {
        // Initialize MongoDB connection
        // In production, use AWS Secrets Manager to store and retrieve the connection string
        String connectionString = System.getenv("MONGODB_URI");
        if (connectionString == null || connectionString.isEmpty()) {
            // Default for local development
            connectionString = "mongodb://localhost:27017";
            logger.warn("MONGODB_URI environment variable not set, using default: {}", connectionString);
        }
        
        this.mongoClient = MongoClients.create(connectionString);
        
        // Configure ObjectMapper with JavaTimeModule for LocalDateTime serialization/deserialization
        this.objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }
    
    @Override
    public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent input, Context context) {
        logger.info("Processing request: {}", input.getPath());
        
        try {
            // Get MongoDB collection
            MongoDatabase database = mongoClient.getDatabase("aws_starter_db");
            MongoCollection<Document> collection = database.getCollection("projects");
            
            // Query for all projects
            List<ProjectEntity> projects = new ArrayList<>();
            collection.find().forEach(doc -> {
                try {
                    // Convert MongoDB document to ProjectEntity
                    String json = doc.toJson();
                    ProjectEntity project = objectMapper.readValue(json, ProjectEntity.class);
                    projects.add(project);
                } catch (Exception e) {
                    logger.error("Error parsing document: {}", e.getMessage(), e);
                }
            });
            
            // Convert to JSON
            String responseBody = objectMapper.writeValueAsString(projects);
            
            // Create response with headers
            Map<String, String> headers = new HashMap<>();
            headers.put("Content-Type", "application/json");
            headers.put("Access-Control-Allow-Origin", "https://sloandev.net");
            headers.put("Access-Control-Allow-Methods", "GET,OPTIONS");
            headers.put("Access-Control-Allow-Headers", "Content-Type,Authorization");
            
            // Return successful response
            return new APIGatewayProxyResponseEvent()
                .withStatusCode(200)
                .withHeaders(headers)
                .withBody(responseBody);
                
        } catch (Exception e) {
            logger.error("Error processing request: {}", e.getMessage(), e);
            
            // Return error response
            Map<String, String> headers = new HashMap<>();
            headers.put("Content-Type", "application/json");
            headers.put("Access-Control-Allow-Origin", "https://sloandev.net");
            
            return new APIGatewayProxyResponseEvent()
                .withStatusCode(500)
                .withHeaders(headers)
                .withBody("{\"message\":\"Internal server error: " + e.getMessage() + "\"}");
        }
    }
}
