#!/usr/bin/env groovy

@Grab(group='org.springframework', module='spring-web', version='5.3.30')
@Grab(group='org.springframework', module='spring-context', version='5.3.30')
@Grab(group='com.fasterxml.jackson.core', module='jackson-databind', version='2.14.2')

import groovy.json.JsonOutput
import org.springframework.web.client.RestTemplate
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpEntity
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter
import org.springframework.http.converter.StringHttpMessageConverter
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.HttpServerErrorException
import java.time.Duration
import java.time.Instant
import java.util.Arrays

/**
 * Test script for getting all users from the login service
 * This script connects directly to the login service to retrieve all users
 */

// Configuration for the login service
final String LOGIN_SERVICE_URL = "http://13.52.157.48:8081"
final String usersEndpoint = "/admin/users"
final String fullUrl = LOGIN_SERVICE_URL + usersEndpoint
final def responseType = new ParameterizedTypeReference<List<Map>>() {}

println "\n========== GET ALL USERS TEST ==========\n"
println "Testing endpoint: ${fullUrl}"
println "Time: ${new Date()}"
println "Direct connection to login service"
println "\n======================================\n"

try {
    // Create RestTemplate with proper message converters
    def restTemplate = new RestTemplate()
    restTemplate.messageConverters.clear()
    restTemplate.messageConverters.add(new MappingJackson2HttpMessageConverter())
    restTemplate.messageConverters.add(new StringHttpMessageConverter())
    
    // Set up headers
    def headers = new HttpHeaders()
    headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON))
    def requestEntity = new HttpEntity<>(headers)
    
    // Measure response time
    def startTime = Instant.now()
    
    // Make the API call
    def response = restTemplate.exchange(
        fullUrl,
        HttpMethod.GET,
        requestEntity,
        responseType
    )
    
    // Calculate response time
    def endTime = Instant.now()
    def duration = Duration.between(startTime, endTime)
    
    println "\n========== RESPONSE INFO ==========\n"
    println "Status: ${response.statusCode}"
    println "Response time: ${duration.toMillis()} ms"
    println "Content-Type: ${response.headers.getContentType()}"
    
    // Process the response
    def users = response.body
    
    println "\n========== USERS (${users.size()}) ==========\n"
    
    // Print user details in a formatted table
    println String.format("%-24s | %-30s | %-30s | %-20s | %-25s | %-25s", 
        "ID", "Display Name", "Email", "Organization", "Created At", "Last Login")
    println "-" * 160
    
    users.each { user ->
        println String.format("%-24s | %-30s | %-30s | %-20s | %-25s | %-25s",
            user.id ?: "N/A",
            user.displayName ?: "N/A",
            user.email ?: "N/A",
            user.organization ?: "N/A",
            user.createdAt ?: "N/A",
            user.lastLogin ?: "N/A"
        )
    }
    
    // If no admin endpoint exists, try an alternative approach
    if (users.isEmpty()) {
        println "\n\nNo users found or admin endpoint not available."
        println "Trying alternative approach with login endpoint...\n"
        
        // Try to get a specific user by email
        def loginUrl = LOGIN_SERVICE_URL + "/login"
        def loginRequest = [
            email: "sloanibe@gmail.com",
            name: "Test User",
            organization: "Test Org"
        ]
        
        def loginHeaders = new HttpHeaders()
        loginHeaders.setContentType(MediaType.APPLICATION_JSON)
        def loginEntity = new HttpEntity<>(loginRequest, loginHeaders)
        
        def loginResponse = restTemplate.exchange(
            loginUrl,
            HttpMethod.POST,
            loginEntity,
            Map.class
        )
        
        println "Login response: ${JsonOutput.prettyPrint(JsonOutput.toJson(loginResponse.body))}"
    }
    
    println "\n========== TEST COMPLETED ==========\n"
    println "Test result: SUCCESS"
    
} catch (HttpClientErrorException | HttpServerErrorException e) {
    // Handle HTTP error responses (4xx, 5xx)
    println "\n========== HTTP ERROR ==========\n"
    println "Status: ${e.statusCode}"
    println "Error: ${e.responseBodyAsString}"
    
    println "\nTroubleshooting tips:"
    println "1. Check if the login service is running at ${LOGIN_SERVICE_URL}"
    println "2. Verify that the admin endpoint exists and is accessible"
    println "3. Check if authentication is required for the admin endpoint"
    
    // Try alternative approach with direct MongoDB connection
    println "\n\nAttempting alternative approach..."
    println "To access users directly from MongoDB, use SSH and run:"
    println "ssh -i ~/.ssh/aws-starter-key.pem ubuntu@13.52.157.48 \"sudo mongosh admin --eval 'db.auth(\\\"admin\\\", \\\"admin123\\\"); db.getSiblingDB(\\\"aws_starter_db\\\").users.find().pretty()'\""
    
    println "\n========== TEST COMPLETED ==========\n"
    println "Test result: FAILED"
    
} catch (Exception e) {
    println "\n========== EXCEPTION CAUGHT ==========\n"
    println "Exception type: ${e.class.name}"
    println "Message: ${e.message}"
    println "\nStack trace:"
    e.printStackTrace()
    
    println "\nTroubleshooting tips:"
    println "1. Check network connectivity to ${LOGIN_SERVICE_URL}"
    println "2. Verify that the login service is running"
    println "3. Check if there are any firewall rules blocking the connection"
    
    println "\n========== TEST COMPLETED ==========\n"
    println "Test result: FAILED"
}
