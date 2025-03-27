#!/usr/bin/env groovy

import groovy.json.JsonSlurper
import groovy.json.JsonOutput

/**
 * Debug-focused test script for the getProjectDetail endpoint (by ID)
 * This script tests a different endpoint in the same controller
 * to help isolate if the issue is with the controller registration
 */

// Configuration for the dual-gateway architecture
def apiGatewayUrl = "https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod/api"

// First, get a project ID from the working getAllProjects endpoint
println "\n========== STEP 1: Getting a project ID from getAllProjects ==========\n"
def projectsUrl = new URL("${apiGatewayUrl}/projects")
def projectsConnection = projectsUrl.openConnection()
projectsConnection.setRequestProperty("Content-Type", "application/json")

def projectsStatusCode = projectsConnection.responseCode
println "Projects endpoint status code: ${projectsStatusCode}"

if (projectsStatusCode == 200) {
    def projectsResponseBody = projectsConnection.inputStream.text
    def jsonSlurper = new JsonSlurper()
    def projects = jsonSlurper.parseText(projectsResponseBody)
    
    if (projects && projects.size() > 0) {
        def projectId = projects[0].id
        println "Found project ID: ${projectId}"
        
        // Now test the getProjectDetail endpoint with this ID
        println "\n========== STEP 2: Testing getProjectDetail endpoint ==========\n"
        def projectDetailEndpoint = "/project-details/${projectId}"
        def fullUrl = apiGatewayUrl + projectDetailEndpoint
        
        println "Testing endpoint: ${fullUrl}"
        println "Time: ${new Date()}"
        println "Architecture: AWS API Gateway → Spring Cloud Gateway → aws-starter-api"
        println "Path handling: StripPrefix=1 filter should convert /api/project-details/${projectId} to /project-details/${projectId}"
        
        try {
            // Create URL connection
            println "DEBUG: Creating URL connection to ${fullUrl}"
            def url = new URL(fullUrl)
            def connection = url.openConnection()
            
            // Set request properties
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("Accept", "application/json")
            connection.setConnectTimeout(10000)
            connection.setReadTimeout(10000)
            
            // Execute request with timing
            println "DEBUG: Sending request..."
            def startTime = System.currentTimeMillis()
            
            def statusCode = connection.responseCode
            def responseMessage = connection.responseMessage
            
            def endTime = System.currentTimeMillis()
            def duration = endTime - startTime
            
            println "DEBUG: Request completed in ${duration}ms"
            println "DEBUG: Response Status: ${statusCode} ${responseMessage}"
            
            // Print response headers
            println "\nDEBUG: Response Headers:"
            connection.getHeaderFields().each { key, value ->
                println "  ${key ?: '(null)'}: ${value}"
            }
            
            // Process response
            if (statusCode >= 200 && statusCode < 300) {
                println "\nDEBUG: Successful response received"
                def responseBody = connection.inputStream.text
                
                try {
                    def projectDetail = jsonSlurper.parseText(responseBody)
                    println "\n========== RESULTS ==========\n"
                    println "Project Detail retrieved successfully"
                    def prettyJson = JsonOutput.prettyPrint(JsonOutput.toJson(projectDetail))
                    println prettyJson
                } catch (Exception e) {
                    println "\nDEBUG: Error parsing JSON response"
                    println "DEBUG: Exception: ${e.class.name}: ${e.message}"
                    println "DEBUG: Raw response body:"
                    println responseBody
                }
            } else {
                println "\nDEBUG: Error response received"
                
                def errorStream = connection.errorStream
                def responseBody = ""
                
                if (errorStream) {
                    println "DEBUG: Reading from error stream"
                    responseBody = errorStream.text
                } else {
                    try {
                        println "DEBUG: Error stream not available, trying input stream"
                        responseBody = connection.inputStream.text
                    } catch (Exception e) {
                        println "DEBUG: Both error and input streams unavailable: ${e.message}"
                        responseBody = "No response body available"
                    }
                }
                
                println "\nDEBUG: Error response body:"
                println responseBody
                
                // Provide troubleshooting tips
                println "\n========== TROUBLESHOOTING TIPS ==========\n"
                if (statusCode == 404) {
                    println "404 Not Found - Possible causes:"
                    println "1. The ProjectDetailController is not properly registered"
                    println "2. The endpoint path is incorrect"
                    println "3. No project detail exists with ID ${projectId}"
                    println "4. The controller might be expecting a different ID format"
                } else {
                    println "${statusCode} Error - Review the response details above"
                }
            }
        } catch (Exception e) {
            println "\n========== EXCEPTION CAUGHT ==========\n"
            println "Exception type: ${e.class.name}"
            println "Message: ${e.message}"
            println "\nStack trace:"
            e.printStackTrace()
        }
    } else {
        println "No projects found to test with"
    }
} else {
    println "Error getting projects: ${projectsStatusCode}"
}

println "\n========== TEST COMPLETED ==========\n"
