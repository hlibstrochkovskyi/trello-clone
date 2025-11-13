package com.example.trello_clone.repository;

import com.example.trello_clone.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Long> {
    // Find all boards belonging to a specific user
    List<Board> findByUserId(Long userId);
}