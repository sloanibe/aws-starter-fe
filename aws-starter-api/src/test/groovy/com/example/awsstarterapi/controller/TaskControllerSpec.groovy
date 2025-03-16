package com.example.awsstarterapi.controller

import com.example.awsstarterapi.model.TaskEntity
import com.example.awsstarterapi.repository.TaskRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.ResponseEntity
import spock.lang.Specification

@SpringBootTest
class TaskControllerSpec extends Specification {

    @Autowired
    TaskController taskController

    @MockBean
    TaskRepository taskRepository

    def setup() {
        // No need to manually set up mocks, Spring will handle it
    }

    def "should return empty list when no tasks exist"() {
        given: "repository returns empty list"
        taskRepository.findAll() >> []

        when: "getAllTasks is called"
        ResponseEntity<List<TaskEntity>> response = taskController.getAllTasks()

        then: "response should be successful with empty list"
        response.statusCode.value() == 200
        response.body.empty
    }

    def "should return task list when tasks exist"() {
        given: "repository returns list of tasks"
        def tasks = [
            new TaskEntity(
                id: "1",
                title: "Test Task",
                description: "Test Description",
                status: "TODO",
                priority: "HIGH"
            )
        ]
        taskRepository.findAll() >> tasks

        when: "getAllTasks is called"
        ResponseEntity<List<TaskEntity>> response = taskController.getAllTasks()

        then: "response should contain the task"
        response.statusCode.value() == 200
        response.body.size() == 1
        with(response.body[0]) {
            id == "1"
            title == "Test Task"
            description == "Test Description"
            status == "TODO"
            priority == "HIGH"
        }
    }
}
