package com.example.tests

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import org.junit.jupiter.api.Test
import java.util.*

class GuestServiceTests {
    
    // Update this with your deployed API Gateway URL after deployment
    // Once you set up custom domain, this would be https://api.sloandev.net/guests
    private val apiUrl = "https://your-api-gateway-url.execute-api.us-west-1.amazonaws.com/prod/guests"
    
    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                prettyPrint = true
                isLenient = true
                ignoreUnknownKeys = true
            })
        }
    }
    
    @Test
    fun `test register guest and get all guests`() = runBlocking {
        // Create a test guest with random email to avoid duplicates
        val randomSuffix = UUID.randomUUID().toString().substring(0, 8)
        val testGuest = GuestRequest(
            name = "Test User $randomSuffix",
            email = "test$randomSuffix@example.com",
            organization = "Test Organization"
        )
        
        // Register the guest
        val registerResponse = client.post(apiUrl) {
            contentType(ContentType.Application.Json)
            setBody(testGuest)
        }
        
        println("Register Response Status: ${registerResponse.status}")
        val registerBody: GuestResponse = registerResponse.body()
        println("Register Response: $registerBody")
        
        assert(registerResponse.status.isSuccess()) { "Failed to register guest: ${registerBody.message}" }
        assert(registerBody.success) { "Registration response indicates failure: ${registerBody.message}" }
        assert(registerBody.id != null) { "No guest ID returned in registration response" }
        
        // Get all guests to verify the new guest is included
        val getAllResponse = client.get(apiUrl)
        println("Get All Response Status: ${getAllResponse.status}")
        val getAllBody: GuestListResponse = getAllResponse.body()
        println("Get All Response: ${getAllBody.guests.size} guests found")
        
        assert(getAllResponse.status.isSuccess()) { "Failed to get all guests: ${getAllBody.message}" }
        assert(getAllBody.success) { "Get all guests response indicates failure: ${getAllBody.message}" }
        
        // Verify our test guest is in the list
        val foundGuest = getAllBody.guests.find { it.email == testGuest.email }
        assert(foundGuest != null) { "Test guest not found in the list of all guests" }
        
        println("Test completed successfully!")
    }
    
    @Serializable
    data class GuestRequest(
        val name: String,
        val email: String,
        val organization: String
    )
    
    @Serializable
    data class GuestResponse(
        val id: String? = null,
        val name: String = "",
        val email: String = "",
        val organization: String = "",
        val createdAt: Long = 0,
        val success: Boolean = false,
        val message: String? = null
    )
    
    @Serializable
    data class GuestListResponse(
        val guests: List<GuestResponse> = emptyList(),
        val count: Int = 0,
        val success: Boolean = false,
        val message: String? = null
    )
}
