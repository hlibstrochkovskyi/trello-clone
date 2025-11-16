package com.example.trello_clone.controller;

import com.example.trello_clone.dto.JwtResponse;
import com.example.trello_clone.dto.LoginRequest;
import com.example.trello_clone.dto.RegisterRequest;
import com.example.trello_clone.entity.User;
import com.example.trello_clone.repository.UserRepository;
import com.example.trello_clone.security.JwtUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;


/**
 * Provides endpoints for user login and registration.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;


    /**
     * Constructs a new AuthController with the specified dependencies.
     *
     * @param authenticationManager The authentication manager for user authentication.
     * @param userRepository The repository for managing user data.
     * @param passwordEncoder The encoder for hashing passwords.
     * @param jwtUtils The utility for generating and validating JWT tokens.
     */
    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }


    /**
     * Registers a new user.
     *
     * Endpoint: POST /api/auth/register
     *
     * @param registerRequest The request body containing user registration details.
     * @return A ResponseEntity indicating the result of the registration process.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setIsActive(true);

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }


    /**
     * Authenticates a user and generates a JWT token.
     *
     * Endpoint: POST /api/auth/login
     *
     * @param loginRequest The request body containing user login credentials.
     * @return A ResponseEntity containing the JWT token and user details.
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtUtils.generateJwtToken(userDetails);

        User user = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail()
        ));
    }
}