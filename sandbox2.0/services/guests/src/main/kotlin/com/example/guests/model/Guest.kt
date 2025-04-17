package com.example.guests.model

import kotlinx.serialization.Serializable
import org.bson.Document
import org.bson.types.ObjectId
import java.time.Instant

@Serializable
data class Guest(
    val id: String? = null,
    val name: String,
    val email: String,
    val organization: String,
    val createdAt: Long = Instant.now().epochSecond
) {
    companion object {
        fun fromDocument(doc: Document): Guest {
            return Guest(
                id = doc.getObjectId("_id")?.toHexString(),
                name = doc.getString("name") ?: "",
                email = doc.getString("email") ?: "",
                organization = doc.getString("organization") ?: "",
                createdAt = doc.getLong("createdAt") ?: Instant.now().epochSecond
            )
        }
        
        fun toDocument(guest: Guest): Document {
            return Document()
                .append("name", guest.name)
                .append("email", guest.email)
                .append("organization", guest.organization)
                .append("createdAt", guest.createdAt)
        }
    }
}
