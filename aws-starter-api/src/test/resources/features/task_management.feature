Feature: Task Management API
  As a user of the task tracking system
  I want to be able to create, read, update, and delete tasks
  So that I can effectively manage my tasks

  Background:
    Given the task API is available

  @CreateTask
  Scenario: Create a new task
    When I create a task with the following details:
      | title       | description          | status   | priority | dueDate     | category |
      | Test Task 1 | Test description 1   | TODO     | HIGH     | 2025-04-01  | WORK     |
    Then the task is successfully created
    And the response contains the correct task details

  Scenario: Retrieve a task by ID
    Given a task exists with the following details:
      | title       | description          | status   | priority | dueDate     | category |
      | Test Task 2 | Test description 2   | TODO     | MEDIUM   | 2025-04-02  | PERSONAL |
    When I request the task by its ID
    Then the response status code is 200
    And the response contains the correct task details

  Scenario: Update an existing task
    Given a task exists with the following details:
      | title       | description          | status   | priority | dueDate     | category |
      | Test Task 3 | Test description 3   | TODO     | LOW      | 2025-04-03  | WORK     |
    When I update the task with the following details:
      | title       | description          | status   | priority | dueDate     | category |
      | Updated Task| Updated description  | IN_PROGRESS | HIGH  | 2025-04-10  | PERSONAL |
    Then the task is successfully updated
    And the response contains the updated task details

  Scenario: Delete a task
    Given a task exists with the following details:
      | title       | description          | status   | priority | dueDate     | category |
      | Test Task 4 | Test description 4   | TODO     | MEDIUM   | 2025-04-04  | WORK     |
    When I delete the task
    Then the task is successfully deleted
    And the task no longer exists in the system

  Scenario: Filter tasks by status
    Given the following tasks exist:
      | title       | description          | status      | priority | dueDate     | category |
      | Work Task 1 | Work description 1   | TODO        | HIGH     | 2025-04-05  | WORK     |
      | Work Task 2 | Work description 2   | IN_PROGRESS | MEDIUM   | 2025-04-06  | WORK     |
      | Home Task 1 | Home description 1   | TODO        | LOW      | 2025-04-07  | PERSONAL |
    When I request all tasks with status "TODO"
    Then the response status code is 200
    And the response contains 2 tasks
    And all tasks in the response have status "TODO"

  Scenario: Filter tasks by priority
    Given the following tasks exist:
      | title       | description          | status      | priority | dueDate     | category |
      | Work Task 3 | Work description 3   | TODO        | HIGH     | 2025-04-08  | WORK     |
      | Work Task 4 | Work description 4   | IN_PROGRESS | HIGH     | 2025-04-09  | WORK     |
      | Home Task 2 | Home description 2   | TODO        | MEDIUM   | 2025-04-10  | PERSONAL |
    When I request all tasks with priority "HIGH"
    Then the response status code is 200
    And the response contains 2 tasks
    And all tasks in the response have priority "HIGH"

  Scenario: Search tasks by title or description
    Given the following tasks exist:
      | title          | description             | status      | priority | dueDate     | category |
      | Project Alpha  | Alpha project details   | TODO        | HIGH     | 2025-04-11  | WORK     |
      | Project Beta   | Beta project details    | IN_PROGRESS | MEDIUM   | 2025-04-12  | WORK     |
      | Shopping List  | Alpha shopping items    | TODO        | LOW      | 2025-04-13  | PERSONAL |
    When I search for tasks containing "Alpha"
    Then the response status code is 200
    And the response contains 3 tasks
    And the response includes tasks with titles or descriptions containing "Alpha"
