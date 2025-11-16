import { useState, useEffect } from 'react';
import useUiStore from '../../store/uiStore';
import useBoardStore from '../../store/boardStore';

/**
 * TaskDetailModal Component
 * 
 * A modal dialog for viewing and editing task details.
 * Displays task title and description with inline editing capabilities.
 * 
 * @component
 * @returns {JSX.Element|null} The modal component or null if closed/no task selected
 */
const TaskDetailModal = () => {
  // Get UI state and controls from UI store
  const { isTaskModalOpen, selectedTaskId, closeTaskModal } = useUiStore();
  
  // Get board data and update function from board store
  const { currentBoard, updateTaskDetails } = useBoardStore();
  
  // Local state for form inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Find the selected task by ID across all columns
  const task = (currentBoard && selectedTaskId)
    ? currentBoard.columns
        .flatMap(c => c.tasks) // Flatten all tasks from all columns into a single array
        .find(t => t.id === selectedTaskId) // Find the matching task
    : null;

  // Synchronize local state with task data when modal opens or task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || ''); // Use empty string if description is null/undefined
    }
  }, [task]);

  /**
   * Handles saving changes to the task
   * Updates the task details in the store and closes the modal
   */
  const handleSave = () => {
    if (!task) return;
    
    // Update task details via store action
    updateTaskDetails(task.id, {
      title: title,
      description: description
    });
    
    closeTaskModal();
  };

  /**
   * Handles closing the modal without saving
   * TODO: Consider adding unsaved changes confirmation
   */
  const handleClose = () => {
    closeTaskModal();
  };

  // Don't render if modal is closed or no task is selected
  if (!isTaskModalOpen || !task) {
    return null;
  }

  return (
    // Overlay backdrop
    <div style={styles.overlay} onClick={handleClose}>
      {/* Modal content container */}
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Close button */}
        <button style={styles.closeButton} onClick={handleClose}>×</button>
        
        {/* Task title input */}
        <input
          style={styles.titleInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Task title"
        />
        
        {/* Description label */}
        <p style={styles.label}>Description:</p>
        
        {/* Task description textarea */}
        <textarea
          style={styles.descriptionTextarea}
          placeholder="Add a more detailed description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-label="Task description"
        />
        
        {/* Save button */}
        <button style={styles.saveButton} onClick={handleSave}>
          Save
        </button>
        
      </div>
    </div>
  );
};

/**
 * Component styles
 * Using inline styles for modal overlay and content
 */
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#f4f5f7',
    borderRadius: '3px',
    padding: '20px',
    width: '600px',
    maxWidth: '90%',
    position: 'relative',
    color: '#172b4d',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#6b778c',
  },
  // Title input styling
  titleInput: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#172b4d',
    border: 'none',
    padding: '4px',
    borderRadius: '3px',
    width: '90%', // Leave space for close button
    marginBottom: '20px',
    backgroundColor: 'transparent',
    // Note: Pseudo-selectors like :focus don't work with inline styles
    // Consider using CSS modules or styled-components for interactive states
  },
  label: {
    fontWeight: '600',
    fontSize: '12px',
    marginBottom: '4px',
  },
  // Description textarea styling
  descriptionTextarea: {
    backgroundColor: 'white',
    padding: '8px 12px',
    minHeight: '100px',
    borderRadius: '3px',
    border: 'none',
    width: '100%',
    boxSizing: 'border-box', // Ensure padding doesn't affect width
    fontFamily: 'inherit',
    fontSize: '14px',
    color: '#333',
    resize: 'vertical',
  },
  // Save button styling
  saveButton: {
    backgroundColor: '#86ce35ff', // Green
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '3px',
    cursor: 'pointer',
    marginTop: '20px',
    fontWeight: 'bold',
  }
};

export default TaskDetailModal;