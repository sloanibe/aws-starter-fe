package com.example.awsstarterapi.scripts;

import com.example.awsstarterapi.model.ProjectDetailEntity;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;

public class ProjectDetailSeeder {
    private static final String API_URL = "https://sloandev.net/prod/api/project-details";
    private static final RestTemplate restTemplate = new RestTemplate();

    private static void clearAllProjectDetails() {
        System.out.println("Fetching all project details...");
        ResponseEntity<List<ProjectDetailEntity>> response = restTemplate.exchange(
            API_URL,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<ProjectDetailEntity>>() {}
        );

        List<ProjectDetailEntity> projectDetails = response.getBody();
        if (projectDetails != null) {
            System.out.println("Found " + projectDetails.size() + " project details to delete");
            for (ProjectDetailEntity projectDetail : projectDetails) {
                try {
                    restTemplate.delete(API_URL + "/" + projectDetail.getId());
                    System.out.println("Deleted project detail: " + projectDetail.getName());
                } catch (Exception e) {
                    System.err.println("Error deleting project detail " + projectDetail.getName() + ": " + e.getMessage());
                }
            }
        }
        System.out.println("Finished clearing project details!");
    }

    private static void seedProjectDetails() {
        System.out.println("Starting to seed project details...");

        // AWS Starter Project Detail
        ProjectDetailEntity awsStarter = new ProjectDetailEntity();
        awsStarter.setId("project-1");
        awsStarter.setName("AWS Starter");
        awsStarter.setDescription("AWS infrastructure and application deployment project with comprehensive task tracking and team collaboration features.");
        awsStarter.setStatus("ACTIVE");
        awsStarter.setColor("#4caf50");
        awsStarter.setProgress(75);
        awsStarter.setCreatedAt(LocalDateTime.parse("2025-02-10T09:00:00"));
        awsStarter.setUpdatedAt(LocalDateTime.parse("2025-03-12T14:30:00"));
        awsStarter.setMembers(Arrays.asList("John Doe", "Jane Smith", "Bob Wilson"));

        ProjectDetailEntity.Task task1 = new ProjectDetailEntity.Task();
        task1.setId("task-1");
        task1.setName("Set up VPC and Networking");
        task1.setDescription("Configure VPC, subnets, and security groups for AWS infrastructure");
        task1.setStatus("Done");
        task1.setPriority("High");
        task1.setAssignee("John Doe");
        task1.setDueDate(LocalDateTime.parse("2025-02-15T17:00:00"));
        task1.setComments(Arrays.asList(
            "Initial VPC setup completed",
            "Security groups configured for all required services"
        ));

        ProjectDetailEntity.Task task2 = new ProjectDetailEntity.Task();
        task2.setId("task-2");
        task2.setName("Configure CI/CD Pipeline");
        task2.setDescription("Set up automated build and deployment pipeline");
        task2.setStatus("In Progress");
        task2.setPriority("High");
        task2.setAssignee("Jane Smith");
        task2.setDueDate(LocalDateTime.parse("2025-03-20T17:00:00"));
        task2.setComments(Arrays.asList(
            "Jenkins server configured",
            "Working on deployment scripts"
        ));

        awsStarter.setTasks(Arrays.asList(task1, task2));

        ProjectDetailEntity.Activity activity1 = new ProjectDetailEntity.Activity();
        activity1.setId("act-1");
        activity1.setUser("John Doe");
        activity1.setAction("Completed VPC setup");
        activity1.setTimestamp(LocalDateTime.parse("2025-02-15T16:30:00"));

        ProjectDetailEntity.Activity activity2 = new ProjectDetailEntity.Activity();
        activity2.setId("act-2");
        activity2.setUser("Jane Smith");
        activity2.setAction("Started CI/CD configuration");
        activity2.setTimestamp(LocalDateTime.parse("2025-03-12T10:00:00"));

        awsStarter.setActivities(Arrays.asList(activity1, activity2));

        // Create project detail using the API
        try {
            ResponseEntity<ProjectDetailEntity> response = restTemplate.postForEntity(API_URL, awsStarter, ProjectDetailEntity.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("Successfully created project detail: " + awsStarter.getName());
            } else {
                System.out.println("Failed to create project detail: " + awsStarter.getName());
            }
        } catch (Exception e) {
            System.err.println("Error creating project detail " + awsStarter.getName() + ": " + e.getMessage());
        }

        System.out.println("Finished seeding project details!");
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("What would you like to do?");
        System.out.println("1. Clear all project details");
        System.out.println("2. Seed project details");
        System.out.println("3. Clear and seed project details");
        System.out.print("Enter your choice (1-3): ");
        
        int choice = scanner.nextInt();
        switch (choice) {
            case 1:
                clearAllProjectDetails();
                break;
            case 2:
                seedProjectDetails();
                break;
            case 3:
                clearAllProjectDetails();
                seedProjectDetails();
                break;
            default:
                System.out.println("Invalid choice!");
        }
        scanner.close();
    }
}
