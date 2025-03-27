package com.example.apitest

import groovy.json.JsonSlurper
import spock.lang.Specification
import spock.lang.Narrative
import spock.lang.Title

/**
 * Spock test for testing the production API endpoints through the dual-gateway architecture
 */
@Title("Production API Tests")
@Narrative("""
This specification tests the AWS Starter API endpoints in the production environment
through the dual-gateway architecture (AWS API Gateway → Spring Cloud Gateway → Microservices).
""")
class ProductionApiSpec extends Specification {
    // Configuration
    def apiGatewayUrl = "https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod/api"
    def jsonSlurper = new JsonSlurper()
    
    def "should retrieve all projects from production API"() {
        given: "a connection to the projects endpoint"
        def url = new URL("${apiGatewayUrl}/projects")
        def connection = url.openConnection()
        connection.setRequestProperty("Content-Type", "application/json")
        
        when: "the request is executed"
        def responseCode = connection.responseCode
        def responseBody = connection.inputStream.text
        def projects = jsonSlurper.parseText(responseBody)
        
        then: "the response should be successful"
        responseCode == 200
        
        and: "the response should contain a list of projects"
        projects instanceof List
        !projects.isEmpty()
        
        and: "each project should have the expected structure"
        projects.each { project ->
            assert project.id != null
            assert project.name != null
            assert project.description != null
            assert project.status != null
        }
        
        and: "we should see the expected project data"
        def awsStarterProject = projects.find { it.name == "AWS Starter" }
        awsStarterProject != null
        awsStarterProject.description.contains("AWS")
        
        cleanup: "log the test results"
        println "Retrieved ${projects.size()} projects from production API"
        println "Sample project: ${projects[0].name}"
    }
}
