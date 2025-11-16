import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import BoardPage from './pages/BoardPage';
import useAuthStore from './store/authStore';
import useBoardStore from './store/boardStore'; 

/**
 * Dashboard Component
 * 
 * Main dashboard view displaying all user boards with create and delete functionality.
 * Serves as the home page after user authentication.
 * 
 * Features:
 * - Displays grid of user boards
 * - Board creation with inline form
 * - Board deletion with confirmation
 * - Logout functionality
 * - Navigation to individual board pages
 * 
 * @component
 * @returns {JSX.Element} The dashboard with board management interface
 */
const Dashboard = () => {
  // Get board state and actions from store
  const { fetchBoards, boards, isLoading, createBoard, deleteBoard } = useBoardStore(); 
  const { logout } = useAuthStore();
  const navigate = useNavigate(); 
  
  // Local state for new board name input
  const [newBoardName, setNewBoardName] = useState('');

  /**
   * Fetch all boards when component mounts
   */
  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  /**
   * Handles board creation
   * Creates a new board with the entered name and clears the input
   */
  const handleCreateBoard = () => {
    if (newBoardName.trim()) {
      createBoard(newBoardName.trim());
      setNewBoardName(''); 
    }
  };

  /**
   * Handles board deletion with confirmation
   * Stops event propagation to prevent navigating to the board
   * 
   * @param {React.MouseEvent} e - Click event from delete button
   * @param {number} boardId - ID of the board to delete
   */
  const handleDeleteBoard = (e, boardId) => {
    e.stopPropagation(); // Prevent triggering board navigation
    
    if (window.confirm("Are you sure you want to delete this board?")) {
      deleteBoard(boardId);
    }
  };

  /**
   * Handles user logout
   * Clears authentication and redirects to login
   */
  const handleLogout = () => {
    logout();
  };

  return (
    <div style={styles.dashboardContainer}> 
      
      {/* Header section with title and logout button */}
      <div style={styles.headerWrapper}>
        <div style={styles.header}>
          <h1 style={styles.dashTitle}>Your Boards</h1>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>

        {/* Board creation form */}
        <div style={styles.createForm}>
          <input
            type="text"
            placeholder="New board name"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            style={styles.input}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
            aria-label="New board name"
          />
          <button onClick={handleCreateBoard} style={styles.createButton}>
            Create
          </button>
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && <p style={{color: 'white', textAlign: 'center'}}>Loading...</p>}
      
      {/* Board grid */}
      <div style={styles.boardList}>
        {boards.map(b => (
          <div 
            key={b.id} 
            onClick={() => navigate(`/board/${b.id}`)}
            style={styles.boardCard}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(`/board/${b.id}`);
              }
            }}
            aria-label={`Open board: ${b.name}`}
          >
            {b.name}
            {/* Delete button */}
            <button 
              onClick={(e) => handleDeleteBoard(e, b.id)} 
              style={styles.deleteBoardBtn}
              aria-label="Delete board"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      {/* Empty state message */}
      {boards.length === 0 && !isLoading && 
        <p style={{textAlign: 'center', color: 'white'}}>
          No boards yet. Create your first one!
        </p>
      }
    </div>
  );
};

/**
 * App Component
 * 
 * Root application component handling routing and authentication.
 * Implements protected routes that redirect to login if user is not authenticated.
 * 
 * Routes:
 * - "/" - Dashboard (protected)
 * - "/board/:boardId" - Individual board view (protected)
 * - "/login" - Login page (redirects to dashboard if already authenticated)
 * 
 * @component
 * @returns {JSX.Element} The application with routing configuration
 */
function App() {
  // Get current user from auth store
  const user = useAuthStore((state) => state.user);

  return (
    <Router>
      <Routes>
        {/* Dashboard route - protected */}
        <Route 
          path="/" 
          element={user ? <Dashboard /> : <Navigate to="/login" />} 
        />
        
        {/* Board detail route - protected */}
        <Route 
          path="/board/:boardId" 
          element={user ? <BoardPage /> : <Navigate to="/login" />} 
        />
        
        {/* Login route - redirects if already authenticated */}
        <Route 
          path="/login" 
          element={!user ? <LoginPage /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}

/**
 * Component styles
 * Trello-inspired design with dark background and colorful board cards
 */
const styles = {
  dashboardContainer: {
    minHeight: '100vh',
    boxSizing: 'border-box',
    backgroundColor: '#242424', // Trello-style dark background
  },
  headerWrapper: {
    padding: '20px',
    backgroundColor: 'rgba(0,0,0,0.15)', // Semi-transparent header background
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
    backgroundColor: '#b03238ff', // Red for logout
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
    backgroundColor: '#5aac44', // Green for create action
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
    padding: '20px',
    justifyContent: 'center', // Center board cards
  },
  boardCard: {
    width: '200px',
    height: '100px',
    backgroundColor: '#0079bf', // Trello blue
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