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
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.HttpServerErrorException
import java.util.Arrays

/**
 * Debug-focused test script for the getAllProjectDetails API endpoint
 * This script includes extensive debugging to help troubleshoot issues
 * in the dual-gateway architecture
 */

// Configuration for the dual-gateway architecture
final String API_GATEWAY_URL = "https://vab90wx4u0.execute-api.us-west-1.amazonaws.com/prod/api"

// Define the endpoint and response type
final String projectDetailsEndpoint = "/project-details"
final String fullUrl = API_GATEWAY_URL + projectDetailsEndpoint
final def responseType = new ParameterizedTypeReference<List<Map>>() {}

println "\n========== DEBUG INFO ==========\n"
println "Testing endpoint: ${fullUrl}"
println "Time: ${new Date()}"
println "Architecture: AWS API Gateway → Spring Cloud Gateway → aws-starter-api"
println "Path handling: StripPrefix=1 filter should convert /api${projectDetailsEndpoint} to ${projectDetailsEndpoint}"
println "\n==============================\n"

try {
    // Create RestTemplate with proper message converters
    println "DEBUG: Creating RestTemplate with message converters"
    def restTemplate = new RestTemplate()
    def converter = new MappingJackson2HttpMessageConverter()
    converter.setSupportedMediaTypes(Arrays.asList(MediaType.APPLICATION_JSON, MediaType.TEXT_HTML))
    restTemplate.getMessageConverters().add(converter)
    
    // Set up headers
    println "DEBUG: Setting up common headers"
    def headers = new HttpHeaders()
    headers.setContentType(MediaType.APPLICATION_JSON)
    headers.set("Accept", "application/json")
    headers.set("User-Agent", "Groovy-Test-Script/1.0")
    
    // Print request headers for debugging
    println "\nDEBUG: Request Headers:"
    headers.entrySet().each { entry ->
        println "  ${entry.key}: ${entry.value}"
    }
    
    def httpEntity = new HttpEntity<>(headers)
    
    // Execute request with timing
    println "\nDEBUG: Sending request..."
    def startTime = System.currentTimeMillis()
    
    try {
        // This is where the actual HTTP request is sent
        def response = restTemplate.exchange(
            fullUrl,
            HttpMethod.GET,
            httpEntity,
            responseType
        )
        
        def statusCode = response.getStatusCode().value()
        def responseHeaders = response.getHeaders()
        
        def endTime = System.currentTimeMillis()
        def duration = endTime - startTime
        
        println "DEBUG: Request completed in ${duration}ms"
        println "DEBUG: Response Status: ${statusCode} OK"
        
        // Print all response headers for debugging
        println "\nDEBUG: Response Headers:"
        responseHeaders.each { name, values ->
            println "  ${name ?: '(null)'}: ${values}"
        }
        
        // Process successful response
        println "\nDEBUG: Successful response received"
        def projectDetails = response.getBody()
        def responseBodyJson = JsonOutput.toJson(projectDetails)
        println "DEBUG: Response body length: ${responseBodyJson.length()} characters"
        
        println "\n========== RESULTS ==========\n"
        println "Project Details retrieved: ${projectDetails instanceof List ? projectDetails.size() : 'Not a list'}"
        
        if (projectDetails instanceof List && !projectDetails.isEmpty()) {
            println "\nSample Project Detail:"
            def prettyJson = JsonOutput.prettyPrint(JsonOutput.toJson(projectDetails[0]))
            println prettyJson
            
            println "\nAll Project Details Structure:"
            projectDetails.eachWithIndex { detail, index ->
                println "  ${index + 1}. ID: ${detail.id}, Project ID: ${detail.projectId}"
            }
        } else if (projectDetails instanceof List) {
            println "Empty list returned - no project details found in the database"
        } else {
            println "Unexpected response format:"
            def prettyJson = JsonOutput.prettyPrint(JsonOutput.toJson(projectDetails))
            println prettyJson
        }
        
    } catch (HttpClientErrorException | HttpServerErrorException e) {
        // Handle HTTP error responses (4xx, 5xx)
        def endTime = System.currentTimeMillis()
        def duration = endTime - startTime
        
        def statusCode = e.getStatusCode().value()
        def responseHeaders = e.getResponseHeaders()
        
        println "DEBUG: Request completed in ${duration}ms"
        println "DEBUG: Response Status: ${statusCode} ${e.getStatusCode().getReasonPhrase()}"
        
        // Print response headers if available
        if (responseHeaders) {
            println "\nDEBUG: Response Headers:"
            responseHeaders.each { name, values ->
                println "  ${name ?: '(null)'}: ${values}"
            }
        }
        
        println "\nDEBUG: Error response received"
        def responseBody = e.getResponseBodyAsString()
        println "DEBUG: Error response body:"
        println responseBody
        
        // Provide troubleshooting tips based on status code
        println "\n========== TROUBLESHOOTING TIPS ==========\n"
        switch (statusCode) {
            case 404:
                println "404 Not Found - Possible causes:"
                println "1. The endpoint path is incorrect (${projectDetailsEndpoint})"
                println "2. The Spring Cloud Gateway is not properly forwarding the request"
                println "3. The StripPrefix=1 filter might not be working correctly"
                println "4. The Controller might not be registered correctly"
                println "\nSuggested actions:"
                println "- Check the Spring Cloud Gateway configuration for the correct route"
                println "- Verify the @RequestMapping in the Controller"
                println "- Try accessing the endpoint directly on the Spring Cloud Gateway (13.52.157.48:8090/api${projectDetailsEndpoint})"
                break
            case 502:
            case 503:
            case 504:
                println "${statusCode} Gateway Error - Possible causes:"
                println "1. Spring Cloud Gateway cannot reach the aws-starter-api service"
                println "2. Service discovery (Eureka) issues"
                println "3. Service is down or not registered"
                println "\nSuggested actions:"
                println "- Check if the aws-starter-api service is running"
                println "- Verify Eureka registration"
                println "- Check network connectivity between gateways and services"
                break
            default:
                println "${statusCode} Error - Review the response details above for more information"
        }
        
        println "\n========== TEST FAILED ==========\n"
        throw e
    }
} catch (Exception e) {
    println "\n========== EXCEPTION CAUGHT ==========\n"
    println "Exception type: ${e.class.name}"
    println "Message: ${e.message}"
    println "\nStack trace:"
    e.printStackTrace()
    
    println "\n========== TROUBLESHOOTING TIPS ==========\n"
    if (e instanceof org.springframework.web.client.ResourceAccessException) {
        if (e.cause instanceof java.net.UnknownHostException) {
            println "DNS resolution failed - Possible causes:"
            println "1. The API Gateway URL is incorrect"
            println "2. Network connectivity issues"
            println "\nSuggested actions:"
            println "- Verify the API Gateway URL: ${API_GATEWAY_URL}"
            println "- Check your internet connection"
            println "- Try pinging the host: ping vab90wx4u0.execute-api.us-west-1.amazonaws.com"
        } else if (e.cause instanceof java.net.SocketTimeoutException) {
            println "Connection timed out - Possible causes:"
            println "1. The service is not responding"
            println "2. The request is taking too long to process"
            println "\nSuggested actions:"
            println "- Check if the aws-starter-api service is running"
            println "- Increase the timeout values in RestTemplate"
            println "- Check for long-running operations in the controller"
        } else {
            println "Resource access exception - Possible causes:"
            println "1. Network connectivity issues"
            println "2. Service unavailable"
            println "\nSuggested actions:"
            println "- Check network connectivity"
            println "- Verify the service is running"
        }
    } else {
        println "General error - Review the exception details above"
        println "Suggested action: Try accessing the endpoint directly on the Spring Cloud Gateway"
        println "Command: curl -v http://13.52.157.48:8090/api${projectDetailsEndpoint}"
    }
    
    println "\n========== TEST FAILED ==========\n"
}

println "\n========== TEST COMPLETED ==========\n"
