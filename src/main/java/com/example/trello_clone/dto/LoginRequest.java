package com.example.trello_clone.dto;

import lombok.Data;

@Data
public class LoginRequest {
    // The username sent from the login form
    private String username;

    // The password sent from the login form
    private String password;
}