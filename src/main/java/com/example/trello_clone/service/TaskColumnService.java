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

    public TaskColumnService(TaskColumnRepository taskColumnRepository, BoardRepository boardRepository) {
        this.taskColumnRepository = taskColumnRepository;
        this.boardRepository = boardRepository;
    }

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

    public List<TaskColumn> getColumnsByBoardId(Long boardId) {
        return taskColumnRepository.findByBoardIdOrderByPositionAsc(boardId);
    }

    @Transactional
    public TaskColumn moveColumn(Long columnId, Integer newPosition) {
        TaskColumn column = taskColumnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));

        Long boardId = column.getBoard().getId();

        // 1. Получаем все колонки доски
        List<TaskColumn> columns = taskColumnRepository.findByBoardIdOrderByPositionAsc(boardId);

        // 2. Удаляем перемещаемую колонку из списка
        columns.removeIf(c -> c.getId().equals(columnId));

        // 3. Вставляем в новую позицию
        if (newPosition < 0) newPosition = 0;
        if (newPosition > columns.size()) newPosition = columns.size();

        columns.add(newPosition, column);

        // 4. Перезаписываем позиции всем колонкам (0, 1, 2...)
        for (int i = 0; i < columns.size(); i++) {
            TaskColumn c = columns.get(i);
            c.setPosition(i);
            taskColumnRepository.save(c);
        }

        return column;
    }
}