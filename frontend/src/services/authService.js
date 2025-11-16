import api from './api';

/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls and token management.
 * Manages user registration, login, logout, and session persistence using localStorage.
 * 
 * @namespace authService
 */
const authService = {
  /**
   * Registers a new user account
   * 
   * @async
   * @function register
   * @param {Object} userData - User registration data
   * @param {string} userData.username - Desired username
   * @param {string} userData.password - User password
   * @param {string} [userData.email] - User email (optional)
   * @returns {Promise<Object>} Registration response data
   * @throws {Error} When registration fails
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Authenticates a user and stores the session token
   * Saves the authentication token and user data to localStorage for session persistence
   * 
   * @async
   * @function login
   * @param {Object} userData - User login credentials
   * @param {string} userData.username - Username
   * @param {string} userData.password - User password
   * @returns {Promise<Object>} Login response containing token and user data
   * @throws {Error} When authentication fails
   */
  login: async (userData) => {
    const response = await api.post('/auth/login', userData);
    
    if (response.data.token) {
      // Store authentication token in browser localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  },

  /**
   * Logs out the current user
   * Removes authentication token and user data from localStorage
   * 
   * @function logout
   * @returns {void}
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Retrieves the currently authenticated user from localStorage
   * 
   * @function getCurrentUser
   * @returns {Object|null} Current user object or null if not authenticated
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;