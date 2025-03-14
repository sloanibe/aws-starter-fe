# Local Testing Guide for Task API

This document describes our approach to testing the Task API using a local development environment with Docker and WSL integration.

## Testing Environment Overview

Our testing environment consists of:

1. **Spring Boot application** running locally in WSL
2. **MongoDB** running in a Docker container
3. **Serenity BDD** for behavior-driven testing

This setup provides a lightweight, reproducible environment that closely mirrors our production setup while being completely independent of AWS resources.

## Local MongoDB Setup

Instead of using TestContainers for our tests, we've set up a persistent MongoDB container:

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:6.0
```

### Container Details:
- **Image**: MongoDB 6.0
- **Container Name**: mongodb
- **Port**: 27017 (exposed to host)
- **Admin Credentials**: 
  - Username: admin
  - Password: admin123
- **Container ID**: 1e933b312206

### Connection URI:
```
mongodb://admin:admin123@localhost:27017/aws_starter_db?authSource=admin&connectTimeoutMS=3000
```

## Spring Boot Configuration

The Spring Boot application is configured to connect to the local MongoDB instance:

```yaml
# application.yml (or application-test.yml)
spring:
  data:
    mongodb:
      uri: mongodb://admin:admin123@localhost:27017/aws_starter_db?authSource=admin&connectTimeoutMS=3000
```

## Serenity BDD Testing Framework

Our tests use Serenity BDD, an advanced behavior-driven development framework that builds on top of Cucumber. This approach allows us to:

1. Write tests in natural language that both technical and non-technical stakeholders can understand
2. Generate comprehensive reports that serve as living documentation
3. Ensure our API meets business requirements

### Key Components:

#### 1. Feature Files
Our BDD tests are organized in feature files using Gherkin syntax (Given-When-Then). Each feature file describes a specific aspect of the Task API functionality.

Example from `task_management.feature`:

```gherkin
Feature: Task Management API
  As a user of the task tracking system
  I want to be able to create, read, update, and delete tasks
  So that I can effectively manage my tasks

  Scenario: Create a new task
    Given the task API is available
    When I create a task with the following details:
      | title       | description          | status   | priority | dueDate     | category |
      | Test Task 1 | Test description 1   | TODO     | HIGH     | 2025-04-01  | WORK     |
    Then the task is successfully created
    And the response contains the correct task details
```

#### 2. Step Definitions
Step definitions map the Gherkin scenarios to actual test code. For the Task API, our step definitions use:

- Serenity REST for API testing
- Spring Boot Test for integration with the application context
- Direct MongoDB access via Spring Data repositories

Example step definition:

```java
@When("I create a task with the following details:")
public void iCreateATaskWithTheFollowingDetails(DataTable dataTable) {
    List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
    Map<String, String> row = rows.get(0);
    
    Map<String, Object> taskMap = new HashMap<>();
    taskMap.put("title", row.get("title"));
    taskMap.put("description", row.get("description"));
    taskMap.put("status", row.get("status"));
    taskMap.put("priority", row.get("priority"));
    
    // Format the date properly with time component
    String dueDate = row.get("dueDate");
    if (dueDate != null && !dueDate.contains("T")) {
        dueDate = dueDate + "T00:00:00";
    }
    taskMap.put("dueDate", dueDate);
    
    taskMap.put("category", row.get("category"));
    taskMap.put("completed", false);
    
    response = SerenityRest.given()
            .contentType(ContentType.JSON)
            .body(taskMap)
            .when()
            .post(BASE_URL);
}
```

#### 3. Test Configuration
Our tests are configured to use Spring's dependency injection with Serenity BDD:

```java
@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
    features = "src/test/resources/features",
    glue = {"com.example.awsstarterapi.bdd.steps", "com.example.awsstarterapi.bdd.config"},
    plugin = {"pretty", "html:target/cucumber-reports"},
    objectFactory = io.cucumber.spring.SpringFactory.class
)
public class CucumberTestRunner {
    // This class is the entry point for running Cucumber tests with Serenity
}
```

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class CucumberSpringConfiguration {
    // This class configures Spring Boot for Cucumber tests
}
```

## Test Scenarios

The following test scenarios are implemented for the Task API:

### 1. Basic CRUD Operations

| Scenario | Description | Endpoint |
|----------|-------------|----------|
| Create a new task | Tests creating a task with specified details | POST /api/tasks |
| Retrieve a task by ID | Tests retrieving a specific task by its ID | GET /api/tasks/{id} |
| Update an existing task | Tests updating a task's details | PUT /api/tasks/{id} |
| Delete a task | Tests deleting a task and verifies it no longer exists | DELETE /api/tasks/{id} |

### 2. Filtering Operations

| Scenario | Description | Endpoint |
|----------|-------------|----------|
| Filter tasks by status | Tests retrieving tasks with a specific status | GET /api/tasks/status/{status} |
| Filter tasks by priority | Tests retrieving tasks with a specific priority | GET /api/tasks/priority/{priority} |
| Search tasks by title or description | Tests searching for tasks containing a specific term | GET /api/tasks/search?query={term} |

## Running the Tests

To run the Task API tests:

```bash
# Ensure MongoDB container is running
docker ps | grep mongodb

# If not running, start it
docker start mongodb

# Run the tests
cd /home/msloan/gitprojects/aws-starter/aws-starter-api
./mvnw test -Dtest=CucumberTestRunner
```

For full Serenity reports:

```bash
./mvnw clean verify
```

## Advantages of Local Testing Approach

1. **Simplified Setup**: No need for complex TestContainers configuration
2. **Faster Test Execution**: The MongoDB container is already running, eliminating container startup time
3. **Persistent Database**: Allows for manual inspection of data between test runs if needed
4. **Consistent Environment**: All developers use the same MongoDB setup
5. **AWS Independence**: No reliance on AWS resources for development and testing
6. **WSL Integration**: Seamless integration with Windows Subsystem for Linux

## Test Data Management

Before each test run, the database is cleaned to ensure a consistent starting state:

```java
@After
public void cleanup() {
    // Safely clean up if repository is available
    if (taskRepository != null) {
        taskRepository.deleteAll();
    }
}
```

## Test Reports

After running the tests with `mvn verify`, Serenity BDD generates comprehensive HTML reports in the `target/site/serenity` directory. These reports include:

- Test results with pass/fail status
- Detailed step breakdowns
- Test data used in each scenario
- Requirements coverage

## Troubleshooting

### Common Issues and Solutions

1. **MongoDB Connection Issues**
   - Error: `MongoTimeoutException: Timed out after 30000 ms while waiting to connect`
   - Solution: Ensure the MongoDB container is running with `docker ps` and that the connection URI is correct

2. **Spring Boot Port Conflicts**
   - Error: `Port 8080 already in use`
   - Solution: Our tests use a random port with `@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)`

3. **Test Data Issues**
   - Problem: Tests failing due to unexpected data
   - Solution: Ensure the cleanup method is working correctly and that tests are creating the expected data

4. **Date Format Issues**
   - Problem: Tasks not being created or updated correctly due to date format issues
   - Solution: Ensure dates include the time component (e.g., `2025-04-01T00:00:00`)
