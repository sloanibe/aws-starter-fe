package com.example.awsstarterapi.bdd.steps;

import com.example.awsstarterapi.model.TaskEntity;
import com.example.awsstarterapi.repository.TaskRepository;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
// import io.restassured.specification.RequestSpecification; // Unused import
import net.serenitybdd.core.Serenity;
import net.serenitybdd.rest.SerenityRest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;

// import java.time.LocalDate; // Unused import
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class TaskApiSteps {

    @LocalServerPort
    private int port;

    @Autowired
    private TaskRepository taskRepository;

    private String taskId;
    private Response response;
    private final String BASE_URL = "/api/tasks";

    @Before
    public void setup() {
        // Use a fixed port for testing if the dynamic port isn't available
        if (port <= 0) {
            port = 8080; // Use default Spring Boot port
        }
        RestAssured.baseURI = "http://localhost";
        RestAssured.port = port;
        RestAssured.basePath = "";
        System.out.println("Using port: " + port);
    }

    @After
    public void cleanup() {
        // Safely clean up if repository is available
        if (taskRepository != null) {
            taskRepository.deleteAll();
        }
    }

    @Given("the task API is available")
    public void theTaskApiIsAvailable() {
        SerenityRest.given()
                .when()
                .get(BASE_URL)
                .then()
                .statusCode(anyOf(is(HttpStatus.OK.value()), is(HttpStatus.NO_CONTENT.value())));
    }

    @Given("a task exists with the following details:")
    public void aTaskExistsWithTheFollowingDetails(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        Map<String, String> row = rows.get(0);
        
        TaskEntity task = createTaskFromDataRow(row);
        TaskEntity savedTask = taskRepository.save(task);
        taskId = savedTask.getId();
        
        Serenity.setSessionVariable("existingTaskId").to(taskId);
    }

    @Given("the following tasks exist:")
    public void theFollowingTasksExist(DataTable dataTable) {
        List<Map<String, String>> rows = dataTable.asMaps(String.class, String.class);
        List<TaskEntity> tasks = new ArrayList<>();
        
        for (Map<String, String> row : rows) {
            TaskEntity task = createTaskFromDataRow(row);
            tasks.add(task);
        }
        
        taskRepository.saveAll(tasks);
    }

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
        
        // Log the request for debugging
        System.out.println("Creating task with: " + taskMap);
        
        response = SerenityRest.given()
                .contentType(ContentType.JSON)
                .body(taskMap)
                .when()
                .post(BASE_URL);
        
        // Log the response for debugging
        System.out.println("Response status: " + response.getStatusCode());
        System.out.println("Response body: " + response.getBody().asString());
        
        if (response.getStatusCode() == HttpStatus.CREATED.value()) {
            taskId = response.jsonPath().getString("id");
            Serenity.setSessionVariable("createdTaskId").to(taskId);
        }
    }

    @When("I request the task by its ID")
    public void iRequestTheTaskByItsId() {
        String id = Serenity.sessionVariableCalled("existingTaskId");
        response = SerenityRest.given()
                .when()
                .get(BASE_URL + "/{id}", id);
    }

    @When("I update the task with the following details:")
    public void iUpdateTheTaskWithTheFollowingDetails(DataTable dataTable) {
        String id = Serenity.sessionVariableCalled("existingTaskId");
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
        
        // Log the request for debugging
        System.out.println("Updating task with ID " + id + ": " + taskMap);
        
        response = SerenityRest.given()
                .contentType(ContentType.JSON)
                .body(taskMap)
                .when()
                .put(BASE_URL + "/{id}", id);
        
        // Log the response for debugging
        System.out.println("Response status: " + response.getStatusCode());
        System.out.println("Response body: " + response.getBody().asString());
    }

    @When("I delete the task")
    public void iDeleteTheTask() {
        String id = Serenity.sessionVariableCalled("existingTaskId");
        response = SerenityRest.given()
                .when()
                .delete(BASE_URL + "/{id}", id);
    }

    @When("I request all tasks with status {string}")
    public void iRequestAllTasksWithStatus(String status) {
        response = SerenityRest.given()
                .when()
                .get(BASE_URL + "/status/{status}", status);
    }

    @When("I request all tasks with priority {string}")
    public void iRequestAllTasksWithPriority(String priority) {
        response = SerenityRest.given()
                .when()
                .get(BASE_URL + "/priority/{priority}", priority);
    }

    @When("I search for tasks containing {string}")
    public void iSearchForTasksContaining(String searchTerm) {
        // Log the search query for debugging
        System.out.println("Searching for tasks containing: " + searchTerm);
        
        response = SerenityRest.given()
                .queryParam("query", searchTerm)
                .when()
                .get(BASE_URL + "/search");
        
        // Log the response for debugging
        System.out.println("Response status: " + response.getStatusCode());
        System.out.println("Response body: " + response.getBody().asString());
    }

    @Then("the task is successfully created")
    public void theTaskIsSuccessfullyCreated() {
        response.then().statusCode(HttpStatus.CREATED.value());
    }

    @Then("the response contains the correct task details")
    public void theResponseContainsTheCorrectTaskDetails() {
        response.then()
                .body("id", notNullValue())
                .body("title", notNullValue())
                .body("description", notNullValue())
                .body("status", notNullValue())
                .body("priority", notNullValue())
                .body("dueDate", notNullValue())
                .body("category", notNullValue());
    }

    @Then("the response status code is {int}")
    public void theResponseStatusCodeIs(int statusCode) {
        response.then().statusCode(statusCode);
    }

    @Then("the task is successfully updated")
    public void theTaskIsSuccessfullyUpdated() {
        response.then().statusCode(HttpStatus.OK.value());
    }

    @Then("the response contains the updated task details")
    public void theResponseContainsTheUpdatedTaskDetails() {
        response.then()
                .body("id", notNullValue())
                .body("title", notNullValue())
                .body("description", notNullValue())
                .body("status", notNullValue())
                .body("priority", notNullValue())
                .body("dueDate", notNullValue())
                .body("category", notNullValue());
    }

    @Then("the task is successfully deleted")
    public void theTaskIsSuccessfullyDeleted() {
        response.then().statusCode(HttpStatus.NO_CONTENT.value());
    }

    @Then("the task no longer exists in the system")
    public void theTaskNoLongerExistsInTheSystem() {
        String id = Serenity.sessionVariableCalled("existingTaskId");
        
        SerenityRest.given()
                .when()
                .get(BASE_URL + "/{id}", id)
                .then()
                .statusCode(HttpStatus.NOT_FOUND.value());
        
        assertFalse(taskRepository.findById(id).isPresent());
    }

    @Then("the response contains {int} tasks")
    public void theResponseContainsNTasks(int count) {
        response.then()
                .body("size()", is(count));
    }

    @Then("all tasks in the response have status {string}")
    public void allTasksInTheResponseHaveStatus(String status) {
        List<String> statuses = response.jsonPath().getList("status");
        for (String taskStatus : statuses) {
            assertEquals(status, taskStatus);
        }
    }

    @Then("all tasks in the response have priority {string}")
    public void allTasksInTheResponseHavePriority(String priority) {
        List<String> priorities = response.jsonPath().getList("priority");
        for (String taskPriority : priorities) {
            assertEquals(priority, taskPriority);
        }
    }

    @Then("the response includes tasks with titles or descriptions containing {string}")
    public void theResponseIncludesTasksWithTitlesOrDescriptionsContaining(String searchTerm) {
        List<String> titles = response.jsonPath().getList("title");
        List<String> descriptions = response.jsonPath().getList("description");
        
        boolean foundMatch = false;
        for (String title : titles) {
            if (title.contains(searchTerm)) {
                foundMatch = true;
                break;
            }
        }
        
        if (!foundMatch) {
            for (String description : descriptions) {
                if (description.contains(searchTerm)) {
                    foundMatch = true;
                    break;
                }
            }
        }
        
        assertThat("Response should contain at least one task with the search term in title or description", 
                foundMatch, is(true));
    }

    private TaskEntity createTaskFromDataRow(Map<String, String> row) {
        TaskEntity task = new TaskEntity();
        task.setTitle(row.get("title"));
        task.setDescription(row.get("description"));
        task.setStatus(row.get("status"));
        task.setPriority(row.get("priority"));
        task.setDueDate(LocalDateTime.parse(row.get("dueDate") + "T00:00:00"));
        task.setCategory(row.get("category"));
        return task;
    }
}
