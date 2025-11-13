package com.example.trello_clone.repository;

import com.example.trello_clone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Find a user by their username (used for login)
    Optional<User> findByUsername(String username);

    // Check if a username already exists (used during registration)
    Boolean existsByUsername(String username);

    // Check if an email already exists (used during registration)
    Boolean existsByEmail(String email);
}