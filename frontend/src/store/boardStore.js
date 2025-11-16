import { create } from 'zustand';
import api from '../services/api';

const useBoardStore = create((set, get) => ({
  boards: [],
  currentBoard: null, // Current board data (including columns and tasks)
  isLoading: false,
  error: null,

  // --- NEW: Create a Board ---
  createBoard: async (boardName) => {
    try {
        // Send POST request to /api/boards
        const response = await api.post('/boards', { name: boardName, description: '' });
        const newBoard = response.data;
        
        // Add the new board to the local 'boards' array
        set((state) => ({
            boards: [...state.boards, newBoard]
        }));
    } catch (error) {
        console.error("Failed to create board:", error);
        alert("Failed to create board");
    }
  },

  // --- NEW: Delete a Board ---
  deleteBoard: async (boardId) => {
    // Save the current boards list for rollback in case of error
    const previousBoards = get().boards;

    // Optimistically remove the board from the UI
    set((state) => ({
        boards: state.boards.filter(b => b.id !== boardId)
    }));
    
    try {
        // Send DELETE request to /api/boards/{boardId}
        await api.delete(`/boards/${boardId}`);
    } catch (error)
 {
        console.error("Failed to delete board:", error);
        set({ boards: previousBoards }); // Rollback on failure
        alert("Failed to delete board");
    }
  },

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
  
  // Move Column Logic
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
        await api.put(`/boards/${boardId}/columns/${columnId}/move`, {
          targetColumnId: columnId,
          newPosition: destIndex
        });
    } catch (error) {
        console.error("Failed to move column on server:", error);
        // 3. Rollback on failure
        set({ currentBoard: { ...currentBoard, columns: previousColumns } });
        alert("Failed to save column movement. Reverting changes.");
    }
  },

  // Delete a task
  deleteTask: async (columnId, taskId) => {
    const previousBoard = JSON.parse(JSON.stringify(get().currentBoard));

    set((state) => {
        const board = JSON.parse(JSON.stringify(state.currentBoard));
        const column = board.columns.find(c => c.id === columnId);
        
        if (column) {
            column.tasks = column.tasks.filter(t => t.id !== taskId);
            column.tasks.forEach((task, index) => {
                task.position = index;
            });
        }
        return { currentBoard: board };
    });

    try {
        await api.delete(`/columns/${columnId}/tasks/${taskId}`);
    } catch (error) {
        console.error("Failed to delete task:", error);
        set({ currentBoard: previousBoard });
        alert("Failed to delete task. Reverting changes.");
    }
  },

  // Delete a column
  deleteColumn: async (columnId) => {
    const { currentBoard } = get();
    const boardId = currentBoard.id;
    const previousBoard = JSON.parse(JSON.stringify(currentBoard));

    set((state) => {
        const board = JSON.parse(JSON.stringify(state.currentBoard));
        board.columns = board.columns.filter(c => c.id !== columnId);
        board.columns.forEach((col, index) => {
            col.position = index;
        });
        return { currentBoard: board };
    });

    try {
        await api.delete(`/boards/${boardId}/columns/${columnId}`);
    } catch (error) {
        console.error("Failed to delete column:", error);
        set({ currentBoard: previousBoard });
        alert("Failed to delete column. Reverting changes.");
    }
  },

  // Update Task Details (Title, Description)
  updateTaskDetails: async (taskId, newData) => {
    const previousBoard = JSON.parse(JSON.stringify(get().currentBoard));
    let taskFound = false;

    set((state) => {
        const board = JSON.parse(JSON.stringify(state.currentBoard));
        
        for (const column of board.columns) {
            const task = column.tasks.find(t => t.id === taskId);
            if (task) {
                Object.assign(task, newData); 
                taskFound = true;
                break; 
            }
        }
        
        if (!taskFound) return {}; 
        return { currentBoard: board };
    });

    if (!taskFound) return; 

    try {
        await api.put(`/tasks/${taskId}`, newData);
    } catch (error) {
        console.error("Failed to update task:", error);
        set({ currentBoard: previousBoard });
        alert("Failed to save task details. Reverting changes.");
    }
  }
}));

export default useBoardStore;