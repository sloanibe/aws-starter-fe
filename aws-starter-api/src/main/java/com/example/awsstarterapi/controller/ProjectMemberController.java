package com.example.awsstarterapi.controller;

import com.example.awsstarterapi.model.ProjectEntity.ProjectMember;
import com.example.awsstarterapi.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects/{projectId}/members")
public class ProjectMemberController extends BaseController {

    @Autowired
    private ProjectRepository projectRepository;

    @GetMapping
    public ResponseEntity<List<ProjectMember>> getProjectMembers(@PathVariable String projectId) {
        return projectRepository.findById(projectId)
                .map(project -> ResponseEntity.ok().body(project.getMembers()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ProjectMember> addProjectMember(
            @PathVariable String projectId,
            @RequestBody ProjectMember member) {
        return projectRepository.findById(projectId)
                .map(project -> {
                    project.getMembers().add(member);
                    projectRepository.save(project);
                    return ResponseEntity.status(201).body(member);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateProjectMemberRole(
            @PathVariable String projectId,
            @PathVariable String userId,
            @RequestParam String role) {
        return projectRepository.findById(projectId)
                .map(project -> {
                    Optional<ProjectMember> member = project.getMembers().stream()
                            .filter(m -> m.getUserId().equals(userId))
                            .findFirst();
                    if (member.isPresent()) {
                        member.get().setRole(role);
                        projectRepository.save(project);
                        return ResponseEntity.ok().body(member.get());
                    }
                    return ResponseEntity.notFound().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> removeProjectMember(
            @PathVariable String projectId,
            @PathVariable String userId) {
        return projectRepository.findById(projectId)
                .map(project -> {
                    boolean removed = project.getMembers()
                            .removeIf(member -> member.getUserId().equals(userId));
                    if (removed) {
                        projectRepository.save(project);
                        return ResponseEntity.noContent().build();
                    }
                    return ResponseEntity.notFound().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
