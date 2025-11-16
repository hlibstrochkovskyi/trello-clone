package com.example.trello_clone.service;

import com.example.trello_clone.dto.CreateTaskRequest;
import com.example.trello_clone.dto.MoveTaskRequest;
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

        // 1. Получаем ВСЕ задачи из ИСХОДНОЙ колонки (отсортированные)
        List<Task> sourceTasks = taskRepository.findByColumnIdOrderByPositionAsc(sourceColumn.getId());

        // 2. Удаляем перемещаемую задачу из старого списка (в памяти Java)
        sourceTasks.removeIf(t -> t.getId().equals(taskId));

        // 3. Если колонка изменилась, обновляем позиции в СТАРОЙ колонке (закрываем дырку)
        if (!sourceColumn.getId().equals(targetColumn.getId())) {
            updateTaskPositions(sourceTasks); // Метод ниже
        }

        // 4. Определяем список задач ЦЕЛЕВОЙ колонки
        List<Task> targetTasks;
        if (sourceColumn.getId().equals(targetColumn.getId())) {
            targetTasks = sourceTasks; // Та же колонка
        } else {
            targetTasks = taskRepository.findByColumnIdOrderByPositionAsc(targetColumn.getId());
        }

        // 5. Вставляем задачу в НОВУЮ позицию в списке
        // Защита от выхода за границы массива
        int newPos = request.getNewPosition();
        if (newPos < 0) newPos = 0;
        if (newPos > targetTasks.size()) newPos = targetTasks.size();

        // Обновляем данные самой задачи
        task.setColumn(targetColumn);
        targetTasks.add(newPos, task);

        // 6. Пересчитываем позиции для ВСЕГО целевого списка (0, 1, 2...)
        updateTaskPositions(targetTasks);

        return taskRepository.save(task);
    }

    // Вспомогательный метод: просто проставляет 0, 1, 2... всем задачам в списке
    private void updateTaskPositions(List<Task> tasks) {
        for (int i = 0; i < tasks.size(); i++) {
            Task t = tasks.get(i);
            t.setPosition(i);
            taskRepository.save(t); // Hibernate отложит SQL до конца транзакции
        }
    }

    public List<Task> getTasksByColumnId(Long columnId) {
        return taskRepository.findByColumnIdOrderByPositionAsc(columnId);
    }
}