#!/usr/bin/env -S kotlin -cp /home/msloan/.sdkman/candidates/kotlin/current/lib/kotlin-main-kts.jar

@file:DependsOn("org.springframework:spring-web:5.3.30")
@file:DependsOn("org.springframework:spring-context:5.3.30")
@file:DependsOn("com.fasterxml.jackson.core:jackson-databind:2.14.2")
@file:DependsOn("com.fasterxml.jackson.module:jackson-module-kotlin:2.14.2")
@file:Repository("https://repo.maven.apache.org/maven2/")

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
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*

/**
 * Kotlin script for getting all users from the AWS Starter API
 * Uses the UserController endpoint in aws-starter-api service
 */

// Configuration for the API service
val API_SERVICE_URL = "http://13.52.157.48:8080"
val USERS_ENDPOINT = "/api/users"

// Create RestTemplate with proper message converters
val restTemplate = RestTemplate()
restTemplate.messageConverters.clear()
restTemplate.messageConverters.add(MappingJackson2HttpMessageConverter())
restTemplate.messageConverters.add(StringHttpMessageConverter())

// Set up headers
val headers = HttpHeaders()
headers.accept = listOf(MediaType.APPLICATION_JSON)
val requestEntity = HttpEntity<Any>(headers)

// Print test header
println("\n========== GET ALL USERS TEST ==========\n")
println("Testing endpoint: $API_SERVICE_URL$USERS_ENDPOINT")
println("Time: ${LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)}")
println("\n======================================\n")

try {
    // Measure response time
    val startTime = Instant.now()
    
    // Make the API call
    val responseType = object : ParameterizedTypeReference<List<Map<String, Any>>>() {}
    val response = restTemplate.exchange<List<Map<String, Any>>>(
        "$API_SERVICE_URL$USERS_ENDPOINT",
        HttpMethod.GET,
        requestEntity,
        responseType
    )
    
    // Calculate response time
    val endTime = Instant.now()
    val duration = Duration.between(startTime, endTime)
    
    println("\n========== RESPONSE INFO ==========\n")
    println("Status: ${response.statusCode}")
    println("Response time: ${duration.toMillis()} ms")
    println("Content-Type: ${response.headers.contentType}")
    
    // Process the response
    val users = response.body ?: emptyList()
    
    println("\n========== USERS (${users.size}) ==========\n")
    
    // Print user details in a formatted table
    println(String.format("%-24s | %-30s | %-30s | %-20s | %-25s | %-25s", 
        "ID", "Display Name", "Email", "Organization", "Created At", "Last Login"))
    println("-".repeat(160))
    
    users.forEach { user ->
        println(String.format("%-24s | %-30s | %-30s | %-20s | %-25s | %-25s",
            user["id"] ?: "N/A",
            user["displayName"] ?: "N/A",
            user["email"] ?: "N/A",
            user["organization"] ?: "N/A",
            user["createdAt"] ?: "N/A",
            user["lastLogin"] ?: "N/A"
        ))
    }
    
    println("\n========== TEST COMPLETED ==========\n")
    println("Test result: SUCCESS")
    
} catch (e: HttpClientErrorException) {
    // Handle HTTP client error responses (4xx)
    println("\n========== HTTP CLIENT ERROR ==========\n")
    println("Status: ${e.statusCode}")
    println("Error: ${e.responseBodyAsString}")
    
    printTroubleshootingTips()
    
} catch (e: HttpServerErrorException) {
    // Handle HTTP server error responses (5xx)
    println("\n========== HTTP SERVER ERROR ==========\n")
    println("Status: ${e.statusCode}")
    println("Error: ${e.responseBodyAsString}")
    
    printTroubleshootingTips()
    
} catch (e: Exception) {
    println("\n========== EXCEPTION CAUGHT ==========\n")
    println("Exception type: ${e.javaClass.name}")
    println("Message: ${e.message}")
    println("\nStack trace:")
    e.printStackTrace()
    
    printTroubleshootingTips()
}

fun printTroubleshootingTips() {
    println("\nTroubleshooting tips:")
    println("1. Check if the aws-starter-api service is running at $API_SERVICE_URL")
    println("2. Verify network connectivity to the service")
    println("3. Check if the users endpoint is correctly configured")
    println("4. If using the dual-gateway architecture, verify the gateway configuration")
    println("5. Remember that Spring Cloud Gateway uses StripPrefix=1, so the path may need adjustment")
    
    println("\n========== TEST COMPLETED ==========\n")
    println("Test result: FAILED")
}
