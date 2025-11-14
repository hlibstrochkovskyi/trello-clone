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

  // Move a task (Optimistic Update + API Sync)
  moveTask: async (taskId, sourceColId, destColId, sourceIndex, destIndex) => {
    // 1. Save previous state for rollback in case of error
    const previousBoard = JSON.parse(JSON.stringify(get().currentBoard));

    // 2. Optimistically update the UI
    set((state) => {
      const board = JSON.parse(JSON.stringify(state.currentBoard));
      const sourceCol = board.columns.find(c => c.id.toString() === sourceColId.toString());
      const destCol = board.columns.find(c => c.id.toString() === destColId.toString());

      // Safety check
      if (!sourceCol || !destCol) return {};

      // Remove from source and insert into destination
      const [movedTask] = sourceCol.tasks.splice(sourceIndex, 1);
      destCol.tasks.splice(destIndex, 0, movedTask);

      return { currentBoard: board };
    });

    // 3. Send request to the backend
    try {
      // URL structure matches TaskController: /api/columns/{columnId}/tasks/{taskId}/move
      // We use sourceColId for the path, although logic uses request body
      await api.put(`/columns/${sourceColId}/tasks/${taskId}/move`, {
        targetColumnId: Number(destColId),
        newPosition: destIndex
      });
      // Success: do nothing, UI is already updated
    } catch (error) {
      console.error("Failed to move task on server:", error);
      // 4. Revert changes on error
      set({ currentBoard: previousBoard });
      alert("Failed to save move. Reverting changes.");
    }
  },

  // Create a new task
  createTask: async (columnId, taskData) => {
    try {
        // POST /api/columns/{columnId}/tasks
        const response = await api.post(`/columns/${columnId}/tasks`, taskData);
        const newTask = response.data;

        // Update local state immediately
        set((state) => {
            const board = JSON.parse(JSON.stringify(state.currentBoard));
            const column = board.columns.find(c => c.id === columnId);
            if (column) {
                if (!column.tasks) column.tasks = [];
                column.tasks.push(newTask); // Add new task to the end
            }
            return { currentBoard: board };
        });
    } catch (error) {
        console.error("Error creating task:", error);
        alert("Failed to create task");
    }
  },
  
  // --- NEW: Create a new column ---
  createColumn: async (boardId, requestData) => {
    try {
        // POST /api/boards/{boardId}/columns (Controller: ColumnController)
        const response = await api.post(`/boards/${boardId}/columns`, requestData);
        const newColumn = response.data;
        
        // Frontend must manually add the tasks array
        newColumn.tasks = []; 

        // Update local state by adding the new column to the board's columns list
        set((state) => {
            const board = JSON.parse(JSON.stringify(state.currentBoard));
            
            if (board) {
                if (!board.columns) board.columns = [];
                board.columns.push(newColumn);
            }
            return { currentBoard: board };
        });
    } catch (error) {
        console.error("Error creating column:", error);
        alert("Failed to create column");
    }
  }
}));

export default useBoardStore;