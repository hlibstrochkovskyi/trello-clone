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

/**
 * Service class for managing tasks within the application.
 * Provides methods for creating, updating, moving, and deleting tasks.
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskColumnRepository taskColumnRepository;

    /**
     * Constructs a new TaskService with the specified repositories.
     *
     * @param taskRepository The repository for managing tasks.
     * @param taskColumnRepository The repository for managing task columns.
     */
    public TaskService(TaskRepository taskRepository, TaskColumnRepository taskColumnRepository) {
        this.taskRepository = taskRepository;
        this.taskColumnRepository = taskColumnRepository;
    }

    /**
     * Creates a new task in the specified column.
     *
     * @param columnId The ID of the column where the task will be created.
     * @param request The request object containing task details.
     * @return The created task.
     * @throws RuntimeException if the column with the specified ID is not found.
     */
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

    /**
     * Moves a task to a new position within the same column or to a different column.
     *
     * @param taskId The ID of the task to be moved.
     * @param request The request object containing the target column ID and new position.
     * @return The updated task after the move.
     * @throws RuntimeException if the task or target column is not found.
     */
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

    /**
     * Deletes a task and re-indexes the positions of the remaining tasks in the column.
     *
     * @param taskId The ID of the task to be deleted.
     * @throws RuntimeException if the task is not found.
     */
    @Transactional
    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        TaskColumn column = task.getColumn();

        taskRepository.delete(task);

        List<Task> remainingTasks = taskRepository.findByColumnIdOrderByPositionAsc(column.getId());
        updateTaskPositions(remainingTasks);
    }

    /**
     * Updates the details of an existing task.
     *
     * @param taskId The ID of the task to be updated.
     * @param request The request object containing updated task details.
     * @return The updated task.
     * @throws RuntimeException if the task is not found.
     */
    @Transactional
    public Task updateTaskDetails(Long taskId, UpdateTaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }

        return taskRepository.save(task);
    }

    /**
     * Retrieves all tasks in a specific column, ordered by their position.
     *
     * @param columnId The ID of the column.
     * @return A list of tasks in the specified column.
     */
    public List<Task> getTasksByColumnId(Long columnId) {
        return taskRepository.findByColumnIdOrderByPositionAsc(columnId);
    }

    /**
     * Updates the positions of tasks in a column to ensure they are sequential.
     *
     * @param tasks The list of tasks to be re-indexed.
     */
    private void updateTaskPositions(List<Task> tasks) {
        for (int i = 0; i < tasks.size(); i++) {
            Task t = tasks.get(i);
            t.setPosition(i);
            taskRepository.save(t);
        }
    }
}