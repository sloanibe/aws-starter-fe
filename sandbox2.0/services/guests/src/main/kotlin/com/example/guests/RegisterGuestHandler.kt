package com.example.guests

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent
import com.example.guests.model.Guest
import com.example.guests.model.GuestRequest
import com.example.guests.model.GuestResponse
import com.example.guests.util.MongoDbClient
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.slf4j.LoggerFactory
import java.time.Instant

class RegisterGuestHandler : RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private val logger = LoggerFactory.getLogger(RegisterGuestHandler::class.java)
    private val json = Json { ignoreUnknownKeys = true }
    
    override fun handleRequest(input: APIGatewayProxyRequestEvent, context: Context): APIGatewayProxyResponseEvent {
        logger.info("Processing register guest request")
        
        return try {
            // Parse the request body
            val requestBody = input.body
            logger.info("Request body: $requestBody")
            
            if (requestBody.isNullOrBlank()) {
                return createErrorResponse(400, "Request body is required")
            }
            
            val guestRequest = json.decodeFromString<GuestRequest>(requestBody)
            
            // Validate the request
            when {
                guestRequest.name.isBlank() -> return createErrorResponse(400, "Name is required")
                guestRequest.email.isBlank() -> return createErrorResponse(400, "Email is required")
                !isValidEmail(guestRequest.email) -> return createErrorResponse(400, "Invalid email format")
            }
            
            // Create and save the guest
            val guest = Guest(
                name = guestRequest.name,
                email = guestRequest.email,
                organization = guestRequest.organization,
                createdAt = Instant.now().epochSecond
            )
            
            val guestId = MongoDbClient.saveGuest(guest)
            
            // Create the response
            val response = GuestResponse(
                id = guestId,
                name = guest.name,
                email = guest.email,
                organization = guest.organization,
                createdAt = guest.createdAt,
                success = true,
                message = "Guest registered successfully"
            )
            
            APIGatewayProxyResponseEvent()
                .withStatusCode(201)
                .withBody(json.encodeToString(response))
                .withHeaders(corsHeaders())
                
        } catch (e: Exception) {
            logger.error("Error processing register guest request", e)
            createErrorResponse(500, "Failed to register guest: ${e.message}")
        }
    }
    
    private fun isValidEmail(email: String): Boolean {
        val emailRegex = Regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$")
        return emailRegex.matches(email)
    }
    
    private fun createErrorResponse(statusCode: Int, message: String): APIGatewayProxyResponseEvent {
        val response = GuestResponse(
            id = null,
            name = "",
            email = "",
            organization = "",
            createdAt = Instant.now().epochSecond,
            success = false,
            message = message
        )
        
        return APIGatewayProxyResponseEvent()
            .withStatusCode(statusCode)
            .withBody(json.encodeToString(response))
            .withHeaders(corsHeaders())
    }
    
    private fun corsHeaders(): Map<String, String> {
        return mapOf(
            "Content-Type" to "application/json",
            "Access-Control-Allow-Origin" to "https://sloandev.net",
            "Access-Control-Allow-Methods" to "POST, OPTIONS",
            "Access-Control-Allow-Headers" to "Content-Type,X-Amz-Date,Authorization,X-Api-Key"
        )
    }
}
