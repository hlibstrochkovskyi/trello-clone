package com.example.trello_clone.controller;

import com.example.trello_clone.dto.CreateTaskRequest;
import com.example.trello_clone.entity.Task;
import com.example.trello_clone.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.trello_clone.dto.MoveTaskRequest;


/**
 * REST controller for managing tasks within a specific column.
 * Provides endpoints for creating, retrieving, moving, and deleting tasks.
 */
@RestController
@RequestMapping("/api/columns/{columnId}/tasks")
public class TaskController {

    private final TaskService taskService;


    /**
     * Constructs a new TaskController with the specified TaskService.
     *
     * @param taskService The service used to manage task operations.
     */
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }


    /**
     * Creates a new task in the specified column.
     *
     * Endpoint: POST /api/columns/{columnId}/tasks
     *
     * @param columnId The ID of the column where the task will be created.
     * @param request The request body containing task details.
     * @return A ResponseEntity containing the created task.
     */
    @PostMapping
    public ResponseEntity<Task> createTask(@PathVariable Long columnId,
                                           @RequestBody CreateTaskRequest request) {
        Task task = taskService.createTask(columnId, request);
        return ResponseEntity.ok(task);
    }


    /**
     * Retrieves all tasks in the specified column.
     *
     * Endpoint: GET /api/columns/{columnId}/tasks
     *
     * @param columnId The ID of the column whose tasks are to be retrieved.
     * @return A ResponseEntity containing a list of tasks.
     */
    @GetMapping
    public ResponseEntity<List<Task>> getTasks(@PathVariable Long columnId) {
        return ResponseEntity.ok(taskService.getTasksByColumnId(columnId));
    }


    /**
     * Moves a task to a new position or column.
     *
     * Endpoint: PUT /api/columns/{columnId}/tasks/{taskId}/move
     *
     * @param columnId The ID of the column containing the task.
     * @param taskId The ID of the task to be moved.
     * @param request The request body containing move details.
     * @return A ResponseEntity containing the updated task.
     */
    @PutMapping("/{taskId}/move")
    public ResponseEntity<Task> moveTask(@PathVariable Long columnId,
                                         @PathVariable Long taskId,
                                         @RequestBody MoveTaskRequest request) {
        Task updatedTask = taskService.moveTask(taskId, request);
        return ResponseEntity.ok(updatedTask);
    }


    /**
     * Deletes a task from the specified column.
     *
     * Endpoint: DELETE /api/columns/{columnId}/tasks/{taskId}
     *
     * @param columnId The ID of the column containing the task (not used in logic).
     * @param taskId The ID of the task to be deleted.
     * @return A ResponseEntity with no content.
     */
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long columnId, // Not used, but in path
                                           @PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        // 204 No Content is the standard response for a successful DELETE
        return ResponseEntity.noContent().build();
    }

}