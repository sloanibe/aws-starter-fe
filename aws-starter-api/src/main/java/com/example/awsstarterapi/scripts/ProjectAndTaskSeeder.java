package com.example.awsstarterapi.scripts;

import com.example.awsstarterapi.model.ProjectEntity;
import com.example.awsstarterapi.model.ProjectDetailEntity;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import java.util.List;
import java.util.UUID;


public class ProjectAndTaskSeeder {

    private static final String API_BASE_URL = "https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod/api";
    private static final String API_URL = API_BASE_URL + "/projects";
    private static final String PROJECT_DETAILS_URL = API_BASE_URL + "/project-details";
    private static final RestTemplate restTemplate;

    static {
        restTemplate = new RestTemplate();
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setSupportedMediaTypes(Arrays.asList(MediaType.APPLICATION_JSON, MediaType.TEXT_HTML));
        restTemplate.getMessageConverters().add(converter);
    }

    // Project data
    private static final String[] projectNames = {
        "E-commerce Platform",
        "Mobile App Development",
        "Cloud Migration",
        "Data Analytics Dashboard"
    };

    private static final String[] projectDescriptions = {
        "Build a modern e-commerce platform with advanced features",
        "Develop a cross-platform mobile application",
        "Migrate legacy systems to cloud infrastructure",
        "Create an interactive data analytics dashboard"
    };

    private static final String[] colors = {"#4CAF50", "#2196F3", "#FF9800", "#9C27B0"};
    private static final String[] members = {"John Doe", "Jane Smith", "Bob Wilson", "Alice Brown"};

    private static void clearAndSeedData() {
        System.out.println("Clearing existing data...");
        
        // Clear projects
        ResponseEntity<List<ProjectEntity>> projectsResponse = restTemplate.exchange(
            API_URL,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<ProjectEntity>>() {}
        );

        List<ProjectEntity> projects = projectsResponse.getBody();
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

        // Clear project details
        ResponseEntity<List<ProjectDetailEntity>> detailsResponse = restTemplate.exchange(
            PROJECT_DETAILS_URL,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<ProjectDetailEntity>>() {}
        );

        List<ProjectDetailEntity> details = detailsResponse.getBody();
        if (details != null) {
            System.out.println("Found " + details.size() + " project details to delete");
            for (ProjectDetailEntity detail : details) {
                try {
                    restTemplate.delete(PROJECT_DETAILS_URL + "/" + detail.getId());
                    System.out.println("Deleted project detail: " + detail.getName());
                } catch (Exception e) {
                    System.err.println("Error deleting project detail " + detail.getName() + ": " + e.getMessage());
                }
            }
        }

        // Start seeding new data
        System.out.println("\nSeeding new projects and details...");
        seedProjects();
    }

    private static void seedProjects() {
        for (int i = 0; i < projectNames.length; i++) {
            String projectId = UUID.randomUUID().toString();
            LocalDateTime now = LocalDateTime.now();

            // Create Project
            ProjectEntity project = new ProjectEntity();
            project.setId(projectId);
            project.setName(projectNames[i]);
            project.setDescription(projectDescriptions[i]);
            project.setStatus("ACTIVE");
            project.setColor(colors[i]);
            project.setCreatedAt(now);
            project.setUpdatedAt(now);

            // Add members
            List<ProjectEntity.ProjectMember> projectMembers = new ArrayList<>();
            for (String member : members) {
                ProjectEntity.ProjectMember pm = new ProjectEntity.ProjectMember();
                pm.setUserId(UUID.randomUUID().toString());
                pm.setName(member);
                pm.setRole(member.equals(members[0]) ? "Owner" : "Member");
                pm.setJoinedAt(now);
                projectMembers.add(pm);
            }
            project.setMembers(projectMembers);

            // Create Project Detail
            ProjectDetailEntity projectDetail = new ProjectDetailEntity();
            projectDetail.setId(projectId); // Use same ID as project for foreign key
            projectDetail.setName(projectNames[i]);
            projectDetail.setDescription(projectDescriptions[i]);
            projectDetail.setStatus("ACTIVE");
            projectDetail.setColor(colors[i]);
            projectDetail.setProgress(25);
            projectDetail.setCreatedAt(now);
            projectDetail.setUpdatedAt(now);
            projectDetail.setMembers(Arrays.asList(members));

            // Create 4 tasks for each project
            List<ProjectDetailEntity.Task> tasks = new ArrayList<>();
            String[] taskNames = {
                "Planning and Requirements",
                "Design and Architecture",
                "Implementation",
                "Testing and Deployment"
            };
            String[] taskStatuses = {"To Do", "In Progress", "In Progress", "To Do"};
            String[] priorities = {"High", "Medium", "High", "Medium"};

            for (int j = 0; j < 4; j++) {
                ProjectDetailEntity.Task task = new ProjectDetailEntity.Task();
                task.setId(UUID.randomUUID().toString());
                task.setName(taskNames[j]);
                task.setDescription("Complete " + taskNames[j].toLowerCase() + " for " + projectNames[i]);
                task.setStatus(taskStatuses[j]);
                task.setPriority(priorities[j]);
                task.setAssignee(members[j]);
                task.setDueDate(now.plusWeeks(j + 1));
                task.setComments(new ArrayList<>());
                tasks.add(task);

                // Add task reference to project
                if (project.getTasks() == null) {
                    project.setTasks(new ArrayList<>());
                }
                project.getTasks().add(new ProjectEntity.TaskReference(
                    task.getId(),
                    task.getName(),
                    task.getStatus()
                ));
            }
            projectDetail.setTasks(tasks);

            // Add initial activity
            List<ProjectDetailEntity.Activity> activities = new ArrayList<>();
            ProjectDetailEntity.Activity activity = new ProjectDetailEntity.Activity();
            activity.setId(UUID.randomUUID().toString());
            activity.setUser(members[0]);
            activity.setAction("Project created");
            activity.setTimestamp(now);
            activities.add(activity);
            projectDetail.setActivities(activities);

            // Save project
            try {
                ResponseEntity<ProjectEntity> projectResponse = restTemplate.postForEntity(
                    API_URL,
                    project,
                    ProjectEntity.class
                );
                if (projectResponse.getStatusCode().is2xxSuccessful()) {
                    System.out.println("Successfully created project: " + project.getName());
                } else {
                    System.out.println("Failed to create project: " + project.getName());
                    continue;
                }
            } catch (Exception e) {
                System.err.println("Error creating project " + project.getName() + ": " + e.getMessage());
                continue;
            }

            // Save project detail
            try {
                ResponseEntity<ProjectDetailEntity> detailResponse = restTemplate.postForEntity(
                    PROJECT_DETAILS_URL,
                    projectDetail,
                    ProjectDetailEntity.class
                );
                if (detailResponse.getStatusCode().is2xxSuccessful()) {
                    System.out.println("Successfully created project detail: " + projectDetail.getName());
                } else {
                    System.out.println("Failed to create project detail: " + projectDetail.getName());
                }
            } catch (Exception e) {
                System.err.println("Error creating project detail " + projectDetail.getName() + ": " + e.getMessage());
            }
        }

        System.out.println("Finished seeding projects and details!");
    }

    public static void main(String[] args) {
        System.out.println("Starting to clear and seed data...");
        clearAndSeedData();
        System.out.println("Finished!");
    }
}
