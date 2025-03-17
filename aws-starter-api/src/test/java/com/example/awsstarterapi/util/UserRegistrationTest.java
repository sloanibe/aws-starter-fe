package com.example.awsstarterapi.util;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

public class UserRegistrationTest {
    private static final String API_URL = "https://tylsa7bs12.execute-api.us-west-1.amazonaws.com/prod/api/users";

    public static void createTestUser(String email, String username, String organization) {
        System.out.println("\n=== Starting User Registration Test ===");
        System.out.println("API URL: " + API_URL);
        
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String requestBody = String.format("""
            {
                "email": "%s",
                "username": "%s",
                "organization": "%s"
            }""", email, username, organization);

        System.out.println("\nRequest Headers:");
        headers.forEach((key, value) -> System.out.println(key + ": " + value));
        
        System.out.println("\nRequest Body:");
        System.out.println(requestBody);

        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
        
        try {
            System.out.println("\nSending POST request...");
            var response = restTemplate.postForObject(API_URL, request, String.class);
            System.out.println("\nSuccess! Server Response:");
            System.out.println(response);
            
        } catch (HttpClientErrorException e) {
            System.err.println("\nClient Error (4xx):");
            System.err.println("Status code: " + e.getStatusCode());
            System.err.println("Response body: " + e.getResponseBodyAsString());
            System.err.println("\nStack trace:");
            e.printStackTrace();
            
        } catch (HttpServerErrorException e) {
            System.err.println("\nServer Error (5xx):");
            System.err.println("Status code: " + e.getStatusCode());
            System.err.println("Response body: " + e.getResponseBodyAsString());
            System.err.println("\nStack trace:");
            e.printStackTrace();
            
        } catch (ResourceAccessException e) {
            System.err.println("\nConnection Error:");
            System.err.println("Failed to connect to the server: " + e.getMessage());
            System.err.println("This might indicate that:");
            System.err.println("1. The server is down");
            System.err.println("2. The URL is incorrect");
            System.err.println("3. There are network connectivity issues");
            System.err.println("\nStack trace:");
            e.printStackTrace();
            
        } catch (Exception e) {
            System.err.println("\nUnexpected Error:");
            System.err.println("Error type: " + e.getClass().getName());
            System.err.println("Error message: " + e.getMessage());
            System.err.println("\nStack trace:");
            e.printStackTrace();
        }
        
        System.out.println("\n=== Test Completed ===");
    }

    public static void main(String[] args) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        createTestUser(
            "sloanibe+test" + timestamp + "@gmail.com", // Make email unique
            "testuser_" + timestamp,
            "TestOrg"
        );
    }
}
