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
  fetchBoardDetails: async (boardId) => {
    set({ isLoading: true });
    try {
      // 1. Load columns
      const columnsRes = await api.get(`/boards/${boardId}/columns`);
      const columns = columnsRes.data;

      // 2. For each column we load tasks
      const columnsWithTasks = await Promise.all(
        columns.map(async (col) => {
          const tasksRes = await api.get(`/columns/${col.id}/tasks`);
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
    const previousBoard = JSON.parse(JSON.stringify(get().currentBoard));
    
    set((state) => {
      const board = JSON.parse(JSON.stringify(state.currentBoard));
      const sourceCol = board.columns.find(c => c.id.toString() === sourceColId.toString());
      const destCol = board.columns.find(c => c.id.toString() === destColId.toString());

      if (!sourceCol || !destCol) return {};

      const [movedTask] = sourceCol.tasks.splice(sourceIndex, 1);
      destCol.tasks.splice(destIndex, 0, movedTask);

      return { currentBoard: board };
    });

    try {
      await api.put(`/columns/${sourceColId}/tasks/${taskId}/move`, {
        targetColumnId: Number(destColId),
        newPosition: destIndex
      });
    } catch (error) {
      console.error("Failed to move task on server:", error);
      set({ currentBoard: previousBoard });
      alert("Failed to save move. Reverting changes.");
    }
  },

  // Create a new task
  createTask: async (columnId, taskData) => {
    try {
        const response = await api.post(`/columns/${columnId}/tasks`, taskData);
        const newTask = response.data;

        set((state) => {
            const board = JSON.parse(JSON.stringify(state.currentBoard));
            const column = board.columns.find(c => c.id === columnId);
            if (column) {
                if (!column.tasks) column.tasks = [];
                column.tasks.push(newTask);
            }
            return { currentBoard: board };
        });
    } catch (error) {
        console.error("Error creating task:", error);
        alert("Failed to create task");
    }
  },
  
  // Create a new column
  createColumn: async (boardId, requestData) => {
    try {
        const response = await api.post(`/boards/${boardId}/columns`, requestData);
        const newColumn = response.data;
        
        newColumn.tasks = []; 

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
  },
  
  // --- NEW: Move Column Logic ---
  moveColumn: async (columnId, sourceIndex, destIndex) => {
    const { currentBoard } = get();
    const boardId = currentBoard.id;
    const previousColumns = JSON.parse(JSON.stringify(currentBoard.columns));

    // 1. Optimistic UI Update (move locally)
    set((state) => {
        const columns = state.currentBoard.columns;
        const [movedColumn] = columns.splice(sourceIndex, 1);
        columns.splice(destIndex, 0, movedColumn);
        return { currentBoard: { ...state.currentBoard, columns } };
    });

    // 2. Send API request to persist change
    try {
        // PUT /api/boards/{boardId}/columns/{columnId}/move
        await api.put(`/boards/${boardId}/columns/${columnId}/move`, {
            // Reusing MoveTaskRequest DTO structure for consistency
            targetColumnId: columnId, // Not strictly needed, but simplifies DTO reuse
            newPosition: destIndex    // The new index is the new position
        });
    } catch (error) {
        console.error("Failed to move column on server:", error);
        // 3. Rollback on failure
        set({ currentBoard: { ...currentBoard, columns: previousColumns } });
        alert("Failed to save column movement. Reverting changes.");
    }
  }
}));

export default useBoardStore;