package com.example.awsstarterapi.repository;

import com.example.awsstarterapi.model.TaskEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<TaskEntity, String> {
    List<TaskEntity> findByStatus(String status);
    List<TaskEntity> findByPriority(String priority);
    List<TaskEntity> findByProjectId(String projectId);
    List<TaskEntity> findByAssigneeId(String assigneeId);
    List<TaskEntity> findByReporterId(String reporterId);
    List<TaskEntity> findByTitleContainingIgnoreCase(String titleFragment);
    List<TaskEntity> findByDescriptionContainingIgnoreCase(String descriptionFragment);
}
