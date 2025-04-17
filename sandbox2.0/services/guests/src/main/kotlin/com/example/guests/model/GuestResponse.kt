package com.example.guests.model

import kotlinx.serialization.Serializable

@Serializable
data class GuestResponse(
    val id: String? = null,
    val name: String,
    val email: String,
    val organization: String,
    val createdAt: Long,
    val success: Boolean = true,
    val message: String? = null
)

@Serializable
data class GuestListResponse(
    val guests: List<GuestResponse>,
    val count: Int,
    val success: Boolean = true,
    val message: String? = null
)
