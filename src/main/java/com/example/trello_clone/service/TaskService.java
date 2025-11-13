package com.example.trello_clone.service;

import com.example.trello_clone.dto.CreateTaskRequest;
import com.example.trello_clone.entity.Task;
import com.example.trello_clone.entity.TaskColumn;
import com.example.trello_clone.repository.TaskColumnRepository;
import com.example.trello_clone.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.trello_clone.dto.MoveTaskRequest;

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


    @Transactional
    public Task moveTask(Long taskId, MoveTaskRequest request) {
        // 1. Find the problem
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        TaskColumn oldColumn = task.getColumn();
        TaskColumn newColumn = taskColumnRepository.findById(request.getTargetColumnId())
                .orElseThrow(() -> new RuntimeException("Target column not found"));

        Integer oldPosition = task.getPosition();
        Integer newPosition = request.getNewPosition();

        // 2. Scenario A: Moving to ANOTHER column
        if (!oldColumn.getId().equals(newColumn.getId())) {
            // A.1: Close the "hole" in the old column (move all tasks below up)
            taskRepository.decrementPositionsAfter(oldColumn.getId(), oldPosition);

            // A.2: Free up space in the new column (move all tasks below down)
            taskRepository.incrementPositionsFrom(newColumn.getId(), newPosition);

            // A.3: Update the task itself
            task.setColumn(newColumn);
            task.setPosition(newPosition);

        } else {
            // 3. Scenario B: Moving WITHIN the same column
            if (newPosition < oldPosition) {
                // Move the task UP (which means the rest of the tasks in the range need to be moved DOWN)
                taskRepository.incrementPositionsBetween(oldColumn.getId(), newPosition, oldPosition);
            } else if (newPosition > oldPosition) {
                // Move the task DOWN (which means the rest of the tasks in the range need to be moved UP)
                taskRepository.decrementPositionsBetween(oldColumn.getId(), oldPosition, newPosition);
            }
            task.setPosition(newPosition);
        }

        return taskRepository.save(task);
    }


    public List<Task> getTasksByColumnId(Long columnId) {
        return taskRepository.findByColumnIdOrderByPositionAsc(columnId);
    }
}