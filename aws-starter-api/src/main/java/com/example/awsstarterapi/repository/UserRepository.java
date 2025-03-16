package com.example.awsstarterapi.repository;

import com.example.awsstarterapi.model.UserEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<UserEntity, String> {
    List<UserEntity> findByProjectMembershipsProjectId(String projectId);
    List<UserEntity> findByProjectMembershipsRole(String role);
    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);
    List<UserEntity> findByAssignedTasksTaskId(String taskId);
    List<UserEntity> findByCreatedTasksTaskId(String taskId);
}
