import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import useBoardStore from '../store/boardStore';
import Column from '../components/column/Column';
import CreateColumnSection from '../components/column/CreateColumnSection'; 

const BoardPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  // IMPORTANT: Ensure moveColumn is included
  const { currentBoard, isLoading, fetchBoardDetails, moveTask, moveColumn } = useBoardStore();

  useEffect(() => {
    if (boardId) fetchBoardDetails(boardId);
  }, [boardId]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId && 
      destination.index === source.index
    ) {
      return;
    }
    
    // --- 1. COLUMN MOVEMENT LOGIC ---
    if (type === 'column') {
      const columnId = Number(draggableId);
      // Call store function to optimistically update and send API call
      moveColumn(columnId, source.index, destination.index);
      return;
    }
    
    // --- 2. TASK MOVEMENT LOGIC ---
    if (type === 'task') {
        moveTask(
          draggableId,
          source.droppableId,
          destination.droppableId,
          source.index,
          destination.index
        );
        return;
    }
  };

  if (isLoading) return <div style={{color: 'white'}}>Загрузка...</div>;
  if (!currentBoard) return <div style={{color: 'white'}}>Доска не найдена</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={styles.container}>
        <div style={styles.topBar}>
           <button onClick={() => navigate('/')} style={styles.backBtn}>← Назад</button>
           <h2 style={styles.boardTitle}>{currentBoard.name || `Доска #${currentBoard.id}`}</h2>
        </div>
        
        {/* Droppable area for the entire list of columns (type="column") */}
        <Droppable droppableId="all-columns" direction="horizontal" type="column"> 
            {(provided) => (
                <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={styles.boardLayout}
                >
                    {currentBoard.columns.map((column, index) => (
                        // Each column is draggable
                        <Draggable key={column.id} draggableId={column.id.toString()} index={index}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    // The column component now receives dragHandleProps for its header
                                >
                                    <Column 
                                        column={column} 
                                        dragHandleProps={provided.dragHandleProps}
                                    />
                                </div>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {/* Column creation button */}
                    <CreateColumnSection boardId={currentBoard.id} />
                </div>
            )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0079bf',
  },
  topBar: {
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    color: 'white'
  },
  backBtn: {
    marginRight: '20px',
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
  },
  boardLayout: {
    display: 'flex',
    padding: '20px',
    overflowX: 'auto',
    height: '100%',
    alignItems: 'flex-start'
  }
};

export default BoardPage;