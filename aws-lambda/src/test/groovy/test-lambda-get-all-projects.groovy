#!/usr/bin/env groovy

@Grab('org.springframework:spring-web:5.3.30')
@Grab('org.springframework:spring-context:5.3.30')
@Grab('com.fasterxml.jackson.core:jackson-databind:2.14.2')

import org.springframework.web.client.RestTemplate
import org.springframework.http.HttpMethod
import org.springframework.http.ResponseEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.core.ParameterizedTypeReference
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.HttpServerErrorException
import org.springframework.web.client.RestClientException
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter
import org.springframework.http.converter.StringHttpMessageConverter
import java.time.LocalDateTime
import java.time.Duration
import java.time.Instant

// Test configuration
def apiUrl = "http://localhost:3000" // Local SAM API endpoint
// For AWS deployment, use:
// def apiUrl = "https://your-api-id.execute-api.us-west-1.amazonaws.com/prod"

// Configure RestTemplate with proper message converters
def restTemplate = new RestTemplate()
restTemplate.messageConverters.clear()
restTemplate.messageConverters.add(new MappingJackson2HttpMessageConverter())
restTemplate.messageConverters.add(new StringHttpMessageConverter())

println "===== Testing Lambda GET /projects endpoint ====="
println "API URL: ${apiUrl}"
println "Timestamp: ${LocalDateTime.now()}"
println "----------------------------------------------"

// Measure response time
def startTime = Instant.now()

try {
    // Make the API call
    def responseType = new ParameterizedTypeReference<List<Map<String, Object>>>() {}
    def response = restTemplate.exchange(
        "${apiUrl}/projects", 
        HttpMethod.GET, 
        null, 
        responseType
    )
    
    // Calculate response time
    def endTime = Instant.now()
    def duration = Duration.between(startTime, endTime)
    
    // Print response details
    println "Status: ${response.statusCode}"
    println "Response time: ${duration.toMillis()} ms"
    println "Content-Type: ${response.headers.getContentType()}"
    println "----------------------------------------------"
    
    // Print projects
    def projects = response.body
    println "Found ${projects.size()} projects:"
    projects.each { project ->
        println "- ${project.id}: ${project.name} (${project.status})"
    }
    
    println "----------------------------------------------"
    println "Test PASSED!"
    
} catch (HttpClientErrorException | HttpServerErrorException e) {
    println "Status: ${e.statusCode}"
    println "Error: ${e.responseBodyAsString}"
    println "----------------------------------------------"
    println "Test FAILED!"
} catch (RestClientException e) {
    println "Connection Error: ${e.message}"
    println "----------------------------------------------"
    println "Test FAILED!"
    println "Troubleshooting tips:"
    println "1. Make sure SAM local API is running: sam local start-api"
    println "2. Check if MongoDB is accessible from the Lambda function"
    println "3. Verify the Lambda function has the correct environment variables"
} catch (Exception e) {
    println "Unexpected Error: ${e.message}"
    e.printStackTrace()
    println "----------------------------------------------"
    println "Test FAILED!"
}
