package com.example.trello_clone.repository;

import com.example.trello_clone.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;


/**
 * Repository interface for managing task entities.
 * Provides methods for performing CRUD operations and custom queries on the Task entity.
 */
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByColumnIdOrderByPositionAsc(Long columnId);


    /**
     * Decrements the positions of tasks in a column after a specified position.
     * This method is used to close the gap in task positions when a task is removed.
     *
     * @param columnId The ID of the column containing the tasks.
     * @param afterPosition The position after which tasks will have their positions decremented.
     */    @Modifying
    @Query("UPDATE Task t SET t.position = t.position - 1 WHERE t.column.id = :columnId AND t.position > :afterPosition")
    void decrementPositionsAfter(@Param("columnId") Long columnId, @Param("afterPosition") Integer afterPosition);


    /**
     * Increments the positions of tasks in a column starting from a specified position.
     * Used to make room for a new task.
     *
     * @param columnId The ID of the column.
     * @param fromPosition The position from which tasks will be incremented.
     */
    @Modifying
    @Query("UPDATE Task t SET t.position = t.position + 1 WHERE t.column.id = :columnId AND t.position >= :fromPosition")
    void incrementPositionsFrom(@Param("columnId") Long columnId, @Param("fromPosition") Integer fromPosition);


    /**
     * Increments the positions of tasks within a specific range in a column.
     * Used when moving tasks within the same column (shifting down the range).
     *
     * @param columnId The ID of the column.
     * @param start The start position of the range.
     * @param end The end position of the range.
     */
    @Modifying
    @Query("UPDATE Task t SET t.position = t.position + 1 WHERE t.column.id = :columnId AND t.position >= :start AND t.position < :end")
    void incrementPositionsBetween(@Param("columnId") Long columnId, @Param("start") Integer start, @Param("end") Integer end);


    /**
     * Decrements the positions of tasks within a specific range in a column.
     * Used when moving tasks within the same column (shifting up the range).
     *
     * @param columnId The ID of the column.
     * @param start The start position of the range.
     * @param end The end position of the range.
     */
    @Modifying
    @Query("UPDATE Task t SET t.position = t.position - 1 WHERE t.column.id = :columnId AND t.position > :start AND t.position <= :end")
    void decrementPositionsBetween(@Param("columnId") Long columnId, @Param("start") Integer start, @Param("end") Integer end);
}