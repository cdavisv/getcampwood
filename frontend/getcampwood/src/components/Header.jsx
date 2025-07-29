// Header.jsx
import React, { useState } from 'react';
import { Menu, User } from 'lucide-react';

const Header = ({ onNavigate, isLoggedIn, currentUser, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const styles = {
    header: {
      backgroundColor: '#0f766e',
      padding: '0',
      color: 'white'
    },
    headerContent: {
      padding: '12px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      boxSizing: 'border-box'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      textDecoration: 'none',
      color: 'white'
    },
    logoIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      marginRight: '12px',
      objectFit: 'cover'
    },
    logoText: {
      fontSize: '14px',
      fontWeight: '500'
    },
    headerNav: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    headerButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '8px',
      borderRadius: '4px',
      transition: 'color 0.2s'
    },
    dropdown: {
      position: 'absolute',
      right: '0',
      top: '100%',
      marginTop: '8px',
      width: '192px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      padding: '8px 0',
      zIndex: 50
    },
    dropdownItem: {
      display: 'block',
      padding: '8px 16px',
      color: '#1f2937',
      textDecoration: 'none',
      fontSize: '14px',
      transition: 'background-color 0.2s',
      cursor: 'pointer'
    },
    userInfo: {
      fontSize: '12px',
      color: '#e5e7eb',
      marginRight: '8px'
    }
  };

  const handleLogoClick = () => {
    if (onNavigate) {
      onNavigate('home');
    }
  };

  const handleAccountClick = () => {
    if (isLoggedIn) {
      if (onNavigate) {
        onNavigate('account');
      }
    } else {
      if (onNavigate) {
        onNavigate('login');
      }
    }
    setIsMenuOpen(false);
  };

  const handleSignUpClick = () => {
    if (onNavigate) {
      onNavigate('register');
    }
    setIsMenuOpen(false);
  };

  const handleLoginClick = () => {
    if (onNavigate) {
      onNavigate('login');
    }
    setIsMenuOpen(false);
  };

  const handleLogoutClick = () => {
    // Ask for confirmation before logging out
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    
    if (confirmLogout) {
      if (onLogout) {
        onLogout(); // This will now show the success popup in App.jsx
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <div style={styles.logo} onClick={handleLogoClick}>
          <img 
            src="logo4.png" 
            alt="GetCampWood Logo" 
            style={styles.logoIcon}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div style={{...styles.logoIcon, backgroundColor: '#ea580c', display: 'none', alignItems: 'center', justifyContent: 'center', fontSize: '20px'}}>🏕️</div>
          <span style={styles.logoText}>GetCampWood.com</span>
        </div>
        
        <nav style={styles.headerNav}>
          {isLoggedIn && currentUser && (
            <span style={styles.userInfo}>
              Welcome, {currentUser.name || currentUser.email}
            </span>
          )}
          
          <button style={styles.headerButton} onClick={handleAccountClick}>
            <User size={20} />
            <span>Account</span>
          </button>
          
          <div style={{position: 'relative'}}>
            <button 
              style={styles.headerButton}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={20} />
              <span>Menu</span>
            </button>
            
            {isMenuOpen && (
              <div style={styles.dropdown}>
                {!isLoggedIn ? (
                  <>
                    <div style={styles.dropdownItem} onClick={handleSignUpClick}>Sign Up For Free</div>
                    <div style={styles.dropdownItem} onClick={handleLoginClick}>Login</div>
                  </>
                ) : (
                  <>
                    <div style={styles.dropdownItem} onClick={handleAccountClick}>Your Account</div>
                    <div style={styles.dropdownItem}>Manage Listings</div>
                  </>
                )}
                <a href="#" style={styles.dropdownItem}>View Map</a>
                <a href="#" style={styles.dropdownItem}>Add Location</a>
                <a href="#" style={styles.dropdownItem}>Promote List</a>
                <a href="#" style={styles.dropdownItem}>About Us</a>
                <a href="#" style={styles.dropdownItem}>Contact Us</a>
                {isLoggedIn && (
                  <div style={styles.dropdownItem} onClick={handleLogoutClick}>Logout</div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;