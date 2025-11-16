import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from '../task/TaskCard';
import CreateTaskForm from '../task/CreateTaskForm';

// ACCEPT: dragHandleProps for DND column movement
const Column = ({ column, dragHandleProps }) => {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div style={styles.column}>
      {/* APPLY dragHandleProps to the header to make it the drag handle */}
      <h3 
        style={styles.header}
        {...dragHandleProps} 
      >
        {column.title}
      </h3>
      
      {/* Droppable area for tasks (type="task") */}
      <Droppable droppableId={column.id.toString()} type="task">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              ...styles.taskList,
              backgroundColor: snapshot.isDraggingOver ? '#dfe1e6' : 'transparent',
              minHeight: '50px' // to ensure droppable area is visible
            }}
          >
            {column.tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
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

const styles = {
  column: {
    width: '280px', // Фиксированная ширина
    minWidth: '280px', // Запрещаем сжиматься меньше этого
    maxWidth: '280px', // Запрещаем растягиваться
    backgroundColor: '#ebecf0',
    borderRadius: '6px',
    padding: '10px',
    marginRight: '12px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%', // Важно для скролла внутри колонки
    flexShrink: 0, // !!! САМОЕ ВАЖНОЕ: Запрещаем колонке сжиматься !!!
  },
  header: {
    marginBottom: '12px',
    padding: '0 4px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#172b4d',
    cursor: 'grab',
  },
  taskList: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px', // Отступ между карточками
    overflowY: 'auto', // Скролл только если задач много
    minHeight: '100px', // Увеличим зону для броска в пустую колонку
    paddingBottom: '8px' // Чтобы скролл не обрезал тень последней карточки
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