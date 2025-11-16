import { useState } from 'react';
import useBoardStore from '../../store/boardStore';

/**
 * A section for creating a new column in the board.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {string} props.boardId - The ID of the board where the column will be created.
 * @returns {JSX.Element} A component for creating a new column.
 */
const CreateColumnSection = ({ boardId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const { createColumn } = useBoardStore();

  /**
   * Handles the submission of the new column.
   * Resets the form and closes the input field after successful creation.
   */
  const handleSubmit = async () => {
    if (!title.trim()) return;

    await createColumn(boardId, { title });
    setTitle('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button onClick={() => setIsAdding(true)} style={styles.addButton}>
        + Add another column
      </button>
    );
  }

  return (
    <div style={styles.formContainer}>
      <input
        autoFocus
        placeholder="Enter column title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={styles.input}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <div style={styles.controls}>
        <button onClick={handleSubmit} style={styles.saveButton}>Add list</button>
        <button onClick={() => setIsAdding(false)} style={styles.closeButton}>✕</button>
      </div>
    </div>
  );
};

// Styles for the CreateColumnSection component
const styles = {
  addButton: {
    minWidth: '280px',
    height: '40px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    textAlign: 'left',
    paddingLeft: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginRight: '12px'
  },
  formContainer: {
    minWidth: '280px',
    backgroundColor: '#ebecf0',
    borderRadius: '6px',
    padding: '8px',
    marginRight: '12px',
    height: 'fit-content'
  },
  input: {
    width: '100%',
    padding: '8px',
    border: 'none',
    borderRadius: '3px',
    marginBottom: '8px',
    backgroundColor: 'white',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  saveButton: {
    backgroundColor: '#5aac44',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '3px',
    border: 'none',
    cursor: 'pointer'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#6b778c',
  }
};

export default CreateColumnSection;