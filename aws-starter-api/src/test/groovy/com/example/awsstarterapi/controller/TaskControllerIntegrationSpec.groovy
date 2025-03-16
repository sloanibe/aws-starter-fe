package com.example.awsstarterapi.controller

import com.example.awsstarterapi.AwsStarterApiApplication
import com.example.awsstarterapi.model.TaskEntity
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.test.context.ActiveProfiles
import org.springframework.web.util.DefaultUriBuilderFactory
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.MongoDBContainer
import org.testcontainers.spock.Testcontainers
import spock.lang.Shared
import spock.lang.Specification

@Testcontainers
@SpringBootTest(classes = AwsStarterApiApplication.class, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class TaskControllerIntegrationSpec extends Specification {
    static {
        // Force TestContainers to initialize
        MongoDBContainer.class.newInstance()
    }

    @Shared
    static MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:6.0")
            .withExposedPorts(27017)
            .withReuse(true)

    def setupSpec() {
        mongoDBContainer.start()
        println "\n[TEST] MongoDB container started:"
        println "[TEST] Container ID: ${mongoDBContainer.containerId}"
        println "[TEST] Container Host: ${mongoDBContainer.host}"
        println "[TEST] Container Port: ${mongoDBContainer.firstMappedPort}"
        println "[TEST] Container URL: ${mongoDBContainer.replicaSetUrl}"
    }

    @Autowired
    TestRestTemplate restTemplate

    @LocalServerPort
    int port

    def setup() {
        println "\n[TEST] Port assigned by Spring Boot: ${port}"
        println "[TEST] MongoDB container port: ${mongoDBContainer.getMappedPort(27017)}"
        println "[TEST] MongoDB container host: ${mongoDBContainer.host}"
        println "[TEST] MongoDB container URL: ${mongoDBContainer.replicaSetUrl}"
        
        restTemplate.rootUri = "http://localhost:${port}"
        println "[TEST] REST Template root URI: ${restTemplate.rootUri}"
    }

    @DynamicPropertySource
    static void setProperties(DynamicPropertyRegistry registry) {
        // Enable MongoDB logging
        registry.add('logging.level.org.mongodb') { 'DEBUG' }
        registry.add('logging.level.org.springframework.data.mongodb.core.MongoTemplate') { 'DEBUG' }

        registry.add('spring.data.mongodb.uri') { 
            def url = mongoDBContainer.replicaSetUrl
            println "[TEST] Setting MongoDB URI: ${url}"
            return url
        }
        registry.add('spring.data.mongodb.database') { 
            println "[TEST] Setting MongoDB database: test_db"
            return 'test_db'
        }
        registry.add('logging.level.org.springframework.data.mongodb') { 'DEBUG' }
        registry.add('logging.level.org.springframework.web') { 'DEBUG' }
    }



    def cleanupSpec() {
        mongoDBContainer.stop()
    }

    def "should create and retrieve a task"() {
        try {
        given: "a new task to create"
        def task = new TaskEntity(
            title: "Integration Test Task",
            description: "Testing task creation via REST API",
            status: "TODO",
            priority: "HIGH"
        )

        when: "we create the task via POST request"
        def createResponse = restTemplate.postForEntity("/api/tasks", task, TaskEntity)

        then: "the task should be created successfully"
        createResponse.statusCode == HttpStatus.CREATED
        createResponse.body.id != null
        createResponse.body.title == task.title
        createResponse.body.status == "TODO"
        createResponse.body.priority == "HIGH"
        createResponse.body.createdAt != null
        createResponse.body.updatedAt != null

        when: "we retrieve the created task"
        def getResponse = restTemplate.getForEntity("/api/tasks/${createResponse.body.id}", TaskEntity)

        then: "we should get the same task back"
        getResponse.statusCode == HttpStatus.OK
        with(getResponse.body) {
            id == createResponse.body.id
            title == task.title
            description == task.description
            status == "TODO"
            priority == "HIGH"
            !completed
        }

        when: "we get all tasks"
        def allTasksResponse = restTemplate.getForEntity("/api/tasks", List)

        then: "our task should be in the list"
        allTasksResponse.statusCode == HttpStatus.OK
        allTasksResponse.body.size() > 0
        allTasksResponse.body.find { it.id == createResponse.body.id }
        } catch (Exception e) {
            println "[TEST ERROR] Failed to create/retrieve task: ${e.message}"
            e.printStackTrace()
            throw e
        }
    }

    def "should handle task lifecycle"() {
        try {
        given: "a new task"
        def task = new TaskEntity(
            title: "Lifecycle Test Task",
            description: "Testing full task lifecycle",
            status: "TODO",
            priority: "MEDIUM"
        )

        when: "we create the task"
        def createResponse = restTemplate.postForEntity("/api/tasks", task, TaskEntity)
        def taskId = createResponse.body.id

        then: "task should be created"
        createResponse.statusCode == HttpStatus.CREATED
        taskId != null

        when: "we update the task status"
        def updatedTask = createResponse.body
        updatedTask.status = "IN_PROGRESS"
        restTemplate.put("/api/tasks/${taskId}", updatedTask)
        def getUpdatedResponse = restTemplate.getForEntity("/api/tasks/${taskId}", TaskEntity)

        then: "status should be updated"
        getUpdatedResponse.statusCode == HttpStatus.OK
        getUpdatedResponse.body.status == "IN_PROGRESS"

        when: "we toggle task completion"
        restTemplate.patchForObject("/api/tasks/${taskId}/toggle", null, TaskEntity)
        def getCompletedResponse = restTemplate.getForEntity("/api/tasks/${taskId}", TaskEntity)

        then: "task should be marked as completed"
        getCompletedResponse.statusCode == HttpStatus.OK
        getCompletedResponse.body.completed
        getCompletedResponse.body.status == "DONE"

        when: "we delete the task"
        restTemplate.delete("/api/tasks/${taskId}")
        def getDeletedResponse = restTemplate.getForEntity("/api/tasks/${taskId}", TaskEntity)

        then: "task should not be found"
        getDeletedResponse.statusCode == HttpStatus.NOT_FOUND
        } catch (Exception e) {
            println "[TEST ERROR] Failed in task lifecycle test: ${e.message}"
            e.printStackTrace()
            throw e
        }
    }
}
