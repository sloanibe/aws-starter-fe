# Task API Testing Documentation

This document details the behavior-driven tests implemented for the Task Tracking API using Serenity BDD.

## Overview

The Task API tests use Serenity BDD, an advanced behavior-driven development framework that builds on top of Cucumber. This approach allows us to:

1. Write tests in natural language that both technical and non-technical stakeholders can understand
2. Generate comprehensive reports that serve as living documentation
3. Ensure our API meets business requirements

## Test Structure

### Feature Files

Our BDD tests are organized in feature files using Gherkin syntax (Given-When-Then). Each feature file describes a specific aspect of the Task API functionality.

Example from `task_management.feature`:

```gherkin
Feature: Task Management API
  As a user of the task tracking system
  I want to be able to create, read, update, and delete tasks
  So that I can effectively manage my tasks

  Scenario: Create a new task
    When I create a task with the following details:
      | title       | description          | status   | priority | dueDate     | category |
      | Test Task 1 | Test description 1   | TODO     | HIGH     | 2025-04-01  | WORK     |
    Then the task is successfully created
    And the response contains the correct task details
```

### Step Definitions

Step definitions map the Gherkin scenarios to actual test code. For the Task API, our step definitions use:

- Serenity REST for API testing
- Spring Boot Test for integration with the application context
- TestContainers for MongoDB testing

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
    taskMap.put("dueDate", row.get("dueDate"));
    taskMap.put("category", row.get("category"));
    
    response = SerenityRest.given()
            .contentType(ContentType.JSON)
            .body(taskMap)
            .when()
            .post(BASE_URL);
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
| Filter tasks by category | Tests retrieving tasks with a specific category | GET /api/tasks/category/{category} |
| Get completed tasks | Tests retrieving all completed tasks | GET /api/tasks/completed |
| Get incomplete tasks | Tests retrieving all incomplete tasks | GET /api/tasks/incomplete |

### 3. Search Operations

| Scenario | Description | Endpoint |
|----------|-------------|----------|
| Search tasks by title or description | Tests searching for tasks containing a specific term | GET /api/tasks/search?q={term} |

## Test Data

Our tests use a combination of:

1. **Test fixtures** - Predefined task data for consistent testing
2. **Dynamic data** - Generated during test execution
3. **Data tables** - Specified in Gherkin scenarios for readability

Example data table:

```gherkin
| title       | description          | status   | priority | dueDate     | category |
| Work Task 1 | Work description 1   | TODO     | HIGH     | 2025-04-05  | WORK     |
| Work Task 2 | Work description 2   | IN_PROGRESS | MEDIUM | 2025-04-06 | WORK     |
| Home Task 1 | Home description 1   | TODO     | LOW      | 2025-04-07  | PERSONAL |
```

## Test Environment

Tests run using:

- **Spring Boot Test** - For creating a test application context
- **Local Docker MongoDB** - For providing a persistent MongoDB database
- **Random port** - To avoid conflicts with running applications

### MongoDB Container Setup

#### Using the Test Environment Setup Script

We provide a utility script that automatically sets up the test environment for you. The script checks if a MongoDB container is already running and starts one if needed:

```bash
cd /home/msloan/gitprojects/aws-starter/aws-starter-api
./setup-test-env.sh
```

The script will:
1. Check if Docker is running
2. Check if a MongoDB container is already running
3. Start a new MongoDB container if needed
4. Wait for MongoDB to be ready to accept connections
5. Display connection information

#### Manual MongoDB Container Setup

Alternatively, you can manually check and start the MongoDB container:

```bash
# Check if MongoDB container is running
docker ps | grep mongodb

# If not running, start it with:
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:6.0
```

## Running the Tests

### Running All Tests

To run all tests, including unit tests, integration tests, and Cucumber/Serenity BDD tests:

```bash
cd /home/msloan/gitprojects/aws-starter/aws-starter-api
./mvnw clean verify
```

This command will execute all test suites and generate the Serenity BDD reports.

### Running Only Cucumber/Serenity BDD Tests

If you want to run only the Cucumber/Serenity BDD tests without running other tests:

```bash
cd /home/msloan/gitprojects/aws-starter/aws-starter-api
./mvnw clean verify -Dtest=CucumberTestRunner
```

## Test Reports

After running the tests, Serenity BDD generates comprehensive HTML reports in the `target/site/serenity` directory.

### Accessing Reports

You can view the Serenity BDD test reports at:

```
file:///home/msloan/gitprojects/aws-starter/aws-starter-api/target/site/serenity/index.html
```

### Report Contents

These reports include:

- Test results with pass/fail status
- Detailed step breakdowns
- Test data used in each scenario
- Requirements coverage
- Step-by-step execution details

## Continuous Integration

The Task API tests are integrated into our CI/CD pipeline and run:

1. On every pull request to ensure code quality
2. Before deployment to staging and production environments
3. Nightly to detect regressions

## Extending the Tests

To add new test scenarios:

1. Add new scenarios to the feature files using Gherkin syntax
2. Implement any new step definitions needed in the `steps` package
3. Run the tests to verify the new scenarios work as expected

For example, to add a new scenario for filtering tasks by due date:

```gherkin
Scenario: Filter tasks by due date
  Given the following tasks exist:
    | title       | description          | status   | priority | dueDate     | category |
    | Task 1      | Description 1        | TODO     | HIGH     | 2025-04-01  | WORK     |
    | Task 2      | Description 2        | TODO     | MEDIUM   | 2025-05-01  | PERSONAL |
  When I request all tasks due before "2025-04-15"
  Then the response status code is 200
  And the response contains 1 task
  And the task in the response has title "Task 1"
```
