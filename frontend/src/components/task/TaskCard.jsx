import { Draggable } from '@hello-pangea/dnd';
import useBoardStore from '../../store/boardStore';
import useUiStore from '../../store/uiStore'; // 1. Импорт UI Store

const TaskCard = ({ task, index, columnId }) => {
  const { deleteTask } = useBoardStore();
  const { openTaskModal } = useUiStore(); // 2. Получаем функцию открытия модалки

  const handleDelete = (e) => {
    e.stopPropagation(); // ВАЖНО: останавливаем клик, чтобы не открылась модалка
    if (window.confirm(`Вы уверены, что хотите удалить задачу "${task.title}"?`)) {
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
            backgroundColor: snapshot.isDragging ? '#e6fcff' : 'white',
          }}
          // 3. Добавляем onClick на всю карточку
          onClick={() => openTaskModal(task.id)} 
        >
          <button onClick={handleDelete} style={styles.deleteButton}>×</button>
          
          <div style={styles.title}>{task.title}</div>
        </div>
      )}
    </Draggable>
  );
};

const styles = {
  card: {
    padding: '10px',
    borderRadius: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    cursor: 'pointer', // 4. Меняем курсор на "pointer"
    border: '1px solid #ddd',
    color: '#333',
    backgroundColor: 'white',
    wordWrap: 'break-word',
    whiteSpace: 'normal',
    position: 'relative',
    // 5. Эффект при наведении
    ':hover': {
        backgroundColor: '#f9f9f9'
    }
  },
  title: {
    fontWeight: '500',
    paddingRight: '20px',
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
    zIndex: 10,
  }
};

export default TaskCard;