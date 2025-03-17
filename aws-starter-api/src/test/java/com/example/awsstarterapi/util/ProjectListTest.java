package com.example.awsstarterapi.util;

import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

public class ProjectListTest {
    private static final String API_URL = "https://api.sloandev.net/prod/api/projects";

    public static void listAllProjects() {
        System.out.println("\n=== Starting Project List Test ===");
        System.out.println("API URL: " + API_URL);

        // Configure RestTemplate to handle cookies
        org.springframework.web.client.RestTemplate restTemplate = new RestTemplate();
        java.util.List<org.springframework.http.client.ClientHttpRequestInterceptor> interceptors = new java.util.ArrayList<>();
        interceptors.add(new org.springframework.http.client.support.BasicAuthenticationInterceptor("admin", "password"));
        restTemplate.setInterceptors(interceptors);

        try {
            // Set up headers
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Accept", "application/json");
            headers.set("User-Agent", "Mozilla/5.0");
            headers.set("Origin", "https://app.sloandev.net");
            headers.set("Referer", "https://app.sloandev.net/");
            headers.set("Access-Control-Request-Method", "GET");
            headers.set("Access-Control-Request-Headers", "authorization,content-type");
            headers.set("Authorization", "Basic " + java.util.Base64.getEncoder().encodeToString("admin:password".getBytes()));
            headers.set("Cookie", "session=test-session");

            // Create request entity with headers
            org.springframework.http.HttpEntity<?> requestEntity = new org.springframework.http.HttpEntity<>(headers);

            // Make request with headers
            ResponseEntity<String> response = restTemplate.exchange(
                API_URL,
                org.springframework.http.HttpMethod.GET,
                requestEntity,
                String.class
            );
            System.out.println("\nResponse Status Code: " + response.getStatusCode());
            System.out.println("Response Body:");
            System.out.println(response.getBody());

        } catch (Exception e) {
            System.out.println("\nError occurred:");
            if (e.getMessage() != null) {
                System.out.println(e.getMessage());
            }
            System.out.println("\nStack trace:");
            e.printStackTrace();
        }

        System.out.println("\n=== Test Completed ===");
    }

    public static void main(String[] args) {
        listAllProjects();
    }
}
