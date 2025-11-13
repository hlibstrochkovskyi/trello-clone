import { create } from 'zustand';
import api from '../services/api';

const useBoardStore = create((set, get) => ({
  boards: [],
  currentBoard: null, // Current board data (including columns and tasks)
  isLoading: false,
  error: null,

  // Get a list of all user boards
  fetchBoards: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/boards');
      set({ boards: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Get full board data (Columns + Tasks)
  // Since we don't have a single "getFullBoard" endpoint, we chain requests
  fetchBoardDetails: async (boardId) => {
    set({ isLoading: true });
    try {
      // 1. Load columns
      const columnsRes = await api.get(`/boards/${boardId}/columns`);
      const columns = columnsRes.data;

      // 2. For each column we load tasks
      // Promise.all allows you to make requests in parallel
      const columnsWithTasks = await Promise.all(
        columns.map(async (col) => {
          const tasksRes = await api.get(`/columns/${col.id}/tasks`);
          // Add the tasks array inside the column object for UI convenience
          return { ...col, tasks: tasksRes.data }; 
        })
      );

      // Sort the columns by position (just in case)
      columnsWithTasks.sort((a, b) => a.position - b.position);

      set({ 
        currentBoard: { id: boardId, columns: columnsWithTasks }, 
        isLoading: false 
      });
    } catch (error) {
      console.error("Error fetching board details:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  moveTask: (taskId, sourceColId, destColId, sourceIndex, destIndex) => {
    set((state) => {
      // Deep copy the board to avoid direct mutation
      const board = JSON.parse(JSON.stringify(state.currentBoard));

      // 1. Find the source and destination columns
      const sourceCol = board.columns.find(c => c.id.toString() === sourceColId.toString());
      const destCol = board.columns.find(c => c.id.toString() === destColId.toString());

      // Safety check
      if (!sourceCol || !destCol) return {};

      // 2. Remove the task from the source column
      const [movedTask] = sourceCol.tasks.splice(sourceIndex, 1);

      // 3. Insert the task into the destination column at the new position
      destCol.tasks.splice(destIndex, 0, movedTask);

      // 4. Update the state immediately
      return { currentBoard: board };
    });
  }
}));

export default useBoardStore;