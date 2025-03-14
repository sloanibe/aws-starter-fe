# Testing Strategy

This document outlines the testing strategy for the AWS Starter Project, with a focus on the Task Tracking API.

## Testing Approach

Our project follows a comprehensive testing approach that includes multiple levels of testing to ensure code quality and functionality:

### 1. Unit Testing

Unit tests verify that individual components work as expected in isolation. We use:

- **JUnit 5** - The foundation for our Java unit tests
- **Mockito** - For mocking dependencies in unit tests
- **AssertJ** - For fluent assertions

Unit tests focus on testing individual methods, classes, and components without their dependencies.

### 2. Integration Testing

Integration tests verify that different components work together correctly. Our approach includes:

- **Spring Boot Test** - For testing Spring components in an application context
- **Local Docker MongoDB** - For testing with a real MongoDB database in a persistent Docker container
- **REST Assured** - For testing REST APIs

### 3. Behavior-Driven Development (BDD)

We use **Serenity BDD** as our primary framework for behavior-driven testing, which provides:

- Natural language specifications using Gherkin syntax (Given-When-Then)
- Comprehensive HTML reports with detailed test results
- Living documentation that stays in sync with the codebase
- Integration with Spring Boot for testing REST APIs

### 4. End-to-End Testing

End-to-end tests verify the entire application works as expected from a user's perspective:

- **Cypress** - For testing the frontend React application
- **Selenium** - For browser automation when needed

## Test Organization

Tests are organized according to the following structure:

```
src/
  ├── main/
  │   └── java/
  │       └── com/example/awsstarterapi/
  │           ├── controller/
  │           ├── model/
  │           └── repository/
  └── test/
      ├── java/
      │   └── com/example/awsstarterapi/
      │       ├── controller/      # Unit tests for controllers
      │       ├── repository/      # Unit tests for repositories
      │       ├── integration/     # Integration tests
      │       └── bdd/             # BDD tests with Serenity
      │           ├── config/      # Test configuration
      │           ├── steps/       # Step definitions
      │           └── CucumberTestRunner.java
      └── resources/
          ├── features/            # Gherkin feature files
          └── application-test.yml # Test configuration
```

## Continuous Integration

All tests are run as part of our CI/CD pipeline to ensure code quality before deployment:

- Unit and integration tests run on every commit
- BDD tests run before deployment to production
- Test reports are generated and archived for review

## Test Coverage Goals

Our testing strategy aims to achieve:

- **Unit Test Coverage**: Minimum 80% code coverage
- **Integration Test Coverage**: All API endpoints and database operations
- **BDD Test Coverage**: All user-facing features and business requirements

## Reporting

Serenity BDD automatically generates comprehensive HTML reports that include:

- Test results with pass/fail status
- Detailed step breakdowns
- Screenshots (for UI tests)
- Test data used in each scenario
- Requirements coverage

These reports are available in the `target/site/serenity` directory after running tests.
