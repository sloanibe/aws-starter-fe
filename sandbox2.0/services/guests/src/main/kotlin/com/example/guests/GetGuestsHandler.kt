package com.example.guests

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyRequestEvent
import com.amazonaws.services.lambda.runtime.events.APIGatewayProxyResponseEvent
import com.example.guests.model.GuestListResponse
import com.example.guests.model.GuestResponse
import com.example.guests.util.MongoDbClient
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.slf4j.LoggerFactory

class GetGuestsHandler : RequestHandler<APIGatewayProxyRequestEvent, APIGatewayProxyResponseEvent> {
    private val logger = LoggerFactory.getLogger(GetGuestsHandler::class.java)
    private val json = Json { ignoreUnknownKeys = true }
    
    override fun handleRequest(input: APIGatewayProxyRequestEvent, context: Context): APIGatewayProxyResponseEvent {
        logger.info("Processing get all guests request")
        
        return try {
            // Retrieve all guests from MongoDB
            val guests = MongoDbClient.getAllGuests()
            
            // Map to response objects
            val guestResponses = guests.map { guest ->
                GuestResponse(
                    id = guest.id,
                    name = guest.name,
                    email = guest.email,
                    organization = guest.organization,
                    createdAt = guest.createdAt
                )
            }
            
            // Create the response
            val response = GuestListResponse(
                guests = guestResponses,
                count = guestResponses.size,
                success = true
            )
            
            APIGatewayProxyResponseEvent()
                .withStatusCode(200)
                .withBody(json.encodeToString(response))
                .withHeaders(corsHeaders())
                
        } catch (e: Exception) {
            logger.error("Error processing get all guests request", e)
            
            val errorResponse = GuestListResponse(
                guests = emptyList(),
                count = 0,
                success = false,
                message = "Failed to retrieve guests: ${e.message}"
            )
            
            APIGatewayProxyResponseEvent()
                .withStatusCode(500)
                .withBody(json.encodeToString(errorResponse))
                .withHeaders(corsHeaders())
        }
    }
    
    private fun corsHeaders(): Map<String, String> {
        return mapOf(
            "Content-Type" to "application/json",
            "Access-Control-Allow-Origin" to "https://sloandev.net",
            "Access-Control-Allow-Methods" to "GET, OPTIONS",
            "Access-Control-Allow-Headers" to "Content-Type,X-Amz-Date,Authorization,X-Api-Key"
        )
    }
}
