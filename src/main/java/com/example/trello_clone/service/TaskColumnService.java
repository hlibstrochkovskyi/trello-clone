package com.example.trello_clone.service;

import com.example.trello_clone.dto.CreateColumnRequest;
import com.example.trello_clone.dto.MoveTaskRequest;
import com.example.trello_clone.entity.Board;
import com.example.trello_clone.entity.TaskColumn;
import com.example.trello_clone.repository.BoardRepository;
import com.example.trello_clone.repository.TaskColumnRepository;
import com.example.trello_clone.repository.TaskRepository; // New import needed for DND logic
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskColumnService {

    private final TaskColumnRepository taskColumnRepository;
    private final BoardRepository boardRepository;
    private final TaskRepository taskRepository; // Inject TaskRepository to utilize its custom queries

    // Manual Constructor
    public TaskColumnService(TaskColumnRepository taskColumnRepository,
                             BoardRepository boardRepository,
                             TaskRepository taskRepository) {
        this.taskColumnRepository = taskColumnRepository;
        this.boardRepository = boardRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional
    public TaskColumn createColumn(Long boardId, CreateColumnRequest request) {
        // 1. Find the board
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        // 2. Calculate position (add to the end)
        List<TaskColumn> existingColumns = taskColumnRepository.findByBoardIdOrderByPositionAsc(boardId);
        int newPosition = existingColumns.size();

        // 3. Create entity
        TaskColumn column = new TaskColumn();
        column.setTitle(request.getTitle());
        column.setBoard(board);
        column.setPosition(newPosition);
        column.setIsDefault(false);

        return taskColumnRepository.save(column);
    }

    public List<TaskColumn> getColumnsByBoardId(Long boardId) {
        return taskColumnRepository.findByBoardIdOrderByPositionAsc(boardId);
    }

    // === NEW LOGIC: Move Column ===
    @Transactional
    public TaskColumn moveColumn(Long columnId, Integer newPosition) {
        TaskColumn column = taskColumnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));

        Long boardId = column.getBoard().getId();
        Integer oldPosition = column.getPosition();

        if (newPosition.equals(oldPosition)) {
            return column;
        }

        // 1. Moving UP (newPosition < oldPosition)
        if (newPosition < oldPosition) {
            // The task moves up: we need to shift all columns in the range [newPosition, oldPosition - 1] DOWN (+1)
            taskColumnRepository.incrementPositionsBetween(boardId, newPosition, oldPosition - 1);
        }

        // 2. Moving DOWN (newPosition > oldPosition)
        else if (newPosition > oldPosition) {
            // The task moves down: we need to shift all columns in the range [oldPosition + 1, newPosition] UP (-1)
            taskColumnRepository.decrementPositionsBetween(boardId, oldPosition + 1, newPosition);
        }

        // 3. Set a new position for the moved column
        column.setPosition(newPosition);
        return taskColumnRepository.save(column);
    }
}