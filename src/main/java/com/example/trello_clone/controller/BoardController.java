package com.example.trello_clone.controller;

import com.example.trello_clone.dto.CreateBoardRequest;
import com.example.trello_clone.entity.Board;
import com.example.trello_clone.service.BoardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
public class BoardController {

    private final BoardService boardService;

    // Manual Constructor
    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    // 1. Create a new board
    @PostMapping
    public ResponseEntity<Board> createBoard(@RequestBody CreateBoardRequest request) {
        Board createdBoard = boardService.createBoard(request);
        return ResponseEntity.ok(createdBoard);
    }

    // 2. Get all boards for the current user
    @GetMapping
    public ResponseEntity<List<Board>> getUserBoards() {
        List<Board> boards = boardService.getAllUserBoards();
        return ResponseEntity.ok(boards);
    }

    // --- NEW: Delete a board ---
    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long boardId) {
        boardService.deleteBoard(boardId);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}