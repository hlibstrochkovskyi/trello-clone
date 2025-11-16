import { create } from 'zustand';

/**
 * Этот store отвечает за состояние UI, 
 * например, какие модальные окна открыты.
 */
const useUiStore = create((set) => ({
  isTaskModalOpen: false,
  selectedTaskId: null,
  
  // Функция "Открыть модалку задачи"
  openTaskModal: (taskId) => set({ 
    isTaskModalOpen: true, 
    selectedTaskId: taskId 
  }),
  
  // Функция "Закрыть модалку задачи"
  closeTaskModal: () => set({ 
    isTaskModalOpen: false, 
    selectedTaskId: null 
  }),
}));

export default useUiStore;