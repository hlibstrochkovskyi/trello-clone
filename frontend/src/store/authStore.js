import { create } from 'zustand';
import authService from '../services/authService';

/**
 * Authentication Store
 * 
 * Global state management for user authentication using Zustand.
 * Handles user login, logout, and session persistence.
 * Integrates with authService for API calls and token management.
 * 
 * @store useAuthStore
 * 
 * State:
 * @property {Object|null} user - Currently authenticated user object or null
 * @property {boolean} isLoading - Loading state for async authentication operations
 * @property {string|null} error - Error message from failed authentication attempts
 * 
 * Actions:
 * @property {Function} login - Authenticates user with credentials
 * @property {Function} logout - Logs out current user and clears session
 */
const useAuthStore = create((set) => ({
  // Initialize user from localStorage if available
  user: authService.getCurrentUser(),
  
  // Loading state for authentication operations
  isLoading: false,
  
  // Error state for authentication failures
  error: null,

  /**
   * Logs in a user with provided credentials
   * Updates global state with user data on success
   * 
   * @async
   * @function login
   * @param {Object} userData - User login credentials
   * @param {string} userData.username - Username
   * @param {string} userData.password - User password
   * @returns {Promise<Object>} Authenticated user data with token
   * @throws {Error} When authentication fails
   */
  login: async (userData) => {
    // Set loading state and clear previous errors
    set({ isLoading: true, error: null });
    
    try {
      // Attempt authentication via service
      const data = await authService.login(userData);
      
      // Update state with authenticated user
      set({ user: data, isLoading: false });
      
      return data;
    } catch (error) {
      // Handle authentication error
      set({ 
        error: error.response?.data || 'Login failed', 
        isLoading: false 
      });
      throw error;
    }
  },

  /**
   * Logs out the current user
   * Clears user session from localStorage and resets state
   * 
   * @function logout
   * @returns {void}
   */
  logout: () => {
    // Clear authentication data from localStorage
    authService.logout();
    
    // Reset user state
    set({ user: null });
  }
}));

export default useAuthStore;