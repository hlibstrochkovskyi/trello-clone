package com.example.trello_clone.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "task_columns",
        uniqueConstraints = @UniqueConstraint(columnNames = {"board_id", "position"})) // Unique position per board
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskColumn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Integer position;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false; // e.g., "To Do", "Done" columns

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Relationship: Many columns belong to one Board
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;
}