import { create } from 'zustand';
import api from '../services/api';

/**
 * Board Store
 * 
 * Global state management for Trello-like boards, columns, and tasks using Zustand.
 * Implements optimistic UI updates with server synchronization and automatic rollback on failures.
 * Handles all CRUD operations for boards, columns, and tasks with drag-and-drop support.
 * 
 * @store useBoardStore
 * 
 * State:
 * @property {Array<Object>} boards - List of all user boards
 * @property {Object|null} currentBoard - Currently active board with columns and tasks
 * @property {boolean} isLoading - Loading state for async operations
 * @property {string|null} error - Error message from failed operations
 * 
 * Actions:
 * Board Operations:
 * @property {Function} createBoard - Creates a new board
 * @property {Function} deleteBoard - Deletes a board with optimistic update
 * @property {Function} fetchBoards - Retrieves all user boards
 * @property {Function} fetchBoardDetails - Loads full board data with columns and tasks
 * 
 * Column Operations:
 * @property {Function} createColumn - Creates a new column in a board
 * @property {Function} deleteColumn - Deletes a column with optimistic update
 * @property {Function} moveColumn - Reorders columns with drag-and-drop
 * 
 * Task Operations:
 * @property {Function} createTask - Creates a new task in a column
 * @property {Function} deleteTask - Deletes a task with optimistic update
 * @property {Function} moveTask - Moves tasks within or between columns
 * @property {Function} updateTaskDetails - Updates task title and description
 */
const useBoardStore = create((set, get) => ({
  // List of all boards for the current user
  boards: [],
  
  // Currently active board data (including columns and tasks)
  currentBoard: null,
  
  // Loading state for async operations
  isLoading: false,
  
  // Error state for failed operations
  error: null,

  /**
   * Creates a new board
   * Adds the new board to the local boards array on success
   * 
   * @async
   * @function createBoard
   * @param {string} boardName - Name of the board to create
   * @returns {Promise<void>}
   */
  createBoard: async (boardName) => {
    try {
      // Send POST request to create board
      const response = await api.post('/boards', { name: boardName, description: '' });
      const newBoard = response.data;
      
      // Add the new board to the local boards array
      set((state) => ({
        boards: [...state.boards, newBoard]
      }));
    } catch (error) {
      console.error("Failed to create board:", error);
      alert("Failed to create board");
    }
  },

  /**
   * Deletes a board with optimistic UI update
   * Automatically rolls back changes if the API call fails
   * 
   * @async
   * @function deleteBoard
   * @param {number} boardId - ID of the board to delete
   * @returns {Promise<void>}
   */
  deleteBoard: async (boardId) => {
    // Save current state for potential rollback
    const previousBoards = get().boards;

    // Optimistically remove the board from UI
    set((state) => ({
      boards: state.boards.filter(b => b.id !== boardId)
    }));
    
    try {
      // Send DELETE request to server
      await api.delete(`/boards/${boardId}`);
    } catch (error) {
      console.error("Failed to delete board:", error);
      // Rollback on failure
      set({ boards: previousBoards });
      alert("Failed to delete board");
    }
  },

  /**
   * Fetches all boards for the current user
   * Updates the boards list in state
   * 
   * @async
   * @function fetchBoards
   * @returns {Promise<void>}
   */
  fetchBoards: async () => {
    set({ isLoading: true });
    
    try {
      const response = await api.get('/boards');
      set({ boards: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  /**
   * Fetches complete board details including all columns and tasks
   * Loads columns first, then fetches tasks for each column
   * Sorts columns by position before setting state
   * 
   * @async
   * @function fetchBoardDetails
   * @param {number} boardId - ID of the board to fetch
   * @returns {Promise<void>}
   */
  fetchBoardDetails: async (boardId) => {
    set({ isLoading: true });
    
    try {
      // Step 1: Load all columns for the board
      const columnsRes = await api.get(`/boards/${boardId}/columns`);
      const columns = columnsRes.data;

      // Step 2: Load tasks for each column in parallel
      const columnsWithTasks = await Promise.all(
        columns.map(async (col) => {
          const tasksRes = await api.get(`/columns/${col.id}/tasks`);
          return { ...col, tasks: tasksRes.data }; 
        })
      );

      // Step 3: Sort columns by position
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

  /**
   * Moves a task within the same column or between columns
   * Implements optimistic UI update with automatic rollback on API failure
   * Supports drag-and-drop functionality
   * 
   * @async
   * @function moveTask
   * @param {number} taskId - ID of the task to move
   * @param {number|string} sourceColId - ID of the source column
   * @param {number|string} destColId - ID of the destination column
   * @param {number} sourceIndex - Original position in source column
   * @param {number} destIndex - New position in destination column
   * @returns {Promise<void>}
   */
  moveTask: async (taskId, sourceColId, destColId, sourceIndex, destIndex) => {
    // Deep clone current board state for potential rollback
    const previousBoard = JSON.parse(JSON.stringify(get().currentBoard));
    
    // Optimistically update UI
    set((state) => {
      const board = JSON.parse(JSON.stringify(state.currentBoard));
      const sourceCol = board.columns.find(c => c.id.toString() === sourceColId.toString());
      const destCol = board.columns.find(c => c.id.toString() === destColId.toString());

      if (!sourceCol || !destCol) return {};

      // Remove task from source column
      const [movedTask] = sourceCol.tasks.splice(sourceIndex, 1);
      // Insert task into destination column at new position
      destCol.tasks.splice(destIndex, 0, movedTask);

      return { currentBoard: board };
    });

    try {
      // Sync with server
      await api.put(`/columns/${sourceColId}/tasks/${taskId}/move`, {
        targetColumnId: Number(destColId),
        newPosition: destIndex
      });
    } catch (error) {
      console.error("Failed to move task on server:", error);
      // Rollback to previous state on failure
      set({ currentBoard: previousBoard });
      alert("Failed to save move. Reverting changes.");
    }
  },

  /**
   * Creates a new task in a specified column
   * Adds the task to the end of the column's task list
   * 
   * @async
   * @function createTask
   * @param {number} columnId - ID of the column to add the task to
   * @param {Object} taskData - Task data object
   * @param {string} taskData.title - Task title
   * @param {string} taskData.description - Task description
   * @returns {Promise<void>}
   */
  createTask: async (columnId, taskData) => {
    try {
      const response = await api.post(`/columns/${columnId}/tasks`, taskData);
      const newTask = response.data;

      // Add new task to the column
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
  
  /**
   * Creates a new column in a board
   * Initializes the column with an empty tasks array
   * 
   * @async
   * @function createColumn
   * @param {number} boardId - ID of the board to add the column to
   * @param {Object} requestData - Column data object
   * @param {string} requestData.name - Column name
   * @returns {Promise<void>}
   */
  createColumn: async (boardId, requestData) => {
    try {
      const response = await api.post(`/boards/${boardId}/columns`, requestData);
      const newColumn = response.data;
      
      // Initialize with empty tasks array
      newColumn.tasks = []; 

      // Add new column to the board
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
  
  /**
   * Moves a column to a new position within the board
   * Implements optimistic UI update with automatic rollback on API failure
   * Supports drag-and-drop functionality for column reordering
   * 
   * @async
   * @function moveColumn
   * @param {number} columnId - ID of the column to move
   * @param {number} sourceIndex - Original position of the column
   * @param {number} destIndex - New position for the column
   * @returns {Promise<void>}
   */
  moveColumn: async (columnId, sourceIndex, destIndex) => {
    const { currentBoard } = get();
    const boardId = currentBoard.id;
    const previousColumns = JSON.parse(JSON.stringify(currentBoard.columns));

    // Step 1: Optimistic UI update (move locally)
    set((state) => {
      const columns = state.currentBoard.columns;
      const [movedColumn] = columns.splice(sourceIndex, 1);
      columns.splice(destIndex, 0, movedColumn);
      return { currentBoard: { ...state.currentBoard, columns } };
    });

    // Step 2: Sync with server
    try {
      await api.put(`/boards/${boardId}/columns/${columnId}/move`, {
        targetColumnId: columnId,
        newPosition: destIndex
      });
    } catch (error) {
      console.error("Failed to move column on server:", error);
      // Step 3: Rollback on failure
      set({ currentBoard: { ...currentBoard, columns: previousColumns } });
      alert("Failed to save column movement. Reverting changes.");
    }
  },

  /**
   * Deletes a task from a column
   * Implements optimistic UI update with automatic rollback on API failure
   * Reindexes remaining tasks after deletion
   * 
   * @async
   * @function deleteTask
   * @param {number} columnId - ID of the column containing the task
   * @param {number} taskId - ID of the task to delete
   * @returns {Promise<void>}
   */
  deleteTask: async (columnId, taskId) => {
    // Save current state for potential rollback
    const previousBoard = JSON.parse(JSON.stringify(get().currentBoard));

    // Optimistically remove task from UI
    set((state) => {
      const board = JSON.parse(JSON.stringify(state.currentBoard));
      const column = board.columns.find(c => c.id === columnId);
      
      if (column) {
        // Remove task from array
        column.tasks = column.tasks.filter(t => t.id !== taskId);
        // Reindex remaining tasks
        column.tasks.forEach((task, index) => {
          task.position = index;
        });
      }
      
      return { currentBoard: board };
    });

    try {
      // Send DELETE request to server
      await api.delete(`/columns/${columnId}/tasks/${taskId}`);
    } catch (error) {
      console.error("Failed to delete task:", error);
      // Rollback on failure
      set({ currentBoard: previousBoard });
      alert("Failed to delete task. Reverting changes.");
    }
  },

  /**
   * Deletes a column from the board
   * Implements optimistic UI update with automatic rollback on API failure
   * Reindexes remaining columns after deletion
   * 
   * @async
   * @function deleteColumn
   * @param {number} columnId - ID of the column to delete
   * @returns {Promise<void>}
   */
  deleteColumn: async (columnId) => {
    const { currentBoard } = get();
    const boardId = currentBoard.id;
    const previousBoard = JSON.parse(JSON.stringify(currentBoard));

    // Optimistically remove column from UI
    set((state) => {
      const board = JSON.parse(JSON.stringify(state.currentBoard));
      // Remove column from array
      board.columns = board.columns.filter(c => c.id !== columnId);
      // Reindex remaining columns
      board.columns.forEach((col, index) => {
        col.position = index;
      });
      return { currentBoard: board };
    });

    try {
      // Send DELETE request to server
      await api.delete(`/boards/${boardId}/columns/${columnId}`);
    } catch (error) {
      console.error("Failed to delete column:", error);
      // Rollback on failure
      set({ currentBoard: previousBoard });
      alert("Failed to delete column. Reverting changes.");
    }
  },

  /**
   * Updates task details (title and/or description)
   * Implements optimistic UI update with automatic rollback on API failure
   * Searches across all columns to find the task
   * 
   * @async
   * @function updateTaskDetails
   * @param {number} taskId - ID of the task to update
   * @param {Object} newData - Updated task data
   * @param {string} [newData.title] - New task title
   * @param {string} [newData.description] - New task description
   * @returns {Promise<void>}
   */
  updateTaskDetails: async (taskId, newData) => {
    // Save current state for potential rollback
    const previousBoard = JSON.parse(JSON.stringify(get().currentBoard));
    let taskFound = false;

    // Optimistically update task in UI
    set((state) => {
      const board = JSON.parse(JSON.stringify(state.currentBoard));
      
      // Search for task across all columns
      for (const column of board.columns) {
        const task = column.tasks.find(t => t.id === taskId);
        if (task) {
          // Apply updates to task
          Object.assign(task, newData); 
          taskFound = true;
          break; 
        }
      }
      
      // Return unchanged state if task not found
      if (!taskFound) return {}; 
      return { currentBoard: board };
    });

    // Exit if task was not found
    if (!taskFound) return; 

    try {
      // Sync with server
      await api.put(`/tasks/${taskId}`, newData);
    } catch (error) {
      console.error("Failed to update task:", error);
      // Rollback on failure
      set({ currentBoard: previousBoard });
      alert("Failed to save task details. Reverting changes.");
    }
  }
}));

export default useBoardStore;