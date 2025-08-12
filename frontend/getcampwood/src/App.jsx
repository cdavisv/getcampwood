import React, { useState, useEffect } from 'react';
import GetCampWoodHomepage from './components/GetCampWoodHomepage';
import RegistrationPage from './components/RegistrationPage';
import LoginPage from './components/LoginPage';
import AccountPage from './components/AccountPage';
import api from './services/api';
import './App.css';

// Floating global "View Map" button (bottom-right)
function FloatingViewMapButton({ onClick }) {
  return (
    <button
      className="floating-map-btn"
      aria-label="View Map"
      title="View Map"
      onClick={onClick}
    >
      View Map
    </button>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Rehydrate auth on initial load and validate token
  useEffect(() => {
    const token = api.getAuthToken();
    const cachedUser = api.getUser();
    if (token && cachedUser) {
      setIsLoggedIn(true);
      setCurrentUser(cachedUser);
      (async () => {
        const freshUser = await api.getCurrentUser();
        if (freshUser) {
          setCurrentUser(freshUser);
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      })();
    }
  }, []);

  // Cross-tab auth sync via localStorage events
  useEffect(() => {
    function applyAuthFromStorage() {
      const token = api.getAuthToken();
      const cachedUser = api.getUser();
      if (token && cachedUser) {
        setIsLoggedIn(true);
        setCurrentUser(cachedUser);
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
        if (currentPage === 'account') setCurrentPage('home');
      }
    }
    function handleStorage(e) {
      if (e.key === 'authToken' || e.key === 'user' || e.key === null) {
        applyAuthFromStorage();
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [currentPage]);

  const handleNavigate = (page) => setCurrentPage(page);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    console.log('User logged in:', userData);
  };

  const handleLogout = async () => {
    try {
      await api.logout?.();
    } finally {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setCurrentPage('home');
      console.log('User logged out');
    }
  };

  const handleRegister = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    console.log('User registered:', userData);
  };

  const handleUserUpdate = (updatedUserData) => {
    setCurrentUser(updatedUserData);
    console.log('User updated:', updatedUserData);
  };

  const handleAccountDeletion = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('home');
    alert("Your account has been successfully deleted. We're sorry to see you go!");
    console.log('User account deleted');
  };

  const handleViewMap = () => {
    const mapUrl = import.meta.env.VITE_MAP_UI_URL || 'http://localhost:5174';
    const token = api.getAuthToken(); // Get the token
    // Append the token to the URL if it exists
    const urlWithToken = token ? `${mapUrl}?token=${token}` : mapUrl;
    window.open(urlWithToken, '_blank');
  };

  if (currentPage === 'account') {
    return (
      <>
        <AccountPage
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          onLogout={handleLogout}
          onUserUpdate={handleUserUpdate}
          onAccountDeleted={handleAccountDeletion}
        />
        <FloatingViewMapButton onClick={handleViewMap} />
      </>
    );
  }
  if (currentPage === 'register') {
    return (
      <>
        <RegistrationPage
          onNavigate={handleNavigate}
          onRegister={handleRegister}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <FloatingViewMapButton onClick={handleViewMap} />
      </>
    );
  }
  if (currentPage === 'login') {
    return (
      <>
        <LoginPage
          onNavigate={handleNavigate}
          onLogin={handleLogin}
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        <FloatingViewMapButton onClick={handleViewMap} />
      </>
    );
  }
  return (
    <>
      <GetCampWoodHomepage
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <FloatingViewMapButton onClick={handleViewMap} />
    </>
  );
}

export default App;