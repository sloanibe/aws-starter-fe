package com.example.guests.util

import com.example.guests.model.Guest
import com.mongodb.ConnectionString
import com.mongodb.MongoClientSettings
import com.mongodb.client.MongoClients
import com.mongodb.client.MongoCollection
import com.mongodb.client.model.Filters
import org.bson.Document
import org.bson.types.ObjectId
import org.slf4j.LoggerFactory
import java.util.concurrent.TimeUnit

object MongoDbClient {
    private val logger = LoggerFactory.getLogger(MongoDbClient::class.java)
    private val mongoClient by lazy { createMongoClient() }
    
    private fun createMongoClient() = try {
        val uri = System.getenv("MONGODB_URI") ?: "mongodb://admin:admin123@13.52.157.48:27017/aws_starter_db"
        val connectionString = ConnectionString(uri)
        
        val settings = MongoClientSettings.builder()
            .applyConnectionString(connectionString)
            .applyToSocketSettings { builder ->
                builder.connectTimeout(5000, TimeUnit.MILLISECONDS)
                builder.readTimeout(10000, TimeUnit.MILLISECONDS)
            }
            .build()
            
        MongoClients.create(settings)
    } catch (e: Exception) {
        logger.error("Failed to create MongoDB client", e)
        throw e
    }
    
    private fun getCollection(): MongoCollection<Document> {
        val dbName = System.getenv("MONGODB_DATABASE") ?: "aws_starter_db"
        val collectionName = System.getenv("MONGODB_COLLECTION") ?: "guests"
        return mongoClient.getDatabase(dbName).getCollection(collectionName)
    }
    
    fun saveGuest(guest: Guest): String {
        try {
            val document = Guest.toDocument(guest)
            val result = getCollection().insertOne(document)
            return document.getObjectId("_id").toHexString()
        } catch (e: Exception) {
            logger.error("Failed to save guest", e)
            throw e
        }
    }
    
    fun getGuest(id: String): Guest? {
        try {
            val objectId = ObjectId(id)
            val document = getCollection().find(Filters.eq("_id", objectId)).first()
            return document?.let { Guest.fromDocument(it) }
        } catch (e: Exception) {
            logger.error("Failed to get guest with id: $id", e)
            throw e
        }
    }
    
    fun getAllGuests(): List<Guest> {
        try {
            return getCollection().find()
                .map { Guest.fromDocument(it) }
                .toList()
        } catch (e: Exception) {
            logger.error("Failed to get all guests", e)
            throw e
        }
    }
}
