package com.example.trello_clone.repository;

import com.example.trello_clone.entity.TaskColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TaskColumnRepository extends JpaRepository<TaskColumn, Long> {

    // Find all columns for a specific board, ordered by position
    List<TaskColumn> findByBoardIdOrderByPositionAsc(Long boardId);

    // 1. Moving UP: Shift columns DOWN (+1)
    // Range: [start (new position), end (old position - 1)]
    @Modifying
    @Query("UPDATE TaskColumn t SET t.position = t.position + 1 WHERE t.board.id = :boardId AND t.position >= :start AND t.position <= :end")
    void incrementPositionsBetween(@Param("boardId") Long boardId, @Param("start") Integer start, @Param("end") Integer end);

    // 2. Moving DOWN: Shift columns UP (-1)
    // Range: [start (old position + 1), end (new position)]
    @Modifying
    @Query("UPDATE TaskColumn t SET t.position = t.position - 1 WHERE t.board.id = :boardId AND t.position >= :start AND t.position <= :end")
    void decrementPositionsBetween(@Param("boardId") Long boardId, @Param("start") Integer start, @Param("end") Integer end);
}