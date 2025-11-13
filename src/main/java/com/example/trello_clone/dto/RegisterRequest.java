package com.example.trello_clone.dto;

import lombok.Data;

@Data
public class RegisterRequest {

    private String username;

    private String password;

    private String email;
}