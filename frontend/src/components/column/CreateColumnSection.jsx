import { useState } from 'react';
import useBoardStore from '../../store/boardStore';

const CreateColumnSection = ({ boardId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const { createColumn } = useBoardStore();

  const handleSubmit = async () => {
    if (!title.trim()) return;

    await createColumn(boardId, { title });
    setTitle('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <button onClick={() => setIsAdding(true)} style={styles.addButton}>
        + Добавить другую колонку
      </button>
    );
  }

  return (
    <div style={styles.formContainer}>
      <input
        autoFocus
        placeholder="Введите название колонки"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={styles.input}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <div style={styles.controls}>
        <button onClick={handleSubmit} style={styles.saveButton}>Добавить список</button>
        <button onClick={() => setIsAdding(false)} style={styles.closeButton}>✕</button>
      </div>
    </div>
  );
};

const styles = {
    addButton: {
        minWidth: '280px',
        height: '40px',
        backgroundColor: 'rgba(255,255,255,0.2)',
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
        marginBottom: '8px'
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