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

import java.util.List;

@Service
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    // Manual Constructor
    public BoardService(BoardRepository boardRepository, UserRepository userRepository) {
        this.boardRepository = boardRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Board createBoard(CreateBoardRequest request) {
        // 1. Get the username of the currently logged-in user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Find the User entity in the DB
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // 3. Create the Board object manually
        Board board = new Board();
        board.setName(request.getName());
        board.setDescription(request.getDescription());
        board.setUser(user); // Link board to user
        board.setIsArchived(false);

        // 4. Save to DB
        return boardRepository.save(board);
    }

    public List<Board> getAllUserBoards() {
        // Get current user's name
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Return all boards belonging to this user
        return boardRepository.findByUserId(user.getId());
    }
}