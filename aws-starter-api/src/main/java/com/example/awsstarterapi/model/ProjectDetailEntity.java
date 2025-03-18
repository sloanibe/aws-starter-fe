package com.example.awsstarterapi.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "project_details")
public class ProjectDetailEntity {
    @Id
    private String id;
    private String name;
    private String description;
    private String status;
    private String color;
    private int progress;
    private List<Task> tasks;
    private List<String> members;
    private List<Activity> activities;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static class Task {
        private String id;
        private String name;
        private String description;
        private String status;
        private String priority;
        private String assignee;
        private LocalDateTime dueDate;
        private List<String> comments;

        public Task() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getAssignee() { return assignee; }
        public void setAssignee(String assignee) { this.assignee = assignee; }
        public LocalDateTime getDueDate() { return dueDate; }
        public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
        public List<String> getComments() { return comments; }
        public void setComments(List<String> comments) { this.comments = comments; }
    }

    public static class Activity {
        private String id;
        private String user;
        private String action;
        private LocalDateTime timestamp;

        public Activity() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getUser() { return user; }
        public void setUser(String user) { this.user = user; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }

    public ProjectDetailEntity() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }
    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }
    public List<String> getMembers() { return members; }
    public void setMembers(List<String> members) { this.members = members; }
    public List<Activity> getActivities() { return activities; }
    public void setActivities(List<Activity> activities) { this.activities = activities; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
