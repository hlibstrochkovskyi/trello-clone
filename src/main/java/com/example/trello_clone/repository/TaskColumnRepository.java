package com.example.trello_clone.repository;

import com.example.trello_clone.entity.TaskColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskColumnRepository extends JpaRepository<TaskColumn, Long> {
    // Find all columns for a specific board, ordered by position
    List<TaskColumn> findByBoardIdOrderByPositionAsc(Long boardId);
}