import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react'; // Убедись, что React импортирован
import LoginPage from './pages/LoginPage';
import BoardPage from './pages/BoardPage';
import useAuthStore from './store/authStore';
import useBoardStore from './store/boardStore'; 

// --- КОМПОНЕНТ DASHBOARD ---
const Dashboard = () => {
  const { fetchBoards, boards, isLoading, createBoard, deleteBoard } = useBoardStore(); 
  const { logout } = useAuthStore();
  const navigate = useNavigate(); 
  
  const [newBoardName, setNewBoardName] = useState('');

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
        createBoard(newBoardName.trim());
        setNewBoardName(''); 
    }
  };

  const handleDeleteBoard = (e, boardId) => {
    e.stopPropagation(); 
    if (window.confirm("Вы уверены, что хотите удалить эту доску?")) {
        deleteBoard(boardId);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={styles.dashboardContainer}> 
      
      <div style={styles.headerWrapper}>
        <div style={styles.header}>
          <h1 style={styles.dashTitle}>Ваши доски</h1>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Выйти
          </button>
        </div>

        <div style={styles.createForm}>
          <input
            type="text"
            placeholder="Название новой доски"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            style={styles.input}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
          />
          <button onClick={handleCreateBoard} style={styles.createButton}>
            Создать
          </button>
        </div>
      </div>
      
      {isLoading && <p>Загрузка...</p>}
      
      <div style={styles.boardList}>
        {boards.map(b => (
          <div 
            key={b.id} 
            onClick={() => navigate(`/board/${b.id}`)}
            style={styles.boardCard}
          >
            {b.name}
            <button 
                onClick={(e) => handleDeleteBoard(e, b.id)} 
                style={styles.deleteBoardBtn}
            >
                ×
            </button>
          </div>
        ))}
      </div>
      
      {boards.length === 0 && !isLoading && 
        <p style={{textAlign: 'center'}}>Досок пока нет. Создайте первую!</p>
      }
    </div>
  );
};
// --- КОНЕЦ КОМПОНЕНТА DASHBOARD ---


function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/board/:boardId" element={user ? <BoardPage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

// --- ОБНОВЛЕННЫЙ ОБЪЕКТ СТИЛЕЙ ---
const styles = {
    dashboardContainer: {
        minHeight: '100vh',
        boxSizing: 'border-box',
        backgroundColor: '#242424', // Фон как в Trello
    },
    headerWrapper: {
        padding: '20px',
        backgroundColor: 'rgba(0,0,0,0.15)', // Полупрозрачный фон для хедера
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    dashTitle: {
        margin: 0,
        color: 'white',
    },
    logoutButton: {
        backgroundColor: '#b03238ff',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    createForm: {
        display: 'flex',
        gap: '10px',
    },
    input: {
        padding: '10px',
        borderRadius: '4px',
        border: 'none',
        flexGrow: 1,
        color: 'white',
    },
    createButton: {
        backgroundColor: '#5aac44',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    boardList: {
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        padding: '20px', // Padding только для досок
        justifyContent: 'center', // Центрирование досок
    },
    boardCard: {
        width: '200px',
        height: '100px',
        backgroundColor: '#0079bf',
        borderRadius: '8px',
        padding: '10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        fontWeight: 'bold',
        position: 'relative',
        boxSizing: 'border-box',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        color: 'white',
    },
    deleteBoardBtn: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: 'rgba(0,0,0,0)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        cursor: 'pointer',
        padding: '0', 
        fontSize: '18px',
        lineHeight: '24px', 
        textAlign: 'center', 
    }
};

export default App;