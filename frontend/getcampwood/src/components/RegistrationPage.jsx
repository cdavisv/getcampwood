// RegistrationPage.jsx
import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import apiService from '../services/api';

const RegistrationPage = ({ onNavigate, onRegister, isLoggedIn, currentUser, onLogout }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    reenterPassword: ''
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
    if (!formData.name || !formData.email || !formData.password || !formData.reenterPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.reenterPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (response.success) {
        // Registration successful
        const userData = {
          name: formData.name,
          email: formData.email
        };
        
        if (onRegister) {
          onRegister(userData);
        }
        
        alert('Registration successful! Welcome to GetCampWood!');
        if (onNavigate) {
          onNavigate('home');
        }
      }
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
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
    submitButton: {
      display: 'block',
      margin: '32px auto 0',
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
    errorMessage: {
      color: '#dc2626',
      fontSize: '14px',
      textAlign: 'center',
      marginBottom: '16px',
      padding: '8px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '4px'
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <Header onNavigate={onNavigate} isLoggedIn={isLoggedIn} currentUser={currentUser} onLogout={onLogout} />
      
      <div style={styles.container}>
        <main style={styles.mainContent}>
          <div style={styles.formContainer}>
            <h1 style={styles.title}>Register Your Account</h1>
            
            <div>
              {error && (
                <div style={styles.errorMessage}>
                  {error}
                </div>
              )}
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.input}
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
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Reenter Password:</label>
                <input
                  type="password"
                  name="reenterPassword"
                  value={formData.reenterPassword}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>

              <button 
                type="button" 
                style={styles.submitButton} 
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Register'}
              </button>
            </div>
          </div>
        </main>
      </div>

      <Footer onNavigate={onNavigate} isLoggedIn={isLoggedIn} onLogout={onLogout} />
    </div>
  );
};

export default RegistrationPage;