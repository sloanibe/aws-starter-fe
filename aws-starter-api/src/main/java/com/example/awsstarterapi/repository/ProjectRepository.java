package com.example.awsstarterapi.repository;

import com.example.awsstarterapi.model.ProjectEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends MongoRepository<ProjectEntity, String> {
    List<ProjectEntity> findByMembersUserId(String userId);
    List<ProjectEntity> findByMembersRole(String role);
    List<ProjectEntity> findByStatus(String status);
    List<ProjectEntity> findByTasksTaskId(String taskId);
    List<ProjectEntity> findByTasksStatus(String status);
    List<ProjectEntity> findByNameContainingIgnoreCase(String name);
    List<ProjectEntity> findByDescriptionContainingIgnoreCase(String description);
}
