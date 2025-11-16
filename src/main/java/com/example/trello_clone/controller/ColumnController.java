package com.example.trello_clone.controller;

import com.example.trello_clone.dto.CreateColumnRequest;
import com.example.trello_clone.dto.MoveTaskRequest; // Мы используем его DTO для /move
import com.example.trello_clone.entity.TaskColumn;
import com.example.trello_clone.service.TaskColumnService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


/**
 * REST controller for managing columns within a specific board.
 * Provides endpoints for creating, retrieving, moving, and deleting columns.
 */
@RestController
@RequestMapping("/api/boards/{boardId}/columns")
public class ColumnController {

    private final TaskColumnService taskColumnService;


    /**
     * Constructs a new ColumnController with the specified TaskColumnService.
     *
     * @param taskColumnService The service used to manage column operations.
     */
    public ColumnController(TaskColumnService taskColumnService) {
        this.taskColumnService = taskColumnService;
    }


    /**
     * Creates a new column in the specified board.
     *
     * Endpoint: POST /api/boards/{boardId}/columns
     *
     * @param boardId The ID of the board where the column will be created.
     * @param request The request body containing column details.
     * @return A ResponseEntity containing the created column.
     */
    @PostMapping
    public ResponseEntity<TaskColumn> createColumn(@PathVariable Long boardId,
                                                   @RequestBody CreateColumnRequest request) {
        TaskColumn column = taskColumnService.createColumn(boardId, request);
        return ResponseEntity.ok(column);
    }


    /**
     * Retrieves all columns in the specified board.
     *
     * Endpoint: GET /api/boards/{boardId}/columns
     *
     * @param boardId The ID of the board whose columns are to be retrieved.
     * @return A ResponseEntity containing a list of columns.
     */
    @GetMapping
    public ResponseEntity<List<TaskColumn>> getColumns(@PathVariable Long boardId) {
        return ResponseEntity.ok(taskColumnService.getColumnsByBoardId(boardId));
    }


    /**
     * Moves a column to a new position within the board.
     *
     * Endpoint: PUT /api/boards/{boardId}/columns/{columnId}/move
     *
     * @param boardId The ID of the board containing the column.
     * @param columnId The ID of the column to be moved.
     * @param request The request body containing the new position.
     * @return A ResponseEntity containing the updated column.
     */
    @PutMapping("/{columnId}/move")
    public ResponseEntity<TaskColumn> moveColumn(@PathVariable Long boardId,
                                                 @PathVariable Long columnId,
                                                 @RequestBody MoveTaskRequest request) {
        TaskColumn updatedColumn = taskColumnService.moveColumn(columnId, request.getNewPosition());
        return ResponseEntity.ok(updatedColumn);
    }


    /**
     * Deletes a column from the specified board.
     *
     * Endpoint: DELETE /api/boards/{boardId}/columns/{columnId}
     *
     * @param boardId The ID of the board containing the column (not used in logic).
     * @param columnId The ID of the column to be deleted.
     * @return A ResponseEntity with no content.
     */
    @DeleteMapping("/{columnId}")
    public ResponseEntity<Void> deleteColumn(@PathVariable Long boardId,
                                             @PathVariable Long columnId) {
        taskColumnService.deleteColumn(columnId);
        return ResponseEntity.noContent().build();
    }
}