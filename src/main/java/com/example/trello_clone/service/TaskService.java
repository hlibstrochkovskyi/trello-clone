package com.example.trello_clone.service;

import com.example.trello_clone.dto.CreateTaskRequest;
import com.example.trello_clone.entity.Task;
import com.example.trello_clone.entity.TaskColumn;
import com.example.trello_clone.repository.TaskColumnRepository;
import com.example.trello_clone.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskColumnRepository taskColumnRepository;

    // Manual Constructor
    public TaskService(TaskRepository taskRepository, TaskColumnRepository taskColumnRepository) {
        this.taskRepository = taskRepository;
        this.taskColumnRepository = taskColumnRepository;
    }

    @Transactional
    public Task createTask(Long columnId, CreateTaskRequest request) {
        // 1. Find the column
        TaskColumn column = taskColumnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));

        // 2. Calculate position (tasks currently in this column)
        // We need a method in repository to count tasks or find max position.
        // For simplicity now, let's fetch all tasks (not efficient for prod, but fine for MVP)
        // OR even simpler: just set 0 for now, we will fix ordering later.
        // Let's do it right: we need a method in TaskRepository.

        // Temporary solution: just save with position 0, we will fix ordering logic in the next step
        // when we implement drag-and-drop logic properly.
        int newPosition = 0;

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setColumn(column);
        task.setPosition(newPosition);

        return taskRepository.save(task);
    }
}