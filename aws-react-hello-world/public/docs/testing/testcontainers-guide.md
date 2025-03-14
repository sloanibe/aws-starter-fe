# TestContainers Guide

This document provides a comprehensive guide to using TestContainers in our Task Tracking API testing strategy.

## What is TestContainers?

TestContainers is a Java library that provides lightweight, throwaway instances of common databases, message brokers, web browsers, or anything else that can run in a Docker container. It's designed to make integration testing easier by providing real dependencies for your tests without the complexity of setting up external services.

## Key Benefits for Our Testing Strategy

### 1. Isolated Test Environment

Each test run gets a completely isolated MongoDB instance:

- Tests run against a fresh database every time
- No test data persists between test runs
- No risk of tests interfering with each other
- No need for complex cleanup code

### 2. Realistic Testing

Unlike mocks or in-memory databases:

- Tests run against the actual MongoDB technology used in production
- Database-specific features and behaviors are accurately tested
- MongoDB-specific queries work exactly as they would in production
- Performance characteristics are more realistic

### 3. Consistent Starting State

Every test starts with a clean database:

- Predictable test behavior regardless of previous test runs
- Freedom to create exactly the test data needed for each scenario
- No assumptions about existing data that could lead to flaky tests

### 4. Simplified Test Setup

TestContainers handles the complexity:

- Automatically downloads the required Docker images
- Manages container lifecycle (creation, startup, shutdown)
- Configures network ports and connection settings
- Provides connection details to your application

## How We Use TestContainers

In our Task Tracking API, we use TestContainers to provide a MongoDB instance for our Serenity BDD tests:

### 1. Configuration

Our TestContainers configuration is defined in `TestContainersConfiguration.java`:

```java
@Configuration
public class TestContainersConfiguration {
    
    // Define a static MongoDB container that will be shared by all tests
    private static final MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:5.0.9");
    
    // Start the container before any tests run
    static {
        mongoDBContainer.start();
        // Set system property to configure Spring to use this MongoDB instance
        System.setProperty("spring.data.mongodb.uri", mongoDBContainer.getReplicaSetUrl());
    }
    
    // Ensure the container is stopped when the JVM shuts down
    @PreDestroy
    public void stopContainer() {
        if (mongoDBContainer.isRunning()) {
            mongoDBContainer.stop();
        }
    }
}
```

### 2. Integration with Spring Boot

We configure our Spring Boot application to use the MongoDB container in `application-test.yml`:

```yaml
spring:
  data:
    mongodb:
      # This URI will be overridden by the system property set in TestContainersConfiguration
      uri: ${spring.data.mongodb.uri}
      database: testdb
```

### 3. Test Execution Flow

When our Serenity BDD tests run:

1. The MongoDB container starts before any tests execute
2. Spring Boot connects to this container using the provided connection URI
3. Each test scenario creates the specific data it needs
4. Tests run against this isolated MongoDB instance
5. After all tests complete, the container is automatically stopped and removed

## Advanced TestContainers Features

### 1. Container Reuse

To speed up test execution, TestContainers can reuse containers across test runs:

```java
@Testcontainers(disabledWithoutDocker = true)
@Container
static final MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:5.0.9")
    .withReuse(true);
```

### 2. Custom Container Configuration

TestContainers allows customizing container behavior:

```java
MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:5.0.9")
    .withExposedPorts(27017)
    .withCommand("--replSet", "rs0")
    .withEnv("MONGO_INITDB_ROOT_USERNAME", "testuser")
    .withEnv("MONGO_INITDB_ROOT_PASSWORD", "testpassword");
```

### 3. Container Networks

For testing microservices that need to communicate:

```java
Network network = Network.newNetwork();

MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:5.0.9")
    .withNetwork(network)
    .withNetworkAliases("mongodb");

GenericContainer<?> serviceContainer = new GenericContainer<>("myservice:latest")
    .withNetwork(network)
    .withEnv("MONGODB_HOST", "mongodb");
```

### 4. Container Logs

TestContainers can capture container logs for debugging:

```java
mongoDBContainer.followOutput(new Slf4jLogConsumer(LoggerFactory.getLogger("mongodb")));
```

## Comparison with Alternative Approaches

| Approach | Pros | Cons |
|----------|------|------|
| **TestContainers** | • Real database technology<br>• Isolated test environment<br>• No cleanup needed<br>• Realistic testing | • Requires Docker<br>• Slightly slower startup |
| **In-memory DB** | • Fast startup<br>• No external dependencies | • Different technology than production<br>• Limited feature support |
| **Mocked Repository** | • Very fast<br>• Complete control | • Not testing real database interactions<br>• Easy to miss edge cases |
| **Shared Test DB** | • Single setup | • Tests can interfere<br>• Requires cleanup<br>• State can persist between runs |

## Best Practices

### 1. Container Startup Strategy

- Start containers once per test suite, not per test
- Use static containers with `@ClassRule` or static initializer blocks
- Consider container reuse for faster test runs

### 2. Data Management

- Create only the data needed for each test
- Use builder patterns or factory methods for test data creation
- Consider using database initialization scripts for complex setups

### 3. Connection Management

- Use dynamic connection properties
- Handle connection failures gracefully
- Set appropriate timeouts

### 4. Resource Cleanup

- Ensure containers are stopped after tests complete
- Use shutdown hooks or JUnit rules for cleanup
- Monitor for orphaned containers

## Troubleshooting

### Common Issues and Solutions

1. **Docker Not Available**
   - Error: `Could not find a valid Docker environment`
   - Solution: Ensure Docker is installed and running

2. **Port Conflicts**
   - Error: `Could not create/start container: port is already allocated`
   - Solution: Use random ports with `withExposedPorts()` instead of fixed ports

3. **Container Startup Failures**
   - Error: `Container startup failed`
   - Solution: Check container logs with `followOutput()` and verify image version

4. **Slow Tests**
   - Issue: Tests take too long to run
   - Solution: Use container reuse, parallel test execution, or faster container images

## Resources

- [TestContainers Official Documentation](https://www.testcontainers.org/)
- [TestContainers MongoDB Module](https://www.testcontainers.org/modules/databases/mongodb/)
- [Spring Boot TestContainers Integration](https://spring.io/blog/2023/06/23/spring-boot-3-1-0-testcontainers-support)

## Example: Complete Test Setup

Here's a complete example of setting up a test with TestContainers, Spring Boot, and Serenity BDD:

```java
@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
    features = "src/test/resources/features",
    glue = {"com.example.awsstarterapi.bdd.steps", "com.example.awsstarterapi.bdd.config"}
)
public class CucumberTestRunner {
    // The test runner class doesn't need to do anything else
    // TestContainersConfiguration will handle the MongoDB setup
}

@Configuration
@CucumberContextConfiguration
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class CucumberTestConfiguration {
    // This class integrates Cucumber with Spring Boot
}

@Configuration
public class TestContainersConfiguration {
    private static final MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:5.0.9");
    
    static {
        mongoDBContainer.start();
        System.setProperty("spring.data.mongodb.uri", mongoDBContainer.getReplicaSetUrl());
    }
}

// In a step definition class
@Given("the following tasks exist:")
public void theFollowingTasksExist(DataTable dataTable) {
    List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
    
    for (Map<String, String> row : rows) {
        TaskEntity task = new TaskEntity();
        task.setTitle(row.get("title"));
        task.setDescription(row.get("description"));
        task.setStatus(Status.valueOf(row.get("status")));
        task.setPriority(Priority.valueOf(row.get("priority")));
        task.setDueDate(LocalDate.parse(row.get("dueDate")));
        task.setCategory(Category.valueOf(row.get("category")));
        
        // Save directly to the MongoDB container
        taskRepository.save(task);
    }
}
```

This setup provides a complete, isolated test environment that closely resembles our production environment, ensuring our tests are both reliable and realistic.
