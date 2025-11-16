import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from '../task/TaskCard';
import CreateTaskForm from '../task/CreateTaskForm';
import useBoardStore from '../../store/boardStore';

/**
 * Represents a column in the board.
 *
 * @component
 * @param {Object} props - The props object.
 * @param {Object} props.column - The column data.
 * @param {string} props.column.id - The unique ID of the column.
 * @param {string} props.column.title - The title of the column.
 * @param {Array} props.column.tasks - The list of tasks in the column.
 * @param {Object} [props.dragHandleProps] - Optional drag handle properties for drag-and-drop functionality.
 * @returns {JSX.Element} A column component.
 */
const Column = ({ column, dragHandleProps }) => {
  const [isAdding, setIsAdding] = useState(false);
  const { deleteColumn } = useBoardStore();

  /**
   * Handles the deletion of the column.
   *
   * @param {Event} e - The click event.
   */
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete column "${column.title}"? All tasks in it will be removed.`)) {
      deleteColumn(column.id);
    }
  };

  return (
    <div style={styles.column}>
      <div style={styles.headerContainer}>
        <h3
          style={styles.header}
          {...dragHandleProps}
        >
          {column.title}
        </h3>
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

      {isAdding ? (
        <CreateTaskForm columnId={column.id} setAdding={setIsAdding} />
      ) : (
        <button onClick={() => setIsAdding(true)} style={styles.addBtn}>
          + Add a card
        </button>
      )}
    </div>
  );
};

// Styles for the Column component
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
    flexGrow: 1,
    wordBreak: 'break-word',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px',
    color: '#6b778c',
    padding: '0 5px',
    lineHeight: '1',
    flexShrink: 0,
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
  }
};

export default Column;