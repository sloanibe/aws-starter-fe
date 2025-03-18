package com.example.awsstarterapi.config;

import com.example.awsstarterapi.model.ProjectEntity;
import com.example.awsstarterapi.repository.ProjectRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(ProjectRepository projectRepository) {
        return args -> {
            // Clear existing data
            projectRepository.deleteAll();

            // Create mock projects
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

            // Save all projects
            projectRepository.saveAll(Arrays.asList(awsStarter, taskManager, documentation, apiDevelopment));
            
            System.out.println("Database has been seeded with mock projects!");
        };
    }
}
