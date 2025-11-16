package com.example.trello_clone.service;

import com.example.trello_clone.dto.CreateTaskRequest;
import com.example.trello_clone.dto.MoveTaskRequest;
import com.example.trello_clone.dto.UpdateTaskRequest;
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

    public TaskService(TaskRepository taskRepository, TaskColumnRepository taskColumnRepository) {
        this.taskRepository = taskRepository;
        this.taskColumnRepository = taskColumnRepository;
    }

    @Transactional
    public Task createTask(Long columnId, CreateTaskRequest request) {
        TaskColumn column = taskColumnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));

        List<Task> existingTasks = taskRepository.findByColumnIdOrderByPositionAsc(columnId);
        int newPosition = existingTasks.size();

        Task task = new Task();
        task.setTitle(request.getTitle());
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        task.setColumn(column);
        task.setPosition(newPosition);

        return taskRepository.save(task);
    }

    @Transactional
    public Task moveTask(Long taskId, MoveTaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        TaskColumn sourceColumn = task.getColumn();
        TaskColumn targetColumn = taskColumnRepository.findById(request.getTargetColumnId())
                .orElseThrow(() -> new RuntimeException("Target column not found"));

        Integer oldPosition = task.getPosition();
        Integer newPosition = request.getNewPosition();

        if (newPosition.equals(oldPosition) && sourceColumn.getId().equals(targetColumn.getId())) {
            return task;
        }

        task.setPosition(-1);
        taskRepository.saveAndFlush(task);

        if (!sourceColumn.getId().equals(targetColumn.getId())) {
            // Logic for moving to a DIFFERENT column
            List<Task> sourceTasks = taskRepository.findByColumnIdOrderByPositionAsc(sourceColumn.getId());
            sourceTasks.removeIf(t -> t.getId().equals(taskId));
            updateTaskPositions(sourceTasks); // Update old column

            List<Task> targetTasks = taskRepository.findByColumnIdOrderByPositionAsc(targetColumn.getId());
            targetTasks.add(newPosition, task);
            updateTaskPositions(targetTasks); // Update new column
        } else {
            // Logic for moving WITHIN the same column
            List<Task> sourceTasks = taskRepository.findByColumnIdOrderByPositionAsc(sourceColumn.getId());
            sourceTasks.removeIf(t -> t.getId().equals(taskId));
            sourceTasks.add(newPosition, task);
            updateTaskPositions(sourceTasks); // Update the single column
        }

        task.setColumn(targetColumn);
        task.setPosition(newPosition);
        return taskRepository.save(task);
    }

    // Helper method to re-index positions
    private void updateTaskPositions(List<Task> tasks) {
        for (int i = 0; i < tasks.size(); i++) {
            Task t = tasks.get(i);
            t.setPosition(i);
            taskRepository.save(t);
        }
    }

    // === NEW METHOD TO ADD ===
    @Transactional
    public void deleteTask(Long taskId) {
        // 1. Find the task to get its column and position
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        TaskColumn column = task.getColumn();

        // 2. Delete the task
        taskRepository.delete(task);

        // 3. Reload the remaining tasks and re-index them
        List<Task> remainingTasks = taskRepository.findByColumnIdOrderByPositionAsc(column.getId());
        updateTaskPositions(remainingTasks);
    }
    // ========================

    @Transactional
    public Task updateTaskDetails(Long taskId, UpdateTaskRequest request) {
        // 1. Находим задачу
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        // 2. Обновляем поля (если они не null в запросе)
        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        // (Здесь в будущем можно добавить обновление dueDate, labels и т.д.)

        // 3. Сохраняем изменения
        return taskRepository.save(task);
    }


    public List<Task> getTasksByColumnId(Long columnId) {
        return taskRepository.findByColumnIdOrderByPositionAsc(columnId);
    }
}