import { useState, useEffect } from 'react';
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
   * Set body background to white on mount, restore on unmount
   */
  useEffect(() => {
    // Save original background
    const originalBg = document.body.style.backgroundColor;
    
    // Set white background for login page
    document.body.style.backgroundColor = 'white';
    
    // Restore on unmount
    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

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
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div style={styles.pageContainer}>
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
 * Full-page white background with centered card
 */
const styles = {
  pageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: { 
    background: 'white', 
    padding: '2.5rem', 
    borderRadius: '8px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
    width: '100%',
    maxWidth: '400px',
    margin: '20px',
  },
  title: { 
    textAlign: 'center', 
    color: '#172b4d', 
    marginBottom: '1.5rem',
    fontSize: '24px',
    fontWeight: '600',
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '1rem' 
  },
  input: { 
    padding: '0.75rem', 
    border: '2px solid #dfe1e6', 
    borderRadius: '4px', 
    fontSize: '1rem',
    color: '#172b4d',
    backgroundColor: '#fafbfc',
    outline: 'none',
  },
  button: { 
    padding: '0.75rem', 
    backgroundColor: '#0079bf',
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer', 
    fontSize: '1rem', 
    fontWeight: 'bold',
  },
  error: { 
    color: '#eb5a46', 
    textAlign: 'center', 
    marginBottom: '1rem', 
    fontSize: '0.9rem',
    padding: '0.5rem',
    backgroundColor: '#ffebe6',
    borderRadius: '4px',
  }
};

export default LoginPage;