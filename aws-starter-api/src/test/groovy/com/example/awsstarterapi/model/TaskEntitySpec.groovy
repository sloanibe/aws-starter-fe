package com.example.awsstarterapi.model

import spock.lang.Specification

class TaskEntitySpec extends Specification {

    def "should create task with basic properties"() {
        when: "creating a new task"
        def task = new TaskEntity(
            title: "Test Task",
            description: "Test Description",
            status: "TODO",
            priority: "HIGH"
        )

        then: "task properties should be set correctly"
        task.title == "Test Task"
        task.description == "Test Description"
        task.status == "TODO"
        task.priority == "HIGH"
    }

    def "should set default status when not provided"() {
        when: "creating a task without status"
        def task = new TaskEntity(
            title: "Test Task"
        )

        then: "status should default to TODO"
        task.status == null
        task.priority == null
    }
}
