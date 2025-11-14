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

        // 2. Determine the correct position (ADD TO THE END)
        // We get all tasks for the column to determine the new position index.
        List<Task> existingTasks = taskRepository.findByColumnIdOrderByPositionAsc(columnId);
        int newPosition = existingTasks.size(); // If 2 tasks exist (0, 1), the new position is 2.

        // 3. Create entity
        Task task = new Task();
        task.setTitle(request.getTitle());
        // Description is optional, so we check if the request provides it
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }

        task.setColumn(column);
        task.setPosition(newPosition);

        return taskRepository.save(task);
    }


    @Transactional
    public Task moveTask(Long taskId, MoveTaskRequest request) {
        // 1. Find the task and columns
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        TaskColumn oldColumn = task.getColumn();
        TaskColumn newColumn = taskColumnRepository.findById(request.getTargetColumnId())
                .orElseThrow(() -> new RuntimeException("Target column not found"));

        Integer oldPosition = task.getPosition();
        Integer newPosition = request.getNewPosition();

        if (newPosition.equals(oldPosition) && oldColumn.getId().equals(newColumn.getId())) {
            return task;
        }

        // --- ВАЖНЫЙ ИСПРАВИТЕЛЬНЫЙ ШАГ: Временно убираем задачу из диапазона ---
        // Устанавливаем временную позицию -1, чтобы избежать конфликта UNIQUE constraint
        // во время выполнения пакетного UPDATE соседних задач.
        task.setPosition(-1);
        taskRepository.save(task);

        // 2. Сценарий А: Перемещение в ДРУГУЮ колонку
        if (!oldColumn.getId().equals(newColumn.getId())) {
            // А.1: Закрываем "дырку" в старой колонке (все задачи ниже поднимаем вверх)
            taskRepository.decrementPositionsAfter(oldColumn.getId(), oldPosition);

            // А.2: Освобождаем место в новой колонке (все задачи ниже сдвигаем вниз)
            taskRepository.incrementPositionsFrom(newColumn.getId(), newPosition);

        } else {
            // 3. Сценарий Б: Перемещение ВНУТРИ той же колонки
            if (newPosition < oldPosition) {
                // Движение ВВЕРХ: Shift tasks в диапазоне [newPosition, oldPosition - 1] ВНИЗ (+1)
                taskRepository.incrementPositionsBetween(oldColumn.getId(), newPosition, oldPosition - 1);
            } else if (newPosition > oldPosition) {
                // Движение ВНИЗ: Shift tasks в диапазоне [oldPosition + 1, newPosition] ВВЕРХ (-1)
                taskRepository.decrementPositionsBetween(oldColumn.getId(), oldPosition + 1, newPosition);
            }
        }

        // 4. Устанавливаем колонке итоговую позицию и сохраняем
        task.setColumn(newColumn);
        task.setPosition(newPosition);
        return taskRepository.save(task);
    }


    public List<Task> getTasksByColumnId(Long columnId) {
        return taskRepository.findByColumnIdOrderByPositionAsc(columnId);
    }
}