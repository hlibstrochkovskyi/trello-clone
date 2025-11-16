package com.example.trello_clone.service;

import com.example.trello_clone.dto.CreateColumnRequest;
import com.example.trello_clone.entity.Board;
import com.example.trello_clone.entity.TaskColumn;
import com.example.trello_clone.repository.BoardRepository;
import com.example.trello_clone.repository.TaskColumnRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for managing task columns within the application.
 * Provides methods for creating, updating, moving, and deleting columns.
 */
@Service
public class TaskColumnService {

    private final TaskColumnRepository taskColumnRepository;
    private final BoardRepository boardRepository;

    /**
     * Constructs a new TaskColumnService with the specified repositories.
     *
     * @param taskColumnRepository The repository for managing task columns.
     * @param boardRepository The repository for managing boards.
     */
    public TaskColumnService(TaskColumnRepository taskColumnRepository,
                             BoardRepository boardRepository) {
        this.taskColumnRepository = taskColumnRepository;
        this.boardRepository = boardRepository;
    }

    /**
     * Creates a new column in the specified board.
     *
     * @param boardId The ID of the board where the column will be created.
     * @param request The request object containing column details.
     * @return The created column.
     * @throws RuntimeException if the board with the specified ID is not found.
     */
    @Transactional
    public TaskColumn createColumn(Long boardId, CreateColumnRequest request) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        List<TaskColumn> existingColumns = taskColumnRepository.findByBoardIdOrderByPositionAsc(boardId);
        int newPosition = existingColumns.size();

        TaskColumn column = new TaskColumn();
        column.setTitle(request.getTitle());
        column.setBoard(board);
        column.setPosition(newPosition);
        column.setIsDefault(false);

        return taskColumnRepository.save(column);
    }

    /**
     * Retrieves all columns in a specific board, ordered by their position.
     *
     * @param boardId The ID of the board.
     * @return A list of columns in the specified board.
     */
    public List<TaskColumn> getColumnsByBoardId(Long boardId) {
        return taskColumnRepository.findByBoardIdOrderByPositionAsc(boardId);
    }

    /**
     * Moves a column to a new position within the same board.
     *
     * @param columnId The ID of the column to be moved.
     * @param newPosition The new position for the column.
     * @return The updated column after the move.
     * @throws RuntimeException if the column is not found.
     */
    @Transactional
    public TaskColumn moveColumn(Long columnId, Integer newPosition) {
        TaskColumn column = taskColumnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));

        Long boardId = column.getBoard().getId();
        Integer oldPosition = column.getPosition();

        if (newPosition.equals(oldPosition)) {
            return column;
        }

        List<TaskColumn> columns = taskColumnRepository.findByBoardIdOrderByPositionAsc(boardId);
        columns.removeIf(c -> c.getId().equals(columnId));
        if (newPosition < 0) newPosition = 0;
        if (newPosition > columns.size()) newPosition = columns.size();
        columns.add(newPosition, column);

        updateColumnPositions(columns);

        return column;
    }

    /**
     * Deletes a column and re-indexes the positions of the remaining columns in the board.
     *
     * @param columnId The ID of the column to be deleted.
     * @throws RuntimeException if the column is not found.
     */
    @Transactional
    public void deleteColumn(Long columnId) {
        TaskColumn column = taskColumnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));

        Long boardId = column.getBoard().getId();

        taskColumnRepository.delete(column);

        List<TaskColumn> remainingColumns = taskColumnRepository.findByBoardIdOrderByPositionAsc(boardId);
        updateColumnPositions(remainingColumns);
    }

    /**
     * Updates the positions of columns in a board to ensure they are sequential.
     *
     * @param columns The list of columns to be re-indexed.
     */
    private void updateColumnPositions(List<TaskColumn> columns) {
        for (int i = 0; i < columns.size(); i++) {
            TaskColumn c = columns.get(i);
            c.setPosition(i);
            taskColumnRepository.save(c);
        }
    }
}