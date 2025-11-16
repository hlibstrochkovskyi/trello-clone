package com.example.trello_clone.controller;

import com.example.trello_clone.dto.CreateBoardRequest;
import com.example.trello_clone.entity.Board;
import com.example.trello_clone.service.BoardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


/**
 * REST controller for managing boards.
 * Provides endpoints for creating, retrieving, and deleting boards.
 */
@RestController
@RequestMapping("/api/boards")
public class BoardController {

    private final BoardService boardService;


    /**
     * Constructs a new BoardController with the specified BoardService.
     *
     * @param boardService The service used to manage board operations.
     */
    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }


    /**
     * Creates a new board.
     *
     * Endpoint: POST /api/boards
     *
     * @param request The request body containing board details.
     * @return A ResponseEntity containing the created board.
     */
    @PostMapping
    public ResponseEntity<Board> createBoard(@RequestBody CreateBoardRequest request) {
        Board createdBoard = boardService.createBoard(request);
        return ResponseEntity.ok(createdBoard);
    }


    /**
     * Retrieves all boards for the current user.
     *
     * Endpoint: GET /api/boards
     *
     * @return A ResponseEntity containing a list of boards.
     */
    @GetMapping
    public ResponseEntity<List<Board>> getUserBoards() {
        List<Board> boards = boardService.getAllUserBoards();
        return ResponseEntity.ok(boards);
    }


    /**
     * Deletes a board by its ID.
     *
     * Endpoint: DELETE /api/boards/{boardId}
     *
     * @param boardId The ID of the board to be deleted.
     * @return A ResponseEntity with no content.
     */
    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long boardId) {
        boardService.deleteBoard(boardId);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}