package com.example.trello_clone.repository;

import com.example.trello_clone.entity.TaskColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;


/**
 * Repository interface for managing task column entities.
 * Provides methods for performing CRUD operations and custom queries on the TaskColumn entity.
 */
public interface TaskColumnRepository extends JpaRepository<TaskColumn, Long> {


    /**
     * Retrieves all columns for a specific board, ordered by their position.
     *
     * @param boardId The ID of the board.
     * @return A list of task columns ordered by position.
     */
    List<TaskColumn> findByBoardIdOrderByPositionAsc(Long boardId);


    /**
     *
     * @param boardId The ID of the board containing the columns.
     * @param start The start position of the range (new position).
     * @param end The end position of the range (old position - 1).
     */
    @Modifying
    @Query("UPDATE TaskColumn t SET t.position = t.position + 1 WHERE t.board.id = :boardId AND t.position >= :start AND t.position <= :end")
    void incrementPositionsBetween(@Param("boardId") Long boardId, @Param("start") Integer start, @Param("end") Integer end);


    /**
     * Decrements the positions of columns within a specific range in a board.
     * Used when moving a column down (shifting other columns up).
     *
     * @param boardId The ID of the board containing the columns.
     * @param start The start position of the range (old position + 1).
     * @param end The end position of the range (new position).
     */
    @Modifying
    @Query("UPDATE TaskColumn t SET t.position = t.position - 1 WHERE t.board.id = :boardId AND t.position >= :start AND t.position <= :end")
    void decrementPositionsBetween(@Param("boardId") Long boardId, @Param("start") Integer start, @Param("end") Integer end);
}