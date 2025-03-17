package com.example.awsstarterapi.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "users")
public class UserEntity {
    @Id
    private String id;
    private String username;
    private String displayName;
    private String email;
    private String organization;
    private String avatar;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private List<ProjectReference> projects;
    private List<ProjectMembership> projectMemberships;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public List<ProjectReference> getProjects() {
        return projects;
    }

    public void setProjects(List<ProjectReference> projects) {
        this.projects = projects;
    }

    public List<ProjectMembership> getProjectMemberships() {
        return projectMemberships;
    }

    public void setProjectMemberships(List<ProjectMembership> projectMemberships) {
        this.projectMemberships = projectMemberships;
    }

    public static class ProjectReference {
        private String projectId;
        private String name;
        private String role;

        public String getProjectId() {
            return projectId;
        }

        public void setProjectId(String projectId) {
            this.projectId = projectId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }

    public static class ProjectMembership {
        private String projectId;
        private String role;
        private LocalDateTime joinedAt;

        public ProjectMembership() {}

        public ProjectMembership(String projectId, String role, LocalDateTime joinedAt) {
            this.projectId = projectId;
            this.role = role;
            this.joinedAt = joinedAt;
        }

        public String getProjectId() {
            return projectId;
        }

        public void setProjectId(String projectId) {
            this.projectId = projectId;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public LocalDateTime getJoinedAt() {
            return joinedAt;
        }

        public void setJoinedAt(LocalDateTime joinedAt) {
            this.joinedAt = joinedAt;
        }
    }
}
