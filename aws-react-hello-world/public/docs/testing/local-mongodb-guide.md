# Local Docker MongoDB Guide

This document provides a comprehensive guide to using a local Docker MongoDB instance in our Task Tracking API testing strategy.

## Overview

Instead of using TestContainers, we now utilize a persistent local Docker MongoDB container for development and testing. This approach provides a consistent database environment that's available for all tests without the overhead of creating and destroying containers for each test run.

## Local MongoDB Docker Setup

### Container Configuration

Our MongoDB container is configured with the following specifications:

- **MongoDB Version**: 6.0
- **Container Name**: mongodb
- **Port Mapping**: 27017:27017 (host:container)
- **Authentication**: Enabled
- **Admin User**: username: admin, password: admin123
- **Container ID**: 1e933b312206

### Key Benefits for Our Testing Strategy

### 1. Development and Testing Consistency

Using a persistent local MongoDB container:

- Provides the same database environment for both development and testing
- Eliminates environment-specific issues between developers
- Makes tests more reliable and reproducible

### 2. Realistic Testing

Unlike mocks or in-memory databases:

- Tests run against the actual MongoDB technology used in production
- Database-specific features and behaviors are accurately tested
- MongoDB-specific queries work exactly as they would in production
- Performance characteristics are more realistic

### 3. Simplified Setup

The persistent container approach simplifies our workflow:

- No need to configure TestContainers in the test code
- Faster test startup since the container is already running
- Easier debugging as you can connect to the database outside of tests
- Reduced resource usage compared to creating containers for each test run

## How We Use Local Docker MongoDB

In our Task Tracking API, we use a local Docker MongoDB instance for our Serenity BDD tests:

### 1. Starting the MongoDB Container

To start the MongoDB container, you can use the following Docker command:

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:6.0
```

This creates a persistent MongoDB container that will be available for all your tests and development work.

### 2. Integration with Spring Boot

We configure our Spring Boot application to use the local MongoDB container in `application-test.yml`:

```yaml
spring:
  data:
    mongodb:
      uri: mongodb://admin:admin123@localhost:27017
      database: taskdb-test
  autoconfigure:
    exclude:
      - org.springframework.boot.autoconfigure.mongo.embedded.EmbeddedMongoAutoConfiguration
```

### 3. Test Execution Flow

When our Serenity BDD tests run:

1. Spring Boot connects to the already running MongoDB container
2. The test setup cleans the database to ensure a fresh state for each test run
3. Each test scenario creates the specific data it needs
4. Tests run against the MongoDB instance
5. After tests complete, the cleanup process removes test data but the container remains running

## Working with the Local MongoDB Container

### 1. Checking Container Status

To verify that your MongoDB container is running:

```bash
docker ps | grep mongodb
```

You should see output similar to:

```
1e933b312206   mongo:6.0   "docker-entrypoint.s…"   3 days ago   Up 3 days   0.0.0.0:27017->27017/tcp   mongodb
```

### 2. Connecting to MongoDB Shell

For debugging or data inspection, you can connect directly to the MongoDB shell:

```bash
docker exec -it mongodb mongosh -u admin -p admin123
```

### 3. Viewing MongoDB Logs

To view the logs from the MongoDB container:

```bash
docker logs mongodb
```

### 4. Resetting the Database

If you need to completely reset your database between test runs:

```bash
docker exec -it mongodb mongosh -u admin -p admin123 --eval "db.getSiblingDB('taskdb-test').dropDatabase()"
```

## Comparison with Alternative Approaches

| Approach | Pros | Cons |
|----------|------|------|
| **Local Docker MongoDB** | • Real database technology<br>• Consistent environment<br>• Faster test startup<br>• Easier debugging | • Requires Docker<br>• Needs manual container management<br>• Potential for test interference |
| **TestContainers** | • Isolated test environment<br>• Automatic container lifecycle<br>• Clean state for each test | • Slower test startup<br>• Higher resource usage<br>• More complex configuration |
| **In-memory DB** | • Very fast startup<br>• No external dependencies | • Different technology than production<br>• Limited feature support |
| **Mocked Repository** | • Extremely fast<br>• Complete control | • Not testing real database interactions<br>• Easy to miss edge cases |

## Best Practices

### 1. Container Management

- Start the MongoDB container before running tests
- Use a consistent container name for easy reference
- Consider creating a startup script to ensure the container is running

### 2. Data Management

- Clean the database before each test run
- Create only the data needed for each test
- Use builder patterns or factory methods for test data creation
- Implement proper cleanup in `@After` methods

### 3. Connection Management

- Configure Spring Boot to connect to the local MongoDB container
- Use environment-specific properties for different environments
- Handle connection failures gracefully with informative error messages

### 4. Database Isolation

- Use separate databases for different test suites
- Consider using database prefixes for parallel test execution
- Implement proper transaction management for test atomicity

## Troubleshooting

### Common Issues and Solutions

1. **Docker Container Not Running**
   - Error: `MongoTimeoutException: Timed out after 30000 ms while waiting to connect`
   - Solution: Start the MongoDB container with `docker start mongodb`

2. **Authentication Issues**
   - Error: `MongoSecurityException: Authentication failed`
   - Solution: Verify credentials in your application-test.yml file

3. **Port Conflicts**
   - Error: `Address already in use`
   - Solution: Stop any other services using port 27017 or map MongoDB to a different port

4. **Database Connection Issues**
   - Issue: Tests can't connect to MongoDB
   - Solution: Verify container is running with `docker ps` and check network settings

## Resources

- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Spring Data MongoDB](https://docs.spring.io/spring-data/mongodb/docs/current/reference/html/)
- [Docker Documentation](https://docs.docker.com/)

## Example: Test Setup with Local MongoDB

Here's a complete example of setting up a test with local Docker MongoDB, Spring Boot, and Serenity BDD:

```java
@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
    features = "src/test/resources/features",
    glue = {"com.example.awsstarterapi.bdd.steps", "com.example.awsstarterapi.bdd.config"}
)
public class CucumberTestRunner {
    // The test runner class doesn't need to do anything else
    // Spring Boot will connect to the local MongoDB container
}

@Configuration
@CucumberContextConfiguration
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class CucumberSpringConfiguration {
    // This class integrates Cucumber with Spring Boot
    // The test profile activates the MongoDB connection properties in application-test.yml
}

// Example application-test.yml configuration
/*
spring:
  data:
    mongodb:
      uri: mongodb://admin:admin123@localhost:27017
      database: taskdb-test
  autoconfigure:
    exclude:
      - org.springframework.boot.autoconfigure.mongo.embedded.EmbeddedMongoAutoConfiguration
*/

// In a step definition class
@Given("the following tasks exist:")
public void theFollowingTasksExist(DataTable dataTable) {
    // First clean the database to ensure a fresh state
    taskRepository.deleteAll();
    
    List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
    
    for (Map<String, String> row : rows) {
        TaskEntity task = new TaskEntity();
        task.setTitle(row.get("title"));
        task.setDescription(row.get("description"));
        task.setStatus(Status.valueOf(row.get("status")));
        task.setPriority(Priority.valueOf(row.get("priority")));
        task.setDueDate(LocalDate.parse(row.get("dueDate")));
        task.setCategory(Category.valueOf(row.get("category")));
        
        // Save to the local MongoDB instance
        taskRepository.save(task);
    }
}
```

This setup provides a consistent test environment that closely resembles our production environment, ensuring our tests are both reliable and realistic. By using a persistent local MongoDB container, we simplify our testing infrastructure while maintaining the benefits of testing against a real database.
