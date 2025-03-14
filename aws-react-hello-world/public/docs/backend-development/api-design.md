# API Design Principles

This document outlines the RESTful API design principles and implementation details for the AWS Starter Project's project management system with task tracking capabilities.

## RESTful API Structure

Our API follows REST (Representational State Transfer) principles, providing a standardized approach to API design:

### Resource-Based URLs

APIs are organized around resources, with URLs representing resource collections or individual items:

- Collection: `/api/tasks` - Represents all tasks
- Individual: `/api/tasks/{id}` - Represents a specific task

### HTTP Methods

Standard HTTP methods are used to perform operations on resources:

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Retrieve resources | `GET /api/tasks` - Get all tasks |
| POST | Create a new resource | `POST /api/tasks` - Create a new task |
| PUT | Update a resource | `PUT /api/tasks/{id}` - Update a specific task |
| DELETE | Remove a resource | `DELETE /api/tasks/{id}` - Delete a specific task |
| PATCH | Partial update | `PATCH /api/tasks/{id}/toggle` - Toggle a specific property |

### Response Status Codes

Appropriate HTTP status codes are used to indicate the result of operations:

- 200 OK: Successful operation
- 201 Created: Resource successfully created
- 204 No Content: Successful operation with no response body
- 400 Bad Request: Invalid input
- 404 Not Found: Resource not found
- 500 Internal Server Error: Server-side error

## API Endpoints

The following endpoints are available for our project management system, organized by resource:

### 1. User Management

| Method | Endpoint | Description |
|--------|----------|-----------|
| GET | /api/users | Retrieve all users |
| GET | /api/users/{id} | Retrieve a specific user by ID |
| GET | /api/users/me | Retrieve the current authenticated user |
| POST | /api/users | Create a new user |
| PUT | /api/users/{id} | Update an existing user |
| DELETE | /api/users/{id} | Delete a user |
| GET | /api/users/{id}/tasks | Get all tasks assigned to a user |
| GET | /api/users/{id}/reported-tasks | Get all tasks reported by a user |
| GET | /api/users/{id}/projects | Get all projects a user is a member of |

### 2. Project Management

| Method | Endpoint | Description |
|--------|----------|-----------|
| GET | /api/projects | Retrieve all projects |
| GET | /api/projects/{id} | Retrieve a specific project by ID |
| POST | /api/projects | Create a new project |
| PUT | /api/projects/{id} | Update an existing project |
| DELETE | /api/projects/{id} | Delete a project |
| GET | /api/projects/{id}/tasks | Get all tasks in a project |
| GET | /api/projects/{id}/members | Get all members of a project |
| GET | /api/projects/status/{status} | Get projects by status (Active, Completed, Archived) |

### 3. Project Membership

| Method | Endpoint | Description |
|--------|----------|-----------|
| GET | /api/projects/{projectId}/members | Get all members of a project |
| GET | /api/projects/{projectId}/members/{userId} | Get specific member details |
| POST | /api/projects/{projectId}/members | Add a user to a project |
| PUT | /api/projects/{projectId}/members/{userId} | Update a member's role |
| DELETE | /api/projects/{projectId}/members/{userId} | Remove a user from a project |

### 4. Task Management

| Method | Endpoint | Description |
|--------|----------|-----------|
| GET | /api/projects/{projectId}/tasks | Get all tasks in a project |
| GET | /api/tasks/{id} | Retrieve a specific task by ID |
| POST | /api/projects/{projectId}/tasks | Create a new task in a project |
| PUT | /api/tasks/{id} | Update an existing task |
| DELETE | /api/tasks/{id} | Delete a task |
| GET | /api/tasks/status/{status} | Get tasks by status |
| GET | /api/tasks/priority/{priority} | Get tasks by priority |
| GET | /api/tasks/category/{category} | Get tasks by category |
| GET | /api/tasks/completed | Get completed tasks |
| GET | /api/tasks/incomplete | Get incomplete tasks |
| GET | /api/tasks/search?query={query} | Search tasks by title or description |
| PATCH | /api/tasks/{id}/status | Update task status |
| PATCH | /api/tasks/{id}/assignee/{userId} | Assign task to a user |

### 5. Task Updates and Comments

| Method | Endpoint | Description |
|--------|----------|-----------|
| GET | /api/tasks/{taskId}/updates | Get all updates for a task |
| GET | /api/tasks/{taskId}/updates/{updateId} | Get a specific update |
| POST | /api/tasks/{taskId}/updates | Add an update or comment to a task |
| PUT | /api/tasks/{taskId}/updates/{updateId} | Edit an update or comment |
| DELETE | /api/tasks/{taskId}/updates/{updateId} | Delete an update or comment |
| GET | /api/tasks/{taskId}/updates/type/{type} | Get updates by type (comment, status_change, etc.) |

## API Implementation in Spring Boot

In our Spring Boot application, APIs are implemented using controller classes organized by resource:

### 1. User Controller

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @GetMapping
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserEntity> getUserById(@PathVariable String id) {
        // Implementation...
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserEntity> getCurrentUser() {
        // Implementation using security context
    }
    
    @GetMapping("/{id}/tasks")
    public List<TaskEntity> getUserTasks(@PathVariable String id) {
        return taskRepository.findByAssigneeId(id);
    }
    
    // More endpoints...
}
```

### 2. Project Controller

```java
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @GetMapping
    public List<ProjectEntity> getAllProjects() {
        return projectRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectEntity> getProjectById(@PathVariable String id) {
        // Implementation...
    }
    
    @GetMapping("/{id}/tasks")
    public List<TaskEntity> getProjectTasks(@PathVariable String id) {
        return taskRepository.findByProjectId(id);
    }
    
    @GetMapping("/{id}/members")
    public List<ProjectMemberEntity> getProjectMembers(@PathVariable String id) {
        return projectMemberRepository.findByProjectId(id);
    }
    
    // More endpoints...
}
```

### 3. Task Controller

```java
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private TaskUpdateRepository taskUpdateRepository;

    @GetMapping("/{id}")
    public ResponseEntity<TaskEntity> getTaskById(@PathVariable String id) {
        // Implementation...
    }
    
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskEntity> updateTaskStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> statusUpdate) {
        // Implementation to update status and create a status update entry
    }
    
    @GetMapping("/{taskId}/updates")
    public List<TaskUpdateEntity> getTaskUpdates(@PathVariable String taskId) {
        return taskUpdateRepository.findByTaskIdOrderByTimestampDesc(taskId);
    }
    
    // More endpoints...
}
```

## API Endpoints for Task Management

The following endpoints are available for task management:

### Basic CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Retrieve all tasks |
| GET | /api/tasks/{id} | Retrieve a specific task by ID |
| POST | /api/tasks | Create a new task |
| PUT | /api/tasks/{id} | Update an existing task |
| DELETE | /api/tasks/{id} | Delete a task |

### Filtering and Searching

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks/status/{status} | Get tasks by status |
| GET | /api/tasks/priority/{priority} | Get tasks by priority |
| GET | /api/tasks/category/{category} | Get tasks by category |
| GET | /api/tasks/completed | Get completed tasks |
| GET | /api/tasks/incomplete | Get incomplete tasks |
| GET | /api/tasks/search?query={query} | Search tasks by title or description |

### Special Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | /api/tasks/{id}/toggle | Toggle task completion status |

## Request and Response Formats

All API requests and responses use JSON format:

### Example Requests and Responses

#### 1. Creating a Project

```json
POST /api/projects
{
  "name": "Project Management System",
  "description": "Develop a comprehensive project management system with task tracking",
  "status": "ACTIVE",
  "color": "#4A90E2"
}
```

Response:
```json
{
  "id": "60f7a9b8c8f9a83e5c8b4567",
  "name": "Project Management System",
  "description": "Develop a comprehensive project management system with task tracking",
  "status": "ACTIVE",
  "color": "#4A90E2",
  "createdAt": "2025-03-13T10:30:45",
  "updatedAt": "2025-03-13T10:30:45"
}
```

#### 2. Adding a User to a Project

```json
POST /api/projects/60f7a9b8c8f9a83e5c8b4567/members
{
  "userId": "60f7a9b8c8f9a83e5c8b4568",
  "role": "OWNER"
}
```

Response:
```json
{
  "id": "60f7a9b8c8f9a83e5c8b4569",
  "projectId": "60f7a9b8c8f9a83e5c8b4567",
  "userId": "60f7a9b8c8f9a83e5c8b4568",
  "role": "OWNER",
  "joinedAt": "2025-03-13T10:35:45"
}
```

#### 3. Creating a Task in a Project

```json
POST /api/projects/60f7a9b8c8f9a83e5c8b4567/tasks
{
  "title": "Complete API documentation",
  "description": "Document all API endpoints for the task tracking system",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2025-03-20T12:00:00",
  "category": "Documentation",
  "assigneeId": "60f7a9b8c8f9a83e5c8b4568",
  "reporterId": "60f7a9b8c8f9a83e5c8b4568"
}
```

Response:
```json
{
  "id": "60f7a9b8c8f9a83e5c8b4570",
  "projectId": "60f7a9b8c8f9a83e5c8b4567",
  "title": "Complete API documentation",
  "description": "Document all API endpoints for the task tracking system",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "dueDate": "2025-03-20T12:00:00",
  "category": "Documentation",
  "assigneeId": "60f7a9b8c8f9a83e5c8b4568",
  "reporterId": "60f7a9b8c8f9a83e5c8b4568",
  "createdAt": "2025-03-13T10:40:45",
  "updatedAt": "2025-03-13T10:40:45",
  "completed": false
}
```

#### 4. Adding an Update to a Task

```json
POST /api/tasks/60f7a9b8c8f9a83e5c8b4570/updates
{
  "userId": "60f7a9b8c8f9a83e5c8b4568",
  "content": "Started working on the API documentation. @john can you review my progress?",
  "type": "COMMENT"
}
```

Response:
```json
{
  "id": "60f7a9b8c8f9a83e5c8b4571",
  "taskId": "60f7a9b8c8f9a83e5c8b4570",
  "userId": "60f7a9b8c8f9a83e5c8b4568",
  "content": "Started working on the API documentation. @john can you review my progress?",
  "type": "COMMENT",
  "timestamp": "2025-03-13T11:00:45",
  "attachments": []
}
```

## CORS Configuration

Cross-Origin Resource Sharing (CORS) is configured to allow requests from specified origins:

```java
@CrossOrigin(origins = {
    "http://localhost:3000",
    "http://localhost:5173",
    "https://sloandev.net",
    "https://api.sloandev.net"
})
```

## API Versioning

While not currently implemented, future API versioning can be added using:

1. URL path versioning: `/api/v1/tasks`
2. Request header versioning: `Accept: application/vnd.company.app-v1+json`
3. Query parameter versioning: `/api/tasks?version=1`

## Error Handling

Consistent error responses are provided for all API endpoints:

```json
{
  "timestamp": "2025-03-13T10:35:22",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid task data provided",
  "path": "/api/tasks"
}
```

## API Security Considerations

### Authentication and Authorization

The API will implement JWT (JSON Web Token) based authentication:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable()
            .authorizeRequests()
            .antMatchers("/api/auth/**").permitAll()
            .antMatchers("/api/users/**").hasAnyRole("USER", "ADMIN")
            .antMatchers("/api/projects/**").hasAnyRole("USER", "ADMIN")
            .antMatchers("/api/tasks/**").hasAnyRole("USER", "ADMIN")
            .anyRequest().authenticated()
            .and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
    }
}
```

### Role-Based Access Control

Project-specific permissions will be implemented based on the user's role in each project:

| Role | Permissions |
|------|-------------|
| OWNER | Full access to project, can add/remove members, delete project |
| MEMBER | Can create/edit tasks, add comments, change task status |
| VIEWER | Read-only access to project and tasks |

### Additional Security Measures

1. Rate limiting to prevent abuse
2. Input validation to prevent injection attacks
3. HTTPS for all API communications
4. Audit logging for security-sensitive operations

## Conclusion

This API design supports the project-centric organization with user assignments and task updates as specified in our data model. The RESTful structure ensures a consistent, intuitive, and maintainable API that will scale with the application's growth.

Key features supported by this API design include:

1. Project management with status tracking and color coding
2. User assignment to tasks with reporter and assignee tracking
3. Project membership management with different roles
4. Task updates and comments with @mentions support
5. Comprehensive filtering and search capabilities

As the application evolves, these API endpoints will provide the foundation for implementing all the features outlined in the task tracking application specification.
