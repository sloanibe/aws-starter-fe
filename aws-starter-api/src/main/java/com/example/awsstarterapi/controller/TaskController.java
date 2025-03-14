package com.example.awsstarterapi.controller;

import com.example.awsstarterapi.model.TaskEntity;
import com.example.awsstarterapi.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://aws-starter-app.s3-website-us-west-1.amazonaws.com",
    "https://d23g2ah1oukxrw.cloudfront.net",
    "https://sloandev.net",
    "https://www.sloandev.net",
    "https://api.sloandev.net"
})
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    // Get all tasks
    @GetMapping
    public List<TaskEntity> getAllTasks() {
        return taskRepository.findAll();
    }

    // Get task by ID
    @GetMapping("/{id}")
    public ResponseEntity<TaskEntity> getTaskById(@PathVariable String id) {
        Optional<TaskEntity> task = taskRepository.findById(id);
        if (task.isPresent()) {
            return ResponseEntity.ok(task.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Create a new task
    @PostMapping
    public ResponseEntity<TaskEntity> createTask(@RequestBody TaskEntity task) {
        // Set creation and update timestamps
        if (task.getCreatedAt() == null) {
            task.setCreatedAt(LocalDateTime.now());
        }
        task.setUpdatedAt(LocalDateTime.now());
        
        // Ensure status is valid
        if (task.getStatus() == null || task.getStatus().isEmpty()) {
            task.setStatus("TODO");
        }
        
        // Ensure priority is valid
        if (task.getPriority() == null || task.getPriority().isEmpty()) {
            task.setPriority("MEDIUM");
        }
        
        TaskEntity savedTask = taskRepository.save(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTask);
    }

    // Update an existing task
    @PutMapping("/{id}")
    public ResponseEntity<TaskEntity> updateTask(@PathVariable String id, @RequestBody TaskEntity taskDetails) {
        Optional<TaskEntity> optionalTask = taskRepository.findById(id);
        
        if (optionalTask.isPresent()) {
            TaskEntity existingTask = optionalTask.get();
            
            // Update fields if they are provided
            if (taskDetails.getTitle() != null) {
                existingTask.setTitle(taskDetails.getTitle());
            }
            
            if (taskDetails.getDescription() != null) {
                existingTask.setDescription(taskDetails.getDescription());
            }
            
            if (taskDetails.getStatus() != null) {
                existingTask.setStatus(taskDetails.getStatus());
            }
            
            if (taskDetails.getPriority() != null) {
                existingTask.setPriority(taskDetails.getPriority());
            }
            
            if (taskDetails.getDueDate() != null) {
                existingTask.setDueDate(taskDetails.getDueDate());
            }
            
            if (taskDetails.getCategory() != null) {
                existingTask.setCategory(taskDetails.getCategory());
            }
            
            // Always update the updatedAt timestamp
            existingTask.setUpdatedAt(LocalDateTime.now());
            
            // Save the updated task
            TaskEntity updatedTask = taskRepository.save(existingTask);
            return ResponseEntity.ok(updatedTask);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a task
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        Optional<TaskEntity> task = taskRepository.findById(id);
        
        if (task.isPresent()) {
            taskRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Get tasks by status
    @GetMapping("/status/{status}")
    public List<TaskEntity> getTasksByStatus(@PathVariable String status) {
        return taskRepository.findByStatus(status);
    }

    // Get tasks by priority
    @GetMapping("/priority/{priority}")
    public List<TaskEntity> getTasksByPriority(@PathVariable String priority) {
        return taskRepository.findByPriority(priority);
    }

    // Get tasks by category
    @GetMapping("/category/{category}")
    public List<TaskEntity> getTasksByCategory(@PathVariable String category) {
        return taskRepository.findByCategory(category);
    }

    // Get completed tasks
    @GetMapping("/completed")
    public List<TaskEntity> getCompletedTasks() {
        return taskRepository.findByCompleted(true);
    }

    // Get incomplete tasks
    @GetMapping("/incomplete")
    public List<TaskEntity> getIncompleteTasks() {
        return taskRepository.findByCompleted(false);
    }

    // Toggle task completion status
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TaskEntity> toggleTaskCompletion(@PathVariable String id) {
        Optional<TaskEntity> optionalTask = taskRepository.findById(id);
        
        if (optionalTask.isPresent()) {
            TaskEntity task = optionalTask.get();
            task.setCompleted(!task.isCompleted());
            task.setUpdatedAt(LocalDateTime.now());
            
            TaskEntity updatedTask = taskRepository.save(task);
            return ResponseEntity.ok(updatedTask);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Search tasks by title or description
    @GetMapping("/search")
    public List<TaskEntity> searchTasks(@RequestParam String query) {
        List<TaskEntity> titleResults = taskRepository.findByTitleContainingIgnoreCase(query);
        List<TaskEntity> descriptionResults = taskRepository.findByDescriptionContainingIgnoreCase(query);
        
        // Combine results, removing duplicates
        titleResults.removeAll(descriptionResults);
        titleResults.addAll(descriptionResults);
        
        return titleResults;
    }
}
