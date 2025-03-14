package com.example.awsstarterapi.repository;

import com.example.awsstarterapi.model.TaskEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface TaskRepository extends MongoRepository<TaskEntity, String> {
    // Find tasks by status
    List<TaskEntity> findByStatus(String status);
    
    // Find tasks by priority
    List<TaskEntity> findByPriority(String priority);
    
    // Find tasks by category
    List<TaskEntity> findByCategory(String category);
    
    // Find tasks by completion status
    List<TaskEntity> findByCompleted(boolean completed);
    
    // Find tasks due before a specific date
    List<TaskEntity> findByDueDateBefore(LocalDateTime date);
    
    // Find tasks due after a specific date
    List<TaskEntity> findByDueDateAfter(LocalDateTime date);
    
    // Find tasks by title containing a specific string (case-insensitive)
    List<TaskEntity> findByTitleContainingIgnoreCase(String titleFragment);
    
    // Find tasks by description containing a specific string (case-insensitive)
    List<TaskEntity> findByDescriptionContainingIgnoreCase(String descriptionFragment);
    
    // Find tasks by category and status
    List<TaskEntity> findByCategoryAndStatus(String category, String status);
    
    // Find tasks by priority and status
    List<TaskEntity> findByPriorityAndStatus(String priority, String status);
}
