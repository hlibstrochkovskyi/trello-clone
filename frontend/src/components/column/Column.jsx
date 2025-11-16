import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from '../task/TaskCard';
import CreateTaskForm from '../task/CreateTaskForm';
import useBoardStore from '../../store/boardStore'; // 1. Импорт Store

const Column = ({ column, dragHandleProps }) => {
  const [isAdding, setIsAdding] = useState(false);
  const { deleteColumn } = useBoardStore(); // 2. Получаем функцию удаления

  // 3. Обработчик клика
  const handleDelete = (e) => {
    e.stopPropagation(); // Остановка DND
    if (window.confirm(`Удалить колонку "${column.title}"? Все задачи в ней будут удалены.`)) {
        deleteColumn(column.id);
    }
  };

  return (
    <div style={styles.column}>
      {/* 4. Оборачиваем заголовок и кнопку в flex-контейнер */}
      <div style={styles.headerContainer}>
        <h3 
          style={styles.header}
          {...dragHandleProps} 
        >
          {column.title}
        </h3>
        {/* 5. Кнопка удаления колонки */}
        <button onClick={handleDelete} style={styles.deleteBtn}>×</button>
      </div>
      
      <Droppable droppableId={column.id.toString()} type="task">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              ...styles.taskList,
              backgroundColor: snapshot.isDraggingOver ? '#dfe1e6' : 'transparent',
              minHeight: '50px' 
            }}
          >
            {column.tasks.map((task, index) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                index={index} 
                columnId={column.id}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Task creation block */}
      {isAdding ? (
        <CreateTaskForm columnId={column.id} setAdding={setIsAdding} />
      ) : (
        <button onClick={() => setIsAdding(true)} style={styles.addBtn}>
          + Добавить карточку
        </button>
      )}
    </div>
  );
};

// 6. Обновляем стили
const styles = {
  column: {
    width: '280px',
    minWidth: '280px',
    maxWidth: '280px',
    backgroundColor: '#ebecf0',
    borderRadius: '6px',
    padding: '10px',
    marginRight: '12px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
    flexShrink: 0,
  },
  // Новый контейнер для заголовка
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  header: {
    padding: '0 4px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#172b4d',
    cursor: 'grab',
    flexGrow: 1, // Заголовок занимает все место
    wordBreak: 'break-word',
  },
  // Новая кнопка удаления
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    color: '#6b778c',
    padding: '0 5px',
    lineHeight: '1',
    flexShrink: 0, // Не сжиматься
  },
  taskList: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflowY: 'auto',
    minHeight: '100px',
    paddingBottom: '8px'
  },
  addBtn: {
    padding: '8px',
    marginTop: '8px',
    textAlign: 'left',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '3px',
    color: '#5e6c84',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    ':hover': { backgroundColor: 'rgba(9,30,66,.08)' } 
  }
};

export default Column;