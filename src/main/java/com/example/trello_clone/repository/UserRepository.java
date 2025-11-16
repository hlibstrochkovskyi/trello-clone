package com.example.trello_clone.repository;

import com.example.trello_clone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;


/**
 * Repository interface for managing user entities.
 * Provides methods for performing CRUD operations on the User entity.
 */
public interface UserRepository extends JpaRepository<User, Long> {


    /**
     * Finds a user by their username.
     *
     * @param username The username of the user to find.
     * @return An Optional containing the user if found, or empty if not found.
     */
    Optional<User> findByUsername(String username);


    /**
     * Checks if a username already exists in the database.
     *
     * @param username The username to check.
     * @return True if the username exists, false otherwise.
     */
    Boolean existsByUsername(String username);


    /**
     * Checks if an email already exists in the database.
     *
     * @param email The email to check.
     * @return True if the email exists, false otherwise.
     */
    Boolean existsByEmail(String email);
}