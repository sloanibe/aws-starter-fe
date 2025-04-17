package com.example.guests.model

import kotlinx.serialization.Serializable

@Serializable
data class GuestRequest(
    val name: String,
    val email: String,
    val organization: String
)
