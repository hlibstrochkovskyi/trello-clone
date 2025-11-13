package com.example.trello_clone.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users") // Maps to the "users" table in the database
@Data // Lombok: Generates getters, setters, toString, equals, and hashCode
@NoArgsConstructor // Required by JPA/Hibernate
@AllArgsConstructor // Generates a constructor with all fields
@Builder // pattern for easy object creation
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Maps to PostgreSQL BIGSERIAL (auto-increment)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false) // Maps to "password_hash" column in DB
    private String password;

    @Column(name = "is_active")
    @Builder.Default // Ensures the default value is used when building the object
    private Boolean isActive = true;

    @CreationTimestamp // Automatically sets the timestamp when the entity is first saved
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp // Automatically updates the timestamp whenever the entity is modified
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}