package com.example.awsstarterapi.scripts;

import com.example.awsstarterapi.model.ProjectEntity;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Scanner;

public class ProjectSeeder {
    private static final String API_URL = "https://tylsa7bs12.execute-api.us-west-1.amazonaws.com/prod/api/projects";
    private static final RestTemplate restTemplate = new RestTemplate();

    private static void clearAllProjects() {
        System.out.println("Fetching all projects...");
        ResponseEntity<List<ProjectEntity>> response = restTemplate.exchange(
            API_URL,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<ProjectEntity>>() {}
        );

        List<ProjectEntity> projects = response.getBody();
        if (projects != null) {
            System.out.println("Found " + projects.size() + " projects to delete");
            for (ProjectEntity project : projects) {
                try {
                    restTemplate.delete(API_URL + "/" + project.getId());
                    System.out.println("Deleted project: " + project.getName());
                } catch (Exception e) {
                    System.err.println("Error deleting project " + project.getName() + ": " + e.getMessage());
                }
            }
        }
        System.out.println("Finished clearing projects!");
    }

    private static void seedProjects() {
        System.out.println("Starting to seed projects...");

        // AWS Starter Project
        ProjectEntity awsStarter = new ProjectEntity();
        awsStarter.setName("AWS Starter");
        awsStarter.setDescription("AWS infrastructure and application deployment project");
        awsStarter.setStatus("ACTIVE");
        awsStarter.setColor("#4caf50");
        awsStarter.setCreatedAt(LocalDateTime.parse("2025-02-10T09:00:00"));
        awsStarter.setUpdatedAt(LocalDateTime.parse("2025-03-12T14:30:00"));
        awsStarter.setMembers(Arrays.asList(
            new ProjectEntity.ProjectMember("user-1", "John Doe", "Owner", LocalDateTime.now()),
            new ProjectEntity.ProjectMember("user-2", "Jane Smith", "Member", LocalDateTime.now())
        ));
        awsStarter.setTasks(Arrays.asList(
            new ProjectEntity.TaskReference("task-1", "Set up VPC", "Done"),
            new ProjectEntity.TaskReference("task-2", "Configure CI/CD", "In Progress")
        ));

        // Task Manager Project
        ProjectEntity taskManager = new ProjectEntity();
        taskManager.setName("Task Manager");
        taskManager.setDescription("Project management system with task tracking");
        taskManager.setStatus("ACTIVE");
        taskManager.setColor("#2196f3");
        taskManager.setCreatedAt(LocalDateTime.parse("2025-02-15T11:30:00"));
        taskManager.setUpdatedAt(LocalDateTime.parse("2025-03-10T16:45:00"));
        taskManager.setMembers(Collections.singletonList(
            new ProjectEntity.ProjectMember("user-1", "John Doe", "Owner", LocalDateTime.now())
        ));
        taskManager.setTasks(Collections.singletonList(
            new ProjectEntity.TaskReference("task-3", "Design UI Components", "In Progress")
        ));

        // Documentation Project
        ProjectEntity documentation = new ProjectEntity();
        documentation.setName("Documentation");
        documentation.setDescription("Technical documentation and user guides");
        documentation.setStatus("COMPLETED");
        documentation.setColor("#ff9800");
        documentation.setCreatedAt(LocalDateTime.parse("2025-01-20T10:15:00"));
        documentation.setUpdatedAt(LocalDateTime.parse("2025-02-28T15:20:00"));
        documentation.setMembers(Collections.singletonList(
            new ProjectEntity.ProjectMember("user-2", "Jane Smith", "Owner", LocalDateTime.now())
        ));
        documentation.setTasks(Collections.emptyList());

        // API Development Project
        ProjectEntity apiDevelopment = new ProjectEntity();
        apiDevelopment.setName("API Development");
        apiDevelopment.setDescription("RESTful API development with Spring Boot");
        apiDevelopment.setStatus("ACTIVE");
        apiDevelopment.setColor("#f44336");
        apiDevelopment.setCreatedAt(LocalDateTime.parse("2025-03-01T08:00:00"));
        apiDevelopment.setUpdatedAt(LocalDateTime.parse("2025-03-14T12:00:00"));
        apiDevelopment.setMembers(Arrays.asList(
            new ProjectEntity.ProjectMember("user-1", "John Doe", "Owner", LocalDateTime.now()),
            new ProjectEntity.ProjectMember("user-2", "Jane Smith", "Member", LocalDateTime.now())
        ));
        apiDevelopment.setTasks(Collections.singletonList(
            new ProjectEntity.TaskReference("task-4", "Implement Auth", "In Progress")
        ));

        ProjectEntity[] projects = {awsStarter, taskManager, documentation, apiDevelopment};

        // Create each project using the API
        for (ProjectEntity project : projects) {
            try {
                ResponseEntity<ProjectEntity> response = restTemplate.postForEntity(API_URL, project, ProjectEntity.class);
                if (response.getStatusCode().is2xxSuccessful()) {
                    System.out.println("Successfully created project: " + project.getName());
                } else {
                    System.out.println("Failed to create project: " + project.getName());
                }
            } catch (Exception e) {
                System.err.println("Error creating project " + project.getName() + ": " + e.getMessage());
            }
        }

        System.out.println("Finished seeding projects!");
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("What would you like to do?");
        System.out.println("1. Clear all projects");
        System.out.println("2. Seed projects");
        System.out.println("3. Clear and seed projects");
        System.out.print("Enter your choice (1-3): ");
        
        int choice = scanner.nextInt();
        switch (choice) {
            case 1:
                clearAllProjects();
                break;
            case 2:
                seedProjects();
                break;
            case 3:
                clearAllProjects();
                seedProjects();
                break;
            default:
                System.out.println("Invalid choice!");
        }
        scanner.close();
    }
}
