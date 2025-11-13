import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import useAuthStore from './store/authStore';

function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <Router>
      <Routes>
        {/* Если юзер есть -> показываем Дашборд (пока просто текст), иначе -> Логин */}
        <Route path="/" element={user ? <h1>Привет, {user.username}! Это твоя доска.</h1> : <Navigate to="/login" />} />
        
        {/* Страница входа */}
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;