package com.example.trello_clone.controller;

import com.example.trello_clone.dto.UpdateTaskRequest;
import com.example.trello_clone.entity.Task;
import com.example.trello_clone.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Этот контроллер отвечает за операции с конкретной задачей по её ID,
 * независимо от колонки (например, редактирование деталей).
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskDetailController {

    private final TaskService taskService;

    public TaskDetailController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * Обновляет детали задачи (название, описание).
     * URL: PUT /api/tasks/{taskId}
     */
    @PutMapping("/{taskId}")
    public ResponseEntity<Task> updateTask(@PathVariable Long taskId,
                                           @RequestBody UpdateTaskRequest request) {
        Task updatedTask = taskService.updateTaskDetails(taskId, request);
        return ResponseEntity.ok(updatedTask);
    }
}