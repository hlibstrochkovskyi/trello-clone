import { Droppable } from '@hello-pangea/dnd';
import TaskCard from '../task/TaskCard';

const Column = ({ column }) => {
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
  }
};

export default Column;