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

    // Конструктор (мы убрали TaskRepository, так как он здесь больше не нужен)
    public TaskColumnService(TaskColumnRepository taskColumnRepository,
                             BoardRepository boardRepository) {
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
        Integer oldPosition = column.getPosition();

        if (newPosition.equals(oldPosition)) {
            return column;
        }

        // 1. Получаем все колонки
        List<TaskColumn> columns = taskColumnRepository.findByBoardIdOrderByPositionAsc(boardId);
        // 2. Удаляем перемещаемую
        columns.removeIf(c -> c.getId().equals(columnId));
        // 3. Вставляем в новую позицию
        if (newPosition < 0) newPosition = 0;
        if (newPosition > columns.size()) newPosition = columns.size();
        columns.add(newPosition, column);

        // 4. Пересчитываем ВСЕ позиции (наш "железобетонный" метод)
        updateColumnPositions(columns);

        return column; // Spring Data JPA сохранит изменения в 'columns'
    }

    // --- НОВЫЙ МЕТОД УДАЛЕНИЯ ---
    @Transactional
    public void deleteColumn(Long columnId) {
        // 1. Находим колонку (чтобы знать, какую доску обновлять)
        TaskColumn column = taskColumnRepository.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));

        Long boardId = column.getBoard().getId();

        // 2. Удаляем колонку
        // (PostgreSQL автоматически удалит все задачи в ней благодаря 'ON DELETE CASCADE')
        taskColumnRepository.delete(column);

        // 3. Получаем ОСТАВШИЕСЯ колонки
        List<TaskColumn> remainingColumns = taskColumnRepository.findByBoardIdOrderByPositionAsc(boardId);

        // 4. Пересчитываем их позиции (0, 1, 2...), чтобы закрыть "дырку"
        updateColumnPositions(remainingColumns);
    }

    // --- НОВЫЙ ВСПОМОГАТЕЛЬНЫЙ МЕТОД ---
    private void updateColumnPositions(List<TaskColumn> columns) {
        for (int i = 0; i < columns.size(); i++) {
            TaskColumn c = columns.get(i);
            c.setPosition(i);
            taskColumnRepository.save(c);
        }
    }
}