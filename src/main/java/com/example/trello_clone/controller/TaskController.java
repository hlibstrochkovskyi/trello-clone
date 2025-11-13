package com.example.trello_clone.controller;

import com.example.trello_clone.dto.CreateTaskRequest;
import com.example.trello_clone.entity.Task;
import com.example.trello_clone.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}