package com.example.trello_clone.controller;

import com.example.trello_clone.dto.CreateTaskRequest;
import com.example.trello_clone.entity.Task;
import com.example.trello_clone.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.trello_clone.dto.MoveTaskRequest;

@RestController
@RequestMapping("/api/columns/{columnId}/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@PathVariable Long columnId,
                                           @RequestBody CreateTaskRequest request) {
        Task task = taskService.createTask(columnId, request);
        return ResponseEntity.ok(task);
    }

    @GetMapping
    public ResponseEntity<List<Task>> getTasks(@PathVariable Long columnId) {
        return ResponseEntity.ok(taskService.getTasksByColumnId(columnId));
    }

    @PutMapping("/{taskId}/move")
    public ResponseEntity<Task> moveTask(@PathVariable Long columnId,
                                         @PathVariable Long taskId,
                                         @RequestBody MoveTaskRequest request) {
        Task updatedTask = taskService.moveTask(taskId, request);
        return ResponseEntity.ok(updatedTask);
    }

    // === NEW METHOD TO ADD ===
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long columnId, // Not used, but in path
                                           @PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        // 204 No Content is the standard response for a successful DELETE
        return ResponseEntity.noContent().build();
    }
    // ========================
}