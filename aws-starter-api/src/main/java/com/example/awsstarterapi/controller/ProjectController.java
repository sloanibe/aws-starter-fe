package com.example.awsstarterapi.controller;

import com.example.awsstarterapi.model.ProjectEntity;
import com.example.awsstarterapi.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController extends BaseController {

    @Autowired
    private ProjectRepository projectRepository;

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
        return created(projectRepository.save(project));
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
