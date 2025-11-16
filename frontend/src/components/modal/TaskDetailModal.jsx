import { useState, useEffect } from 'react'; // 1. Импортируем useState и useEffect
import useUiStore from '../../store/uiStore';
import useBoardStore from '../../store/boardStore';

const TaskDetailModal = () => {
  // 1. Получаем состояние из UI store
  const { isTaskModalOpen, selectedTaskId, closeTaskModal } = useUiStore();
  
  // 2. Получаем данные и функцию обновления из board store
  const { currentBoard, updateTaskDetails } = useBoardStore();
  
  // 3. Локальное состояние для полей ввода
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // 4. Находим нужную задачу по ID
  const task = (currentBoard && selectedTaskId)
    ? currentBoard.columns
        .flatMap(c => c.tasks) // Собираем все задачи со всех колонок в один массив
        .find(t => t.id === selectedTaskId) // Находим нужную
    : null;

  // 5. Синхронизируем локальное состояние с задачей (когда модалка открывается)
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || ''); // Ставим пустую строку, если description=null
    }
  }, [task]); // Этот эффект сработает, как только 'task' будет найден

  // 6. Функция сохранения
  const handleSave = () => {
    if (!task) return;
    
    // Вызываем экшн из store
    updateTaskDetails(task.id, {
      title: title,
      description: description
    });
    
    closeTaskModal(); // Закрываем окно после сохранения
  };

  // 7. Функция закрытия (без сохранения)
  const handleClose = () => {
    // (Здесь можно добавить проверку "Вы уверены?")
    closeTaskModal();
  };

  if (!isTaskModalOpen || !task) {
    return null;
  }

  return (
    // Оверлей
    <div style={styles.overlay} onClick={handleClose}>
      {/* Контент модалки */}
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        <button style={styles.closeButton} onClick={handleClose}>×</button>
        
        {/* Поле для Заголовка */}
        <input
          style={styles.titleInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <p style={styles.label}>Описание:</p>
        
        {/* Поле для Описания */}
        <textarea
          style={styles.descriptionTextarea}
          placeholder="Добавьте более подробное описание..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        
        {/* Кнопка Сохранить */}
        <button style={styles.saveButton} onClick={handleSave}>
          Сохранить
        </button>
        
      </div>
    </div>
  );
};

// Стили для модального окна
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
  // Стиль для инпута заголовка
  titleInput: {
    fontSize: '24px',
    fontWeight: '600',
    color : '#172b4d',
    border: 'none',
    padding: '4px',
    borderRadius: '3px',
    width: '90%', // Оставляем место для кнопки "X"
    marginBottom: '20px',
    backgroundColor: 'transparent',
    ':focus': { // Псевдо-селекторы в inline-стилях не работают, но для React это OK
        backgroundColor: 'white',
        boxShadow: '0 0 0 2px #0079bf',
        outline: 'none'
    }
  },
  label: {
    fontWeight: '600',
    fontSize: '12px',
    marginBottom: '4px',
  },
  // Стиль для textarea описания
  descriptionTextarea: {
    backgroundColor: 'white',
    padding: '8px 12px',
    minHeight: '100px',
    borderRadius: '3px',
    border: 'none',
    width: '100%',
    boxSizing: 'border-box', // Важно, чтобы padding не ломал ширину
    fontFamily: 'inherit',
    fontSize: '14px',
    color: '#333',
    resize: 'vertical',
  },
  // Стиль для кнопки Сохранить
  saveButton: {
    backgroundColor: '#86ce35ff', // Зеленый
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