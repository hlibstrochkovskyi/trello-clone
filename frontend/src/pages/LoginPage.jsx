import { useState } from 'react';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

/**
 * LoginPage Component
 * 
 * Authentication page for user login.
 * Provides a form for username and password input with validation.
 * Handles authentication state and redirects to home page upon successful login.
 * 
 * Features:
 * - Form validation (required fields)
 * - Loading state during authentication
 * - Error handling and display
 * - Automatic redirect after successful login
 * 
 * @component
 * @returns {JSX.Element} The login page with authentication form
 */
const LoginPage = () => {
  // Local state for form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Get authentication actions and state from auth store
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  /**
   * Handles form submission and authentication
   * Attempts to log in the user and redirects to home on success
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await login({ username, password });
      alert("Login successful!");
      navigate('/'); // Redirect to home page after successful login
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Page title */}
        <h2 style={styles.title}>Login to Trello Clone</h2>
        
        {/* Error message display */}
        {error && (
          <div style={styles.error}>
            {typeof error === 'string' ? error : 'Login failed'}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Username input */}
          <input
            type="text"
            placeholder="Username (e.g., gleb_test)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
            aria-label="Username"
          />
          
          {/* Password input */}
          <input
            type="password"
            placeholder="Password (e.g., password123)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
            aria-label="Password"
          />
          
          {/* Submit button with loading state */}
          <button 
            type="submit" 
            disabled={isLoading} 
            style={styles.button}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

/**
 * Component styles
 * Simple inline styles for authentication UI
 */
const styles = {
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh', 
    backgroundColor: '#f0f2f5' 
  },
  card: { 
    background: 'white', 
    padding: '2rem', 
    borderRadius: '8px', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
    width: '300px' 
  },
  title: { 
    textAlign: 'center', 
    color: '#333', 
    marginBottom: '1.5rem' 
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '1rem' 
  },
  input: { 
    padding: '0.75rem', 
    border: '1px solid #ddd', 
    borderRadius: '4px', 
    fontSize: '1rem' 
  },
  button: { 
    padding: '0.75rem', 
    backgroundColor: '#0079bf', // Trello blue
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer', 
    fontSize: '1rem', 
    fontWeight: 'bold' 
  },
  error: { 
    color: 'red', 
    textAlign: 'center', 
    marginBottom: '1rem', 
    fontSize: '0.9rem' 
  }
};

export default LoginPage;