// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import BoardPage from './pages/BoardPage';
import useAuthStore from './store/authStore';
import { useEffect } from 'react';

// Simple dashboard component to list boards
const Dashboard = () => {
  const { fetchBoards, boards, isLoading } = useBoardStore(); 
  const navigate = useNavigate(); 

  useEffect(() => {
    fetchBoards();
  }, []);

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h1>Ваши доски</h1>
      {isLoading && <p>Загрузка...</p>}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {boards.map(b => (
          <div 
            key={b.id} 
            onClick={() => navigate(`/board/${b.id}`)}
            style={{ 
              width: '200px', height: '100px', backgroundColor: '#0079bf', 
              borderRadius: '8px', padding: '10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
            }}
          >
            {b.name}
          </div>
        ))}
      </div>
      {/* Button */}
      {boards.length === 0 && !isLoading && <p>Досок пока нет. Создайте их через Postman или добавьте кнопку создания :)</p>}
    </div>
  );
};

import useBoardStore from './store/boardStore'; 
import { useNavigate } from 'react-router-dom';

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

export default App;