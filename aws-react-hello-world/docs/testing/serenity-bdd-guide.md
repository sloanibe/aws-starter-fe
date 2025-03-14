# Serenity BDD Guide

This document provides a detailed guide to using Serenity BDD for testing the Task Tracking API.

## What is Serenity BDD?

Serenity BDD is an advanced testing and reporting library that builds on top of Cucumber, JUnit, and other testing tools. It provides:

1. **Enhanced reporting** - Detailed HTML reports with screenshots, test data, and step information
2. **Screenplay pattern** - A more powerful alternative to the Page Object pattern
3. **Living documentation** - Automatically generated documentation that stays in sync with your tests
4. **Spring Boot integration** - Seamless integration with Spring's testing framework
5. **REST API testing** - Built-in support for REST Assured with additional reporting

## Key Components

### 1. Feature Files

Feature files use Gherkin syntax to describe the behavior of the system in a natural language format. They are stored in `src/test/resources/features/`.

Example:
```gherkin
Feature: Task Management API
  
  Scenario: Create a new task
    When I create a task with the following details:
      | title       | description        | status | priority | dueDate    | category |
      | Test Task 1 | Test description 1 | TODO   | HIGH     | 2025-04-01 | WORK     |
    Then the task is successfully created
```

### 2. Step Definitions

Step definitions map the Gherkin steps to actual test code. They are located in `src/test/java/com/example/awsstarterapi/bdd/steps/`.

Example:
```java
@When("I create a task with the following details:")
public void iCreateATaskWithTheFollowingDetails(DataTable dataTable) {
    // Implementation that creates a task via the API
}

@Then("the task is successfully created")
public void theTaskIsSuccessfullyCreated() {
    // Verification that the task was created successfully
}
```

### 3. Test Runner

The test runner configures and runs the Cucumber tests with Serenity. It is located at `src/test/java/com/example/awsstarterapi/bdd/CucumberTestRunner.java`.

```java
@RunWith(CucumberWithSerenity.class)
@CucumberOptions(
    features = "src/test/resources/features",
    glue = {"com.example.awsstarterapi.bdd.steps", "com.example.awsstarterapi.bdd.config"},
    plugin = {"pretty", "html:target/cucumber-reports"}
)
public class CucumberTestRunner {
}
```

### 4. Configuration

Serenity BDD is configured through:

- **Maven dependencies** - In the `pom.xml` file
- **Spring Boot test configuration** - In `src/test/java/com/example/awsstarterapi/bdd/config/`
- **Application properties** - In `src/test/resources/application-test.yml`

## Writing Tests with Serenity BDD

### 1. Define the Feature

Start by defining a feature file that describes the behavior you want to test:

```gherkin
Feature: Task Filtering
  As a user of the task tracking system
  I want to be able to filter tasks by various criteria
  So that I can find specific tasks quickly
  
  Scenario: Filter tasks by status
    Given the following tasks exist:
      | title     | description   | status      | priority | dueDate    | category |
      | Task 1    | Description 1 | TODO        | HIGH     | 2025-04-01 | WORK     |
      | Task 2    | Description 2 | IN_PROGRESS | MEDIUM   | 2025-04-02 | PERSONAL |
    When I request all tasks with status "TODO"
    Then the response status code is 200
    And the response contains 1 task
    And all tasks in the response have status "TODO"
```

### 2. Implement Step Definitions

Next, implement the step definitions that map to your Gherkin steps:

```java
@Given("the following tasks exist:")
public void theFollowingTasksExist(DataTable dataTable) {
    // Code to create tasks from the data table
}

@When("I request all tasks with status {string}")
public void iRequestAllTasksWithStatus(String status) {
    // Code to call the API endpoint
}

@Then("the response contains {int} task")
public void theResponseContainsNTasks(int count) {
    // Verification code
}
```

### 3. Run the Tests

Run the tests using Maven:

```bash
mvn clean verify
```

### 4. View the Reports

After running the tests, Serenity generates detailed HTML reports in `target/site/serenity/`. These reports include:

- Test results with pass/fail status
- Detailed step breakdowns
- Test data used in each scenario
- Requirements coverage

## Best Practices

### 1. Keep Scenarios Focused

Each scenario should test one specific behavior or requirement. Avoid creating scenarios that test multiple unrelated features.

### 2. Use Background for Common Setup

If multiple scenarios share the same setup steps, use a Background section:

```gherkin
Background:
  Given the task API is available
```

### 3. Use Data Tables for Complex Data

Data tables make it easy to specify complex test data in a readable format:

```gherkin
Given the following tasks exist:
  | title  | description | status | priority | dueDate    | category |
  | Task 1 | Desc 1      | TODO   | HIGH     | 2025-04-01 | WORK     |
  | Task 2 | Desc 2      | DONE   | LOW      | 2025-04-02 | PERSONAL |
```

### 4. Use Scenario Outlines for Multiple Similar Tests

If you need to test the same behavior with different inputs, use Scenario Outlines:

```gherkin
Scenario Outline: Filter tasks by different statuses
  Given the following tasks exist:
    | title  | description | status      | priority | dueDate    | category |
    | Task 1 | Desc 1      | TODO        | HIGH     | 2025-04-01 | WORK     |
    | Task 2 | Desc 2      | IN_PROGRESS | MEDIUM   | 2025-04-02 | WORK     |
    | Task 3 | Desc 3      | DONE        | LOW      | 2025-04-03 | PERSONAL |
  When I request all tasks with status "<status>"
  Then the response status code is 200
  And the response contains <count> task(s)
  
  Examples:
    | status      | count |
    | TODO        | 1     |
    | IN_PROGRESS | 1     |
    | DONE        | 1     |
```

## Extending the Test Suite

To add new tests:

1. Add new scenarios to existing feature files or create new feature files
2. Implement any new step definitions needed
3. Run the tests to verify they work as expected

## Troubleshooting

### Common Issues

1. **Tests fail with connection errors**
   - Ensure MongoDB TestContainer is running
   - Check that the application is configured to use the test database

2. **Step definitions not found**
   - Verify that the glue path in CucumberOptions is correct
   - Check that step definitions match the steps in feature files exactly

3. **Reports not generated**
   - Ensure the Serenity Maven plugin is configured correctly
   - Run with `mvn clean verify` instead of just `mvn test`

## Resources

- [Serenity BDD Official Documentation](https://serenity-bdd.github.io/docs/guide/user_guide)
- [Cucumber Documentation](https://cucumber.io/docs/cucumber/)
- [REST Assured Documentation](https://rest-assured.io/)
