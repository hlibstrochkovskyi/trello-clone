package com.example.trello_clone.repository;

import com.example.trello_clone.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByColumnIdOrderByPositionAsc(Long columnId);

    // 1. Move the tasks UP (position - 1) to close the "hole" from which the task left
    @Modifying
    @Query("UPDATE Task t SET t.position = t.position - 1 WHERE t.column.id = :columnId AND t.position > :afterPosition")
    void decrementPositionsAfter(@Param("columnId") Long columnId, @Param("afterPosition") Integer afterPosition);

    // 2. Move the tasks DOWN (position + 1) to make room for the new task
    @Modifying
    @Query("UPDATE Task t SET t.position = t.position + 1 WHERE t.column.id = :columnId AND t.position >= :fromPosition")
    void incrementPositionsFrom(@Param("columnId") Long columnId, @Param("fromPosition") Integer fromPosition);

    // 3. Moving WITHIN one column (shifting down the range)
    @Modifying
    @Query("UPDATE Task t SET t.position = t.position + 1 WHERE t.column.id = :columnId AND t.position >= :start AND t.position < :end")
    void incrementPositionsBetween(@Param("columnId") Long columnId, @Param("start") Integer start, @Param("end") Integer end);

    // 4. Moving WITHIN one column (shifting up the range)
    @Modifying
    @Query("UPDATE Task t SET t.position = t.position - 1 WHERE t.column.id = :columnId AND t.position > :start AND t.position <= :end")
    void decrementPositionsBetween(@Param("columnId") Long columnId, @Param("start") Integer start, @Param("end") Integer end);
}