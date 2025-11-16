import { create } from 'zustand';

/**
 * UI Store
 * 
 * Global state management for UI-related state using Zustand.
 * Manages modal visibility and tracks which UI elements are currently active.
 * Currently handles task detail modal state and selected task tracking.
 * 
 * @store useUiStore
 * 
 * State:
 * @property {boolean} isTaskModalOpen - Whether the task detail modal is currently visible
 * @property {number|null} selectedTaskId - ID of the currently selected task, or null if none selected
 * 
 * Actions:
 * @property {Function} openTaskModal - Opens the task detail modal for a specific task
 * @property {Function} closeTaskModal - Closes the task detail modal and clears selection
 */
const useUiStore = create((set) => ({
  // Modal visibility state
  isTaskModalOpen: false,
  
  // Currently selected task ID
  selectedTaskId: null,
  
  /**
   * Opens the task detail modal for a specific task
   * Sets the modal visibility to true and stores the selected task ID
   * 
   * @function openTaskModal
   * @param {number} taskId - ID of the task to display in the modal
   * @returns {void}
   */
  openTaskModal: (taskId) => set({ 
    isTaskModalOpen: true, 
    selectedTaskId: taskId 
  }),
  
  /**
   * Closes the task detail modal
   * Resets both modal visibility and selected task ID to their default states
   * 
   * @function closeTaskModal
   * @returns {void}
   */
  closeTaskModal: () => set({ 
    isTaskModalOpen: false, 
    selectedTaskId: null 
  }),
}));

export default useUiStore;