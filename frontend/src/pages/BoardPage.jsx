import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import useBoardStore from '../store/boardStore';
import Column from '../components/column/Column';
// IMPORT: Importing the new component for adding columns
import CreateColumnSection from '../components/column/CreateColumnSection'; 

const BoardPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { currentBoard, isLoading, fetchBoardDetails, moveTask } = useBoardStore();

  useEffect(() => {
    if (boardId) fetchBoardDetails(boardId);
  }, [boardId]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // if no destination, do nothing
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId && 
      destination.index === source.index
    ) {
      return;
    }

    // call the moveTask action from the store (Optimistic Update)
    moveTask(
      draggableId,
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );

    // console.log("Moved locally! Backend sync handled inside store.");
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
        
        <div style={styles.boardLayout}>
          {currentBoard.columns.map((column) => (
            <Column key={column.id} column={column} />
          ))}
          
          {/* NEW: Component for adding a new column */}
          <CreateColumnSection boardId={currentBoard.id} />
        </div>
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