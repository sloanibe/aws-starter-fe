#!/usr/bin/env groovy

@Grab('org.springframework:spring-web:5.3.30')
@Grab('org.springframework:spring-context:5.3.30')
@Grab('com.fasterxml.jackson.core:jackson-databind:2.14.2')

import org.springframework.web.client.RestTemplate
import org.springframework.http.HttpMethod
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.HttpServerErrorException
import org.springframework.web.client.RestClientException
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter
import org.springframework.http.converter.StringHttpMessageConverter
import java.time.LocalDateTime
import java.time.Duration
import java.time.Instant

// Test configuration
def apiUrl = "http://13.52.157.48:8081" // Direct connection to login service
def email = "mark.sloan@example.com"

println "===== Testing Login for Mark Sloan ====="
println "API URL: ${apiUrl}"
println "Email: ${email}"
println "Timestamp: ${LocalDateTime.now()}"
println "----------------------------------------------"

// Configure RestTemplate with proper message converters
def restTemplate = new RestTemplate()
restTemplate.messageConverters.clear()
restTemplate.messageConverters.add(new MappingJackson2HttpMessageConverter())
restTemplate.messageConverters.add(new StringHttpMessageConverter())

// Create login request body
def requestBody = [
    email: email,
    displayName: "Mark Sloan", // Will be used if user doesn't exist yet
    organization: "AWS Starter"
]

// Set headers
def headers = new HttpHeaders()
headers.setContentType(MediaType.APPLICATION_JSON)
def requestEntity = new HttpEntity<>(requestBody, headers)

// Measure response time
def startTime = Instant.now()

try {
    // Make the API call
    def response = restTemplate.exchange(
        "${apiUrl}/api/login", 
        HttpMethod.POST, 
        requestEntity, 
        Map.class
    )
    
    // Calculate response time
    def endTime = Instant.now()
    def duration = Duration.between(startTime, endTime)
    
    // Print response details
    println "Status: ${response.statusCode}"
    println "Response time: ${duration.toMillis()} ms"
    println "Content-Type: ${response.headers.getContentType()}"
    println "----------------------------------------------"
    
    // Print user details
    def user = response.body
    println "User details:"
    println "- ID: ${user.id}"
    println "- Name: ${user.name}"
    println "- Email: ${user.email}"
    println "- Organization: ${user.organization}"
    println "- Success: ${user.success}"
    println "- Message: ${user.message}"
    
    println "----------------------------------------------"
    if (user.success) {
        println "Test PASSED! Mark Sloan exists in the database."
    } else {
        println "Test FAILED! Login was not successful."
    }
    
} catch (HttpClientErrorException | HttpServerErrorException e) {
    println "Status: ${e.statusCode}"
    println "Error: ${e.responseBodyAsString}"
    println "----------------------------------------------"
    println "Test FAILED! HTTP error occurred."
} catch (RestClientException e) {
    println "Connection Error: ${e.message}"
    println "----------------------------------------------"
    println "Test FAILED! Connection error."
    println "Troubleshooting tips:"
    println "1. Make sure the login service is running at ${apiUrl}"
    println "2. Check if MongoDB is accessible from the login service"
    println "3. Verify network connectivity to the login service"
} catch (Exception e) {
    println "Unexpected Error: ${e.message}"
    e.printStackTrace()
    println "----------------------------------------------"
    println "Test FAILED! Unexpected error."
}
