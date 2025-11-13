import { Draggable } from '@hello-pangea/dnd';

const TaskCard = ({ task, index }) => {
  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...styles.card,
            ...provided.draggableProps.style, // save default styles
            backgroundColor: snapshot.isDragging ? '#e6fcff' : 'white', // highlight on drag
          }}
        >
          <div style={styles.title}>{task.title}</div>
          {/* Можно добавить описание, метки и т.д. */}
        </div>
      )}
    </Draggable>
  );
};

const styles = {
  card: {
    padding: '10px',
    marginBottom: '8px',
    borderRadius: '4px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    cursor: 'grab',
    border: '1px solid #ddd',
    color: '#333'
  },
  title: {
    fontWeight: '500',
  }
};

export default TaskCard;