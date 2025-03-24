package com.example.loginservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String id;
    private String email;
    private String name;
    private String organization;
    private boolean success;
    private String message;
}
