import { Draggable } from '@hello-pangea/dnd';
import useBoardStore from '../../store/boardStore';
import useUiStore from '../../store/uiStore';

/**
 * TaskCard Component
 * 
 * A draggable card component representing a single task within a column.
 * Supports drag-and-drop functionality, click-to-open modal, and task deletion.
 * Uses React Beautiful DnD (hello-pangea/dnd) for drag-and-drop capabilities.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.task - The task object containing id, title, and description
 * @param {number} props.index - The index position of the task within the column
 * @param {string} props.columnId - The ID of the parent column containing this task
 * @returns {JSX.Element} A draggable task card element
 */
const TaskCard = ({ task, index, columnId }) => {
  // Get task deletion function from board store
  const { deleteTask } = useBoardStore();
  
  // Get modal opening function from UI store
  const { openTaskModal } = useUiStore();

  /**
   * Handles task deletion with confirmation
   * Stops event propagation to prevent opening the task modal
   * 
   * @param {React.MouseEvent} e - Click event from delete button
   */
  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent triggering the card's onClick (modal open)
    
    if (window.confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      deleteTask(columnId, task.id);
    }
  };

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...styles.card,
            ...provided.draggableProps.style,
            // Visual feedback when dragging
            backgroundColor: snapshot.isDragging ? '#e6fcff' : 'white',
          }}
          // Open task detail modal when card is clicked
          onClick={() => openTaskModal(task.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            // Support keyboard accessibility (Enter/Space to open)
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openTaskModal(task.id);
            }
          }}
          aria-label={`Task: ${task.title}`}
        >
          {/* Delete button - positioned absolutely in top-right corner */}
          <button 
            onClick={handleDelete} 
            style={styles.deleteButton}
            aria-label="Delete task"
          >
            ×
          </button>
          
          {/* Task title */}
          <div style={styles.title}>{task.title}</div>
        </div>
      )}
    </Draggable>
  );
};

/**
 * Component styles
 * Inline styles for task card appearance and interactions
 */
const styles = {
  card: {
    padding: '10px',
    borderRadius: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    cursor: 'pointer', // Indicate the card is clickable
    border: '1px solid #ddd',
    color: '#333',
    backgroundColor: 'white',
    wordWrap: 'break-word',
    whiteSpace: 'normal',
    position: 'relative',
    // Note: :hover pseudo-selector doesn't work with inline styles
    // Consider using CSS modules or styled-components for hover effects
    ':hover': {
      backgroundColor: '#f9f9f9'
    }
  },
  title: {
    fontWeight: '500',
    paddingRight: '20px', // Space for delete button
  },
  deleteButton: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#999',
    padding: '5px',
    lineHeight: '1',
    zIndex: 10, // Ensure button stays above card content
  }
};

export default TaskCard;