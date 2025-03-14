# MongoDB Data Model for Project Management System

## Overview

This document describes the MongoDB data model used in our project management system and how it integrates with Spring Data MongoDB. The system is designed to support project-centric task management with team collaboration features.

## Data Model

Our MongoDB database consists of five main collections, each representing a core entity in our system. The diagram below illustrates the relationships between these collections:

```
┌─────────────┐       ┌───────────────────┐       ┌─────────────┐
│             │       │                   │       │             │
│   Users     │◄──────┤  Project Members  ├───────►  Projects   │
│             │       │                   │       │             │
└─────┬───────┘       └───────────────────┘       └──────┬──────┘
      │                                                  │
      │                                                  │
      │                                                  │
      │                                                  │
      ▼                                                  ▼
┌─────────────┐                                   ┌─────────────┐
│             │                                   │             │
│    Tasks    │◄──────────────────────────────────┤             │
│             │                                   │             │
└─────┬───────┘                                   └─────────────┘
      │
      │
      │
      ▼
┌─────────────┐
│             │
│Task Updates │
│             │
└─────────────┘
```

### Collections and Document Structures

#### 1. `users` Collection

Stores information about system users.

```json
{
  "_id": "ObjectId()",
  "username": "jsmith",
  "displayName": "John Smith",
  "email": "john.smith@example.com",
  "avatar": "https://example.com/avatars/jsmith.jpg",
  "role": "Member",
  "createdAt": "ISODate()",
  "lastLogin": "ISODate()"
}
```

#### 2. `projects` Collection

Stores information about projects.

```json
{
  "_id": "ObjectId()",
  "name": "Website Redesign",
  "description": "Redesign company website with new branding",
  "status": "Active",
  "color": "#4287f5",
  "createdAt": "ISODate()",
  "updatedAt": "ISODate()"
}
```

#### 3. `project_members` Collection

Manages the many-to-many relationship between projects and users, including role information.

```json
{
  "_id": "ObjectId()",
  "projectId": "ObjectId()",
  "userId": "ObjectId()",
  "role": "Owner",
  "joinedAt": "ISODate()"
}
```

#### 4. `tasks` Collection

Stores task information, including project association and user assignments.

```json
{
  "_id": "ObjectId()",
  "projectId": "ObjectId()",
  "title": "Create homepage mockup",
  "description": "Design a mockup for the new homepage based on brand guidelines",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "ISODate()",
  "category": "Design",
  "assigneeId": "ObjectId()",
  "reporterId": "ObjectId()",
  "createdAt": "ISODate()",
  "updatedAt": "ISODate()",
  "completed": false
}
```

#### 5. `task_updates` Collection

Stores progress updates, comments, and status changes for tasks.

```json
{
  "_id": "ObjectId()",
  "taskId": "ObjectId()",
  "userId": "ObjectId()",
  "content": "Completed the initial wireframe, waiting for feedback before proceeding to high-fidelity mockup",
  "type": "Progress Update",
  "timestamp": "ISODate()",
  "attachments": [
    "https://example.com/files/wireframe-v1.png"
  ]
}
```

## Key Relationships

### 1. Projects to Tasks (One-to-Many)
- Each task belongs to exactly one project
- A project can have multiple tasks
- Implemented via the `projectId` field in the `tasks` collection

### 2. Users to Tasks (Many-to-Many)
- A user can be assigned to multiple tasks (via `assigneeId`)
- A user can report/create multiple tasks (via `reporterId`)
- A task has exactly one assignee and one reporter

### 3. Projects to Users (Many-to-Many)
- A user can be a member of multiple projects
- A project can have multiple user members
- Implemented through the `project_members` collection
- Includes role information for each membership

### 4. Tasks to Updates (One-to-Many)
- Each task can have multiple updates/comments
- Each update belongs to exactly one task
- Implemented via the `taskId` field in the `task_updates` collection

## Spring Data MongoDB Integration

### Entity Classes

Our Java entity classes use Spring Data MongoDB annotations to map to MongoDB documents:

#### UserEntity.java
```java
@Document(collection = "users")
public class UserEntity {
    @Id
    private String id;
    private String username;
    private String displayName;
    private String email;
    private String avatar;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    
    // Getters and setters
}
```

#### ProjectEntity.java
```java
@Document(collection = "projects")
public class ProjectEntity {
    @Id
    private String id;
    private String name;
    private String description;
    private String status;
    private String color;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Getters and setters
}
```

#### ProjectMemberEntity.java
```java
@Document(collection = "project_members")
public class ProjectMemberEntity {
    @Id
    private String id;
    private String projectId;
    private String userId;
    private String role;
    private LocalDateTime joinedAt;
    
    // Getters and setters
}
```

#### TaskEntity.java
```java
@Document(collection = "tasks")
public class TaskEntity {
    @Id
    private String id;
    private String projectId;
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDateTime dueDate;
    private String category;
    private String assigneeId;
    private String reporterId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean completed;
    
    // Getters and setters
}
```

#### TaskUpdateEntity.java
```java
@Document(collection = "task_updates")
public class TaskUpdateEntity {
    @Id
    private String id;
    private String taskId;
    private String userId;
    private String content;
    private String type;
    private LocalDateTime timestamp;
    private List<String> attachments;
    
    // Getters and setters
}
```

### Repository Interfaces

We use Spring Data MongoDB repositories to interact with our collections:

#### UserRepository.java
```java
public interface UserRepository extends MongoRepository<UserEntity, String> {
    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email);
    List<UserEntity> findByRole(String role);
}
```

#### ProjectRepository.java
```java
public interface ProjectRepository extends MongoRepository<ProjectEntity, String> {
    List<ProjectEntity> findByStatus(String status);
    List<ProjectEntity> findByNameContainingIgnoreCase(String nameFragment);
}
```

#### ProjectMemberRepository.java
```java
public interface ProjectMemberRepository extends MongoRepository<ProjectMemberEntity, String> {
    List<ProjectMemberEntity> findByProjectId(String projectId);
    List<ProjectMemberEntity> findByUserId(String userId);
    Optional<ProjectMemberEntity> findByProjectIdAndUserId(String projectId, String userId);
    void deleteByProjectIdAndUserId(String projectId, String userId);
}
```

#### TaskRepository.java
```java
public interface TaskRepository extends MongoRepository<TaskEntity, String> {
    List<TaskEntity> findByProjectId(String projectId);
    List<TaskEntity> findByAssigneeId(String assigneeId);
    List<TaskEntity> findByReporterId(String reporterId);
    List<TaskEntity> findByStatus(String status);
    List<TaskEntity> findByPriority(String priority);
    List<TaskEntity> findByCategory(String category);
    List<TaskEntity> findByProjectIdAndStatus(String projectId, String status);
    List<TaskEntity> findByDueDateBefore(LocalDateTime date);
    List<TaskEntity> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String titleFragment, String descriptionFragment);
}
```

#### TaskUpdateRepository.java
```java
public interface TaskUpdateRepository extends MongoRepository<TaskUpdateEntity, String> {
    List<TaskUpdateEntity> findByTaskId(String taskId);
    List<TaskUpdateEntity> findByTaskIdOrderByTimestampDesc(String taskId);
    List<TaskUpdateEntity> findByUserId(String userId);
    List<TaskUpdateEntity> findByType(String type);
}
```

## MongoDB Indexes

To optimize query performance, we define the following indexes:

```java
@Configuration
public class MongoIndexConfig {

    @Autowired
    private MongoTemplate mongoTemplate;
    
    @PostConstruct
    public void initIndexes() {
        // User indexes
        mongoTemplate.indexOps(UserEntity.class)
            .ensureIndex(new Index().on("username", Sort.Direction.ASC).unique());
        mongoTemplate.indexOps(UserEntity.class)
            .ensureIndex(new Index().on("email", Sort.Direction.ASC).unique());
            
        // Task indexes
        mongoTemplate.indexOps(TaskEntity.class)
            .ensureIndex(new Index().on("projectId", Sort.Direction.ASC));
        mongoTemplate.indexOps(TaskEntity.class)
            .ensureIndex(new Index().on("assigneeId", Sort.Direction.ASC));
        mongoTemplate.indexOps(TaskEntity.class)
            .ensureIndex(new Index().on("status", Sort.Direction.ASC));
        mongoTemplate.indexOps(TaskEntity.class)
            .ensureIndex(new Index().on("dueDate", Sort.Direction.ASC));
            
        // Project Member indexes
        mongoTemplate.indexOps(ProjectMemberEntity.class)
            .ensureIndex(new Index().on("projectId", Sort.Direction.ASC));
        mongoTemplate.indexOps(ProjectMemberEntity.class)
            .ensureIndex(new Index().on("userId", Sort.Direction.ASC));
        mongoTemplate.indexOps(ProjectMemberEntity.class)
            .ensureIndex(new Index().on("projectId", Sort.Direction.ASC)
                .on("userId", Sort.Direction.ASC).unique());
                
        // Task Update indexes
        mongoTemplate.indexOps(TaskUpdateEntity.class)
            .ensureIndex(new Index().on("taskId", Sort.Direction.ASC));
        mongoTemplate.indexOps(TaskUpdateEntity.class)
            .ensureIndex(new Index().on("timestamp", Sort.Direction.DESC));
    }
}
```

## Data Validation

We use MongoDB's schema validation to ensure data integrity:

```java
@Configuration
public class MongoValidationConfig {

    @Autowired
    private MongoTemplate mongoTemplate;
    
    @PostConstruct
    public void initValidation() {
        // Example validation for tasks collection
        Document taskValidation = new Document();
        taskValidation.append("$jsonSchema", new Document()
            .append("bsonType", "object")
            .append("required", Arrays.asList("projectId", "title", "status", "priority"))
            .append("properties", new Document()
                .append("projectId", new Document().append("bsonType", "string"))
                .append("title", new Document().append("bsonType", "string"))
                .append("status", new Document()
                    .append("bsonType", "string")
                    .append("enum", Arrays.asList("TODO", "IN_PROGRESS", "DONE")))
                .append("priority", new Document()
                    .append("bsonType", "string")
                    .append("enum", Arrays.asList("HIGH", "MEDIUM", "LOW")))
            )
        );
        
        mongoTemplate.getDb().runCommand(new Document()
            .append("collMod", "tasks")
            .append("validator", taskValidation)
            .append("validationLevel", "moderate")
        );
        
        // Similar validation can be added for other collections
    }
}
```

## Service Layer Integration

Our service layer uses the repositories to provide business logic:

```java
@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private TaskUpdateRepository taskUpdateRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Create a new task
    public TaskEntity createTask(TaskEntity task) {
        // Validate project exists
        projectRepository.findById(task.getProjectId())
            .orElseThrow(() -> new EntityNotFoundException("Project not found"));
            
        // Validate assignee exists if provided
        if (task.getAssigneeId() != null) {
            userRepository.findById(task.getAssigneeId())
                .orElseThrow(() -> new EntityNotFoundException("Assignee not found"));
        }
        
        // Set creation timestamp
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        
        return taskRepository.save(task);
    }
    
    // Add a status update to a task
    public TaskUpdateEntity addTaskUpdate(String taskId, TaskUpdateEntity update) {
        // Validate task exists
        TaskEntity task = taskRepository.findById(taskId)
            .orElseThrow(() -> new EntityNotFoundException("Task not found"));
            
        // Set task ID and timestamp
        update.setTaskId(taskId);
        update.setTimestamp(LocalDateTime.now());
        
        // If this is a status change update, update the task status
        if ("Status Change".equals(update.getType())) {
            task.setStatus(update.getContent());
            task.setUpdatedAt(LocalDateTime.now());
            taskRepository.save(task);
        }
        
        return taskUpdateRepository.save(update);
    }
    
    // Get all updates for a task
    public List<TaskUpdateEntity> getTaskUpdates(String taskId) {
        return taskUpdateRepository.findByTaskIdOrderByTimestampDesc(taskId);
    }
    
    // Additional service methods...
}
```

## Conclusion

This MongoDB data model provides a flexible and scalable foundation for our project management system. By leveraging Spring Data MongoDB, we can easily interact with our collections using a clean, object-oriented approach. The document-based nature of MongoDB allows us to efficiently store and query related data, while the schema validation ensures data integrity.

As the application evolves, we can extend this model to support additional features such as file attachments, notifications, or more complex project structures, without significant changes to the existing schema.
