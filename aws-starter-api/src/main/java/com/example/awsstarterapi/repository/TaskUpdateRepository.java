package com.example.awsstarterapi.repository;

import com.example.awsstarterapi.model.TaskUpdate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskUpdateRepository extends MongoRepository<TaskUpdate, String> {
    List<TaskUpdate> findByTaskId(String taskId);
    List<TaskUpdate> findByUserId(String userId);
    List<TaskUpdate> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
}
