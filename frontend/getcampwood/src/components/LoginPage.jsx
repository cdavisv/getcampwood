// LoginPage.jsx
import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import apiService from '../services/api';

const LoginPage = ({ onNavigate, onLogin, isLoggedIn, currentUser, onLogout }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async () => {
    setError('');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.login({
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        // Login successful
        const userData = {
          email: formData.email,
          name: response.user?.name || formData.email // Use name from response or fallback to email
        };
        
        if (onLogin) {
          onLogin(userData);
        }
        
        alert('Login successful! Welcome back!');
        if (onNavigate) {
          onNavigate('home');
        }
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => {
    if (onNavigate) {
      onNavigate('register');
    }
  };

  const styles = {
    pageWrapper: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    },
    container: {
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    mainContent: {
      flex: '1',
      backgroundColor: '#f3efde',
      padding: '48px 16px', // Match homepage padding approach
      display: 'flex',
      justifyContent: 'center'
    },
    formContainer: {
      width: '100%',
      maxWidth: '500px',
      backgroundColor: 'white',
      padding: '48px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '32px',
      color: '#1f2937',
      textDecoration: 'underline'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'inline-block',
      width: '140px',
      fontSize: '16px',
      fontWeight: '500',
      color: '#1f2937',
      textAlign: 'right',
      marginRight: '16px',
      verticalAlign: 'top'
    },
    input: {
      width: '200px',
      padding: '8px 12px',
      border: '2px solid #1f2937',
      borderRadius: '4px',
      fontSize: '16px',
      fontFamily: 'inherit',
      backgroundColor: 'white',
      color: 'black'
    },
    buttonGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignItems: 'center',
      marginTop: '32px'
    },
    loginButton: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '12px 32px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      opacity: isLoading ? 0.7 : 1
    },
    registerLink: {
      color: '#2563eb',
      textDecoration: 'underline',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'color 0.2s'
    },
    errorMessage: {
      color: '#dc2626',
      fontSize: '14px',
      textAlign: 'center',
      marginBottom: '16px',
      padding: '8px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '4px'
    },
    divider: {
      margin: '16px 0',
      fontSize: '14px',
      color: '#6b7280'
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <Header onNavigate={onNavigate} isLoggedIn={isLoggedIn} currentUser={currentUser} onLogout={onLogout} />
      
      <div style={styles.container}>
        <main style={styles.mainContent}>
          <div style={styles.formContainer}>
            <h1 style={styles.title}>Login to Your Account</h1>
            
            <div>
              {error && (
                <div style={styles.errorMessage}>
                  {error}
                </div>
              )}
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password:</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div style={styles.buttonGroup}>
                <button 
                  type="button" 
                  style={styles.loginButton} 
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
                
                <div style={styles.divider}>
                  Don't have an account?
                </div>
                
                <span style={styles.registerLink} onClick={handleRegisterClick}>
                  Sign up for free
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer onNavigate={onNavigate} isLoggedIn={isLoggedIn} onLogout={onLogout} />
    </div>
  );
};

export default LoginPage;