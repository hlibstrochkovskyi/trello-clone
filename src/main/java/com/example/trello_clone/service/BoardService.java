package com.example.trello_clone.service;

import com.example.trello_clone.dto.CreateBoardRequest;
import com.example.trello_clone.entity.Board;
import com.example.trello_clone.entity.User;
import com.example.trello_clone.repository.BoardRepository;
import com.example.trello_clone.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.AccessDeniedException; // Import this
import java.util.List;
import java.util.Objects;

@Service
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;


    /**
     * Constructs a new BoardService with the specified repositories.
     *
     * @param boardRepository The repository for managing boards.
     * @param userRepository The repository for managing users.
     */
    public BoardService(BoardRepository boardRepository, UserRepository userRepository) {
        this.boardRepository = boardRepository;
        this.userRepository = userRepository;
    }

    /**
     * Retrieves the currently authenticated user.
     *
     * @return The currently authenticated user.
     * @throws UsernameNotFoundException if the user is not found.
     */
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }


    /**
     * Creates a new board and associates it with the currently authenticated user.
     *
     * @param request The request object containing board details.
     * @return The created board.
     */
    @Transactional
    public Board createBoard(CreateBoardRequest request) {
        User user = getCurrentUser();

        Board board = new Board();
        board.setName(request.getName());
        board.setDescription(request.getDescription());
        board.setUser(user); // Link board to user
        board.setIsArchived(false);

        return boardRepository.save(board);
    }


    /**
     * Retrieves all boards associated with the currently authenticated user.
     *
     * @return A list of boards owned by the user.
     */
    public List<Board> getAllUserBoards() {
        User user = getCurrentUser();
        return boardRepository.findByUserId(user.getId());
    }


    /**
     * Deletes a board owned by the currently authenticated user.
     *
     * @param boardId The ID of the board to be deleted.
     * @throws RuntimeException if the board is not found or the user does not own the board.
     */
    @Transactional
    public void deleteBoard(Long boardId) {
        User user = getCurrentUser();

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        // Security Check: Make sure the user owns this board
        if (!Objects.equals(board.getUser().getId(), user.getId())) {
            // Throw an exception if user is not the owner
            throw new RuntimeException("Access Denied: You do not own this board");
        }

        // Cascade delete will handle tasks and columns
        boardRepository.delete(board);
    }
}