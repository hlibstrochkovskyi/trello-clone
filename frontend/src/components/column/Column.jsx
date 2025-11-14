import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from '../task/TaskCard';
import CreateTaskForm from '../task/CreateTaskForm';

const Column = ({ column }) => {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div style={styles.column}>
      <h3 style={styles.header}>{column.title}</h3>
      
      <Droppable droppableId={column.id.toString()}>
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

      {/* Блок создания задачи */}
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
    minWidth: '280px',
    backgroundColor: '#ebecf0',
    borderRadius: '6px',
    padding: '10px',
    marginRight: '12px',
    display: 'flex',
    flexDirection: 'column',
    height: 'fit-content',
    maxHeight: '100%', // to prevent overflow
  },
  header: {
    marginBottom: '12px',
    padding: '0 4px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#172b4d',
  },
  taskList: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '8px',
    overflowY: 'auto', // Scroll if tasks exceed column height
  },
  addBtn: {
    padding: '8px',
    margin: '0 4px',
    textAlign: 'left',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '3px',
    color: '#5e6c84',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
  }
};

export default Column;