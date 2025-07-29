import React, { useState } from 'react';
import GetCampWoodHomepage from './components/GetCampWoodHomepage';
import RegistrationPage from './components/RegistrationPage';
import LoginPage from './components/LoginPage';
import AccountPage from './components/AccountPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setCurrentUser(userData);
    console.log('User logged in:', userData);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('home'); // Redirect to home after logout
    
    // Show logout confirmation popup
    alert('You have been successfully logged out. Thank you for using GetCampWood!');
    console.log('User logged out');
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
    // Clear all user data
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('home'); // Redirect to home after account deletion
    
    // Show account deletion confirmation popup
    alert('Your account has been successfully deleted. We\'re sorry to see you go!');
    console.log('User account deleted');
  };

  if (currentPage === 'account') {
    return (
      <AccountPage 
        onNavigate={handleNavigate} 
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onLogout={handleLogout}
        onUserUpdate={handleUserUpdate}
        onAccountDeleted={handleAccountDeletion}
      />
    );
  }

  if (currentPage === 'register') {
    return (
      <RegistrationPage 
        onNavigate={handleNavigate} 
        onRegister={handleRegister}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  if (currentPage === 'login') {
    return (
      <LoginPage 
        onNavigate={handleNavigate} 
        onLogin={handleLogin}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <GetCampWoodHomepage 
      onNavigate={handleNavigate}
      isLoggedIn={isLoggedIn}
      currentUser={currentUser}
      onLogout={handleLogout}
    />
  );
}

export default App;