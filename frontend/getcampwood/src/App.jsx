// src/App.jsx

import React, { useState, useEffect } from 'react';
import GetCampWoodHomepage from './components/GetCampWoodHomepage';
import RegistrationPage from './components/RegistrationPage';
import LoginPage from './components/LoginPage';
import AccountPage from './components/AccountPage';
import MapPage from './components/MapPage'; // <-- IMPORT THE NEW MAP PAGE
import api from './services/api';
import './App.css';

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
          // Token was invalid, log out
          handleLogout();
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
        if (!isLoggedIn) setIsLoggedIn(true);
        if (JSON.stringify(currentUser) !== JSON.stringify(cachedUser)) {
             setCurrentUser(cachedUser);
        }
      } else {
        if (isLoggedIn) {
            setIsLoggedIn(false);
            setCurrentUser(null);
            if (currentPage === 'account' || currentPage === 'map') setCurrentPage('home');
        }
      }
    }
    window.addEventListener('storage', applyAuthFromStorage);
    return () => window.removeEventListener('storage', applyAuthFromStorage);
  }, [currentPage, isLoggedIn, currentUser]);


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

  // REMOVED: The old handleViewMap and FloatingViewMapButton are no longer needed.
  // Navigation is now handled by the components themselves.

  // --- Page Rendering Logic ---
  const pageProps = {
    onNavigate: handleNavigate,
    isLoggedIn: isLoggedIn,
    currentUser: currentUser,
    onLogout: handleLogout,
  };

  switch (currentPage) {
    case 'home':
      return <GetCampWoodHomepage {...pageProps} />;
    case 'map': // <-- ADDED: Route to the map page
      return <MapPage {...pageProps} />;
    case 'account':
      return <AccountPage {...pageProps} onUserUpdate={handleUserUpdate} onAccountDeleted={handleAccountDeletion} />;
    case 'register':
      return <RegistrationPage {...pageProps} onRegister={handleRegister} />;
    case 'login':
      return <LoginPage {...pageProps} onLogin={handleLogin} />;
    default:
      return <GetCampWoodHomepage {...pageProps} />;
  }
}

export default App;
