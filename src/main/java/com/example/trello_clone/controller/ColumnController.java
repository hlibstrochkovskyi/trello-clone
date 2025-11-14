package com.example.trello_clone.controller;

import com.example.trello_clone.dto.CreateColumnRequest;
import com.example.trello_clone.entity.TaskColumn;
import com.example.trello_clone.service.TaskColumnService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.trello_clone.dto.MoveTaskRequest; // Reusing DTO

import java.util.List;

@RestController
@RequestMapping("/api/boards/{boardId}/columns")
public class ColumnController {

    private final TaskColumnService taskColumnService;

    public ColumnController(TaskColumnService taskColumnService) {
        this.taskColumnService = taskColumnService;
    }

    @PostMapping
    public ResponseEntity<TaskColumn> createColumn(@PathVariable Long boardId,
                                                   @RequestBody CreateColumnRequest request) {
        TaskColumn column = taskColumnService.createColumn(boardId, request);
        return ResponseEntity.ok(column);
    }

    @GetMapping
    public ResponseEntity<List<TaskColumn>> getColumns(@PathVariable Long boardId) {
        return ResponseEntity.ok(taskColumnService.getColumnsByBoardId(boardId));
    }

    @PutMapping("/{columnId}/move")
    public ResponseEntity<TaskColumn> moveColumn(@PathVariable Long boardId, // Not used in logic, but present in path
                                                 @PathVariable Long columnId,
                                                 @RequestBody MoveTaskRequest request) {
        // We are using newPosition from MoveTaskRequest.
        // A column shift request is simpler than tasks, since it is always within a single board
        TaskColumn updatedColumn = taskColumnService.moveColumn(columnId, request.getNewPosition());
        return ResponseEntity.ok(updatedColumn);
    }
}