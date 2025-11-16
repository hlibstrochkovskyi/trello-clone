package com.example.trello_clone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


/**
 * Entry point for the Trello Clone application.
 * This class initializes and starts the Spring Boot application.
 */
@SpringBootApplication // Enables auto-configuration and component scanning
public class TrelloCloneApplication {


    /**
     * Main method that serves as the entry point for the application.
     *
     * @param args Command-line arguments passed to the application.
     */
    public static void main(String[] args) {
        SpringApplication.run(TrelloCloneApplication.class, args);
    }
}