package com.example.trello_clone.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponse {

    // The JWT token needed for authorized requests
    private String token;

    // User ID to identify the user on the frontend
    private Long id;

    private String username;

    private String email;
}