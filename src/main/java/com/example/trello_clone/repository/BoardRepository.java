package com.example.trello_clone.repository;

import com.example.trello_clone.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


/**
 * Repository interface for managing board entities.
 * Provides methods for performing CRUD operations and custom queries on the Board entity.
 */
public interface BoardRepository extends JpaRepository<Board, Long> {


    /**
     * Retrieves all boards associated with a specific user.
     *
     * @param userId The ID of the user whose boards are to be retrieved.
     * @return A list of boards belonging to the specified user.
     */
    List<Board> findByUserId(Long userId);
}