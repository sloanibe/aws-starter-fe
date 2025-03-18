package com.example.awsstarterapi.controller;

import com.example.awsstarterapi.model.ProjectEntity;
import com.example.awsstarterapi.model.ProjectDetailEntity;
import com.example.awsstarterapi.repository.ProjectRepository;
import com.example.awsstarterapi.repository.ProjectDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/projects")
public class ProjectController extends BaseController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectDetailRepository projectDetailRepository;

    @GetMapping
    public ResponseEntity<List<ProjectEntity>> getAllProjects() {
        return success(projectRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectEntity> getProjectById(@PathVariable String id) {
        return projectRepository.findById(id)
                .map(this::success)
                .orElseGet(this::notFound);
    }

    @PostMapping
    public ResponseEntity<ProjectEntity> createProject(@RequestBody ProjectEntity project) {
        // Save the project first
        ProjectEntity savedProject = projectRepository.save(project);

        // Create and save the project details
        ProjectDetailEntity projectDetail = new ProjectDetailEntity();
        projectDetail.setId(savedProject.getId());
        projectDetail.setName(savedProject.getName());
        projectDetail.setDescription(savedProject.getDescription());
        projectDetail.setStatus(savedProject.getStatus());
        projectDetail.setColor(savedProject.getColor());
        projectDetail.setProgress(0); // Start with 0 progress
        // Convert member objects to member IDs
        List<String> memberIds = savedProject.getMembers().stream()
            .map(member -> member.getUserId())
            .collect(Collectors.toList());
        projectDetail.setMembers(memberIds);
        projectDetail.setTasks(new ArrayList<>());
        projectDetail.setActivities(new ArrayList<>());
        
        LocalDateTime now = LocalDateTime.now();
        projectDetail.setCreatedAt(now);
        projectDetail.setUpdatedAt(now);

        projectDetailRepository.save(projectDetail);

        return created(savedProject);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectEntity> updateProject(@PathVariable String id, @RequestBody ProjectEntity projectDetails) {
        return projectRepository.findById(id)
                .map(existingProject -> {
                    if (projectDetails.getName() != null) {
                        existingProject.setName(projectDetails.getName());
                    }
                    if (projectDetails.getDescription() != null) {
                        existingProject.setDescription(projectDetails.getDescription());
                    }
                    if (projectDetails.getStatus() != null) {
                        existingProject.setStatus(projectDetails.getStatus());
                    }
                    return success(projectRepository.save(existingProject));
                })
                .orElseGet(this::notFound);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable String id) {
        return projectRepository.findById(id)
                .map(project -> {
                    projectRepository.deleteById(id);
                    return noContent();
                })
                .orElseGet(this::notFound);
    }
}
