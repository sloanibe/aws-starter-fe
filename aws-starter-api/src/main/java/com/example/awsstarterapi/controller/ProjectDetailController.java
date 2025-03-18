package com.example.awsstarterapi.controller;

import com.example.awsstarterapi.model.ProjectDetailEntity;
import com.example.awsstarterapi.repository.ProjectDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/project-details")
public class ProjectDetailController {
    @Autowired
    private ProjectDetailRepository projectDetailRepository;

    @GetMapping
    public ResponseEntity<List<ProjectDetailEntity>> getAllProjectDetails() {
        return ResponseEntity.ok(projectDetailRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDetailEntity> getProjectDetail(@PathVariable String id) {
        return projectDetailRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ProjectDetailEntity> createProjectDetail(@RequestBody ProjectDetailEntity projectDetail) {
        return ResponseEntity.ok(projectDetailRepository.save(projectDetail));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProjectDetail(@PathVariable String id) {
        if (!projectDetailRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        projectDetailRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
