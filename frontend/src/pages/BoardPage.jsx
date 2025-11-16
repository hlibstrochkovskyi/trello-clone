import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useBoardStore from '../store/boardStore';
import Column from '../components/column/Column';
import CreateColumnSection from '../components/column/CreateColumnSection'; 
import TaskDetailModal from '../components/modal/TaskDetailModal'; 

/**
 * BoardPage Component
 * 
 * Main board view displaying columns and tasks with drag-and-drop functionality.
 * Supports dragging tasks between columns and reordering columns.
 * Uses React Beautiful DnD (hello-pangea/dnd) for drag-and-drop capabilities.
 * 
 * Features:
 * - Fetches and displays board data based on URL parameter
 * - Drag-and-drop for both columns and tasks
 * - Task detail modal integration
 * - Column creation functionality
 * 
 * @component
 * @returns {JSX.Element} The board page with draggable columns and tasks
 */
const BoardPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  
  // Get board state and actions from store
  // Note: moveColumn is essential for column reordering functionality
  const { currentBoard, isLoading, fetchBoardDetails, moveTask, moveColumn } = useBoardStore();

  /**
   * Fetch board details when component mounts or boardId changes
   */
  useEffect(() => {
    if (boardId) fetchBoardDetails(boardId);
  }, [boardId, fetchBoardDetails]);

  /**
   * Handles the end of a drag operation for both columns and tasks
   * Determines the type of dragged item and calls appropriate move function
   * 
   * @param {Object} result - Drag result object from React Beautiful DnD
   * @param {Object} result.destination - Drop destination information
   * @param {Object} result.source - Drag source information
   * @param {string} result.draggableId - ID of the dragged element
   * @param {string} result.type - Type of dragged element ('column' or 'task')
   */
  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    // Exit if dropped outside a droppable area
    if (!destination) return;
    
    // Exit if dropped in the same position
    if (
      destination.droppableId === source.droppableId && 
      destination.index === source.index
    ) {
      return;
    }
    
    // Handle column reordering
    if (type === 'column') {
      const columnId = Number(draggableId);
      // Optimistically update UI and sync with backend
      moveColumn(columnId, source.index, destination.index);
      return;
    }
    
    // Handle task movement (within or between columns)
    if (type === 'task') {
      moveTask(
        draggableId,
        source.droppableId,
        destination.droppableId,
        source.index,
        destination.index
      );
      return;
    }
  };

  // Loading state
  if (isLoading) return <div style={{color: 'white'}}>Loading...</div>;
  
  // Board not found state
  if (!currentBoard) return <div style={{color: 'white'}}>Board not found</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={styles.container}>
        {/* Top navigation bar */}
        <div style={styles.topBar}>
          {/* Back button to return to boards list */}
          <button onClick={() => navigate('/')} style={styles.backBtn}>
            ← Back
          </button>
          
          {/* Board title */}
          <h2 style={styles.boardTitle}>
            {currentBoard.name || `Board #${currentBoard.id}`}
          </h2>
        </div>
        
        {/* Droppable area for columns with horizontal layout */}
        <Droppable droppableId="all-columns" direction="horizontal" type="column"> 
          {(provided) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={styles.boardLayout}
            >
              {/* Render each column as a draggable element */}
              {currentBoard.columns.map((column, index) => (
                <Draggable 
                  key={column.id} 
                  draggableId={column.id.toString()} 
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      {/* Column component receives drag handle props for header */}
                      <Column 
                        column={column} 
                        dragHandleProps={provided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              
              {/* Placeholder for drag-and-drop spacing */}
              {provided.placeholder}
              
              {/* Button to create new columns */}
              <CreateColumnSection boardId={currentBoard.id} />
            </div>
          )}
        </Droppable>

        {/* Task detail modal - renders when a task is selected */}
        <TaskDetailModal />
      </div>
    </DragDropContext>
  );
};

/**
 * Component styles
 * Layout and styling for the board page and its elements
 */
const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#242424',
  },
  topBar: {
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#242424',
    color: 'white',
    flexShrink: 0, // Prevent header from shrinking
  },
  backBtn: {
    marginRight: '20px',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
  },
  boardTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
  },
  boardLayout: {
    display: 'flex',
    padding: '20px',
    overflowX: 'auto', // Enable horizontal scrolling for many columns
    overflowY: 'hidden', // Disable vertical scrolling
    flex: 1, // Take up remaining vertical space
    alignItems: 'flex-start',
  }
};

export default BoardPage;