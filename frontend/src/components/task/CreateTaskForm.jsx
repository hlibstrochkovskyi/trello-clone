import { useState } from 'react';
import useBoardStore from '../../store/boardStore';

/**
 * CreateTaskForm Component
 * 
 * A form component for creating new tasks within a column.
 * Provides a textarea input for task title and submit/cancel controls.
 * Supports keyboard shortcuts (Enter to submit, Shift+Enter for new line).
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.columnId - The ID of the column where the task will be created
 * @param {Function} props.setAdding - Callback to toggle the form visibility
 * @returns {JSX.Element} The task creation form
 */
const CreateTaskForm = ({ columnId, setAdding }) => {
  // Local state for task title input
  const [title, setTitle] = useState('');
  
  // Get the createTask action from the board store
  const { createTask } = useBoardStore(); 

  /**
   * Handles form submission
   * Creates a new task with the entered title and closes the form
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent creating empty tasks
    if (!title.trim()) return;
    
    // Create task with title and empty description
    await createTask(columnId, { title, description: '' });
    
    // Reset form and close
    setTitle('');
    setAdding(false);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* Task title textarea */}
      <textarea
        autoFocus
        placeholder="Enter a title for this card"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={styles.input}
        onKeyDown={(e) => {
          // Submit on Enter, allow Shift+Enter for new line
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        aria-label="Task title"
      />
      
      {/* Form controls */}
      <div style={styles.controls}>
        {/* Submit button */}
        <button type="submit" style={styles.addBtn}>
          Add Card
        </button>
        
        {/* Cancel button */}
        <button 
          type="button" 
          onClick={() => setAdding(false)} 
          style={styles.closeBtn}
          aria-label="Cancel"
        >
          ✕
        </button>
      </div>
    </form>
  );
};

/**
 * Component styles
 * Inline styles following Trello's visual design
 */
const styles = {
  form: { 
    padding: '0 4px', 
    marginBottom: '8px' 
  },
  input: { 
    width: '100%', 
    padding: '8px', 
    borderRadius: '3px', 
    border: 'none', 
    boxShadow: '0 1px 0 rgba(9,30,66,.25)', 
    minHeight: '60px', 
    resize: 'vertical',
    fontFamily: 'inherit', 
    boxSizing: 'border-box'
  },
  controls: { 
    display: 'flex', 
    alignItems: 'center', 
    marginTop: '8px', 
    gap: '8px' 
  },
  addBtn: { 
    backgroundColor: '#0079bf', // Trello blue
    color: 'white', 
    padding: '6px 12px', 
    borderRadius: '3px', 
    border: 'none', 
    cursor: 'pointer' 
  },
  closeBtn: { 
    background: 'none', 
    border: 'none', 
    fontSize: '20px', 
    cursor: 'pointer', 
    color: '#6b778c' 
  }
};

export default CreateTaskForm;