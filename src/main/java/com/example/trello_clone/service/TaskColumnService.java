package com.example.trello_clone.service;

import com.example.trello_clone.dto.CreateColumnRequest;
import com.example.trello_clone.entity.Board;
import com.example.trello_clone.entity.TaskColumn;
import com.example.trello_clone.repository.BoardRepository;
import com.example.trello_clone.repository.TaskColumnRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskColumnService {

    private final TaskColumnRepository taskColumnRepository;
    private final BoardRepository boardRepository;

    // Manual Constructor
    public TaskColumnService(TaskColumnRepository taskColumnRepository, BoardRepository boardRepository) {
        this.taskColumnRepository = taskColumnRepository;
        this.boardRepository = boardRepository;
    }

    @Transactional
    public TaskColumn createColumn(Long boardId, CreateColumnRequest request) {
        // 1. Find the board
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        // 2. Calculate position (add to the end)
        // We get all columns for this board to find the current max position
        List<TaskColumn> existingColumns = taskColumnRepository.findByBoardIdOrderByPositionAsc(boardId);
        int newPosition = existingColumns.size(); // If 0 columns, pos is 0. If 2 columns (0, 1), pos is 2.

        // 3. Create entity
        TaskColumn column = new TaskColumn();
        column.setTitle(request.getTitle());
        column.setBoard(board);
        column.setPosition(newPosition);
        column.setIsDefault(false);

        return taskColumnRepository.save(column);
    }

    // Get all columns for a board
    public List<TaskColumn> getColumnsByBoardId(Long boardId) {
        return taskColumnRepository.findByBoardIdOrderByPositionAsc(boardId);
    }
}