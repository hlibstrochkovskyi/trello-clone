package com.example.trello_clone.controller;

import com.example.trello_clone.dto.UpdateTaskRequest;
import com.example.trello_clone.entity.Task;
import com.example.trello_clone.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


/**
 * REST controller for managing task details.
 * Provides endpoints for operations on a specific task by its ID,
 * such as updating task details (e.g., title, description).
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskDetailController {

    private final TaskService taskService;


    /**
     * Constructs a new TaskDetailController with the specified TaskService.
     *
     * @param taskService The service used to manage task operations.
     */
    public TaskDetailController(TaskService taskService) {
        this.taskService = taskService;
    }

    /**
     * Updates the details of a specific task.
     *
     * Endpoint: PUT /api/tasks/{taskId}
     *
     * @param taskId The ID of the task to be updated.
     * @param request The request body containing updated task details.
     * @return A ResponseEntity containing the updated task.
     */
    @PutMapping("/{taskId}")
    public ResponseEntity<Task> updateTask(@PathVariable Long taskId,
                                           @RequestBody UpdateTaskRequest request) {
        Task updatedTask = taskService.updateTaskDetails(taskId, request);
        return ResponseEntity.ok(updatedTask);
    }
}