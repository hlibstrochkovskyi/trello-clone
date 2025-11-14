
import { useState } from 'react';
import useBoardStore from '../../store/boardStore';

const CreateTaskForm = ({ columnId, setAdding }) => {
  const [title, setTitle] = useState('');
  const { createTask } = useBoardStore(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    await createTask(columnId, { title, description: '' });
    setTitle('');
    setAdding(false); // Close the form after adding
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <textarea
        autoFocus
        placeholder="Ввести заголовок для этой карточки"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={styles.input}
        onKeyDown={(e) => {
            if(e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
            }
        }}
      />
      <div style={styles.controls}>
        <button type="submit" style={styles.addBtn}>Добавить карточку</button>
        <button type="button" onClick={() => setAdding(false)} style={styles.closeBtn}>✕</button>
      </div>
    </form>
  );
};

const styles = {
  form: { padding: '0 4px', marginBottom: '8px' },
  input: { 
    width: '100%', padding: '8px', borderRadius: '3px', border: 'none', 
    boxShadow: '0 1px 0 rgba(9,30,66,.25)', minHeight: '60px', resize: 'vertical',
    fontFamily: 'inherit', boxSizing: 'border-box'
  },
  controls: { display: 'flex', alignItems: 'center', marginTop: '8px', gap: '8px' },
  addBtn: { backgroundColor: '#0079bf', color: 'white', padding: '6px 12px', borderRadius: '3px', border: 'none', cursor: 'pointer' },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b778c' }
};

export default CreateTaskForm;