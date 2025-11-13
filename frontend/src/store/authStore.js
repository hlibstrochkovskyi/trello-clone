import { create } from 'zustand';
import authService from '../services/authService';

const useAuthStore = create((set) => ({
  user: authService.getCurrentUser(), // Check if user is logged in
  isLoading: false,
  error: null,

  login: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(userData);
      set({ user: data, isLoading: false });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data || 'Ошибка входа', 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null });
  }
}));

export default useAuthStore;