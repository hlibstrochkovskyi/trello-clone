package com.example.trello_clone.controller;

import com.example.trello_clone.dto.CreateColumnRequest;
import com.example.trello_clone.dto.MoveTaskRequest; // Мы используем его DTO для /move
import com.example.trello_clone.entity.TaskColumn;
import com.example.trello_clone.service.TaskColumnService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<TaskColumn> moveColumn(@PathVariable Long boardId,
                                                 @PathVariable Long columnId,
                                                 @RequestBody MoveTaskRequest request) {
        // Мы используем DTO от MoveTask, так как нам нужно только newPosition
        TaskColumn updatedColumn = taskColumnService.moveColumn(columnId, request.getNewPosition());
        return ResponseEntity.ok(updatedColumn);
    }

    // --- НОВЫЙ ЭНДПОИНТ УДАЛЕНИЯ ---
    @DeleteMapping("/{columnId}")
    public ResponseEntity<Void> deleteColumn(@PathVariable Long boardId, // Не используется, но в URL
                                             @PathVariable Long columnId) {
        taskColumnService.deleteColumn(columnId);
        return ResponseEntity.noContent().build(); // Стандартный ответ 204 (No Content)
    }
}