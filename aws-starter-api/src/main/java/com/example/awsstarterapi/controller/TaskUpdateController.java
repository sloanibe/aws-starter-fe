package com.example.awsstarterapi.controller;

import com.example.awsstarterapi.model.TaskUpdate;
import com.example.awsstarterapi.repository.TaskUpdateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/task-updates")
public class TaskUpdateController extends BaseController {

    @Autowired
    private TaskUpdateRepository taskUpdateRepository;

    @GetMapping
    public ResponseEntity<List<TaskUpdate>> getAllTaskUpdates() {
        return success(taskUpdateRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskUpdate> getTaskUpdateById(@PathVariable String id) {
        return taskUpdateRepository.findById(id)
                .map(this::success)
                .orElseGet(this::notFound);
    }

    @PostMapping
    public ResponseEntity<TaskUpdate> createTaskUpdate(@RequestBody TaskUpdate taskUpdate) {
        taskUpdate.setTimestamp(LocalDateTime.now());
        return created(taskUpdateRepository.save(taskUpdate));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskUpdate> updateTaskUpdate(@PathVariable String id, @RequestBody TaskUpdate taskUpdateDetails) {
        return taskUpdateRepository.findById(id)
                .map(existingUpdate -> {
                    if (taskUpdateDetails.getContent() != null) {
                        existingUpdate.setContent(taskUpdateDetails.getContent());
                    }
                    return success(taskUpdateRepository.save(existingUpdate));
                })
                .orElseGet(this::notFound);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTaskUpdate(@PathVariable String id) {
        return taskUpdateRepository.findById(id)
                .map(taskUpdate -> {
                    taskUpdateRepository.deleteById(id);
                    return noContent();
                })
                .orElseGet(this::notFound);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TaskUpdate>> getUpdatesByTaskId(@PathVariable String taskId) {
        return success(taskUpdateRepository.findByTaskId(taskId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TaskUpdate>> getUpdatesByUserId(@PathVariable String userId) {
        return success(taskUpdateRepository.findByUserId(userId));
    }

    @GetMapping("/between")
    public ResponseEntity<List<TaskUpdate>> getUpdatesBetweenDates(
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {
        return success(taskUpdateRepository.findByTimestampBetween(start, end));
    }
}
