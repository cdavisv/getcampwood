// AccountPage.jsx
import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import apiService from '../services/api';

const AccountPage = ({ onNavigate, isLoggedIn, currentUser, onLogout, onUserUpdate, onAccountDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Only redirect if explicitly not logged in AND no current user
  if (!isLoggedIn && !currentUser) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <h2>Please log in to access your account</h2>
          <button 
            onClick={() => onNavigate('login')}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError('');
    setSuccessMessage('');
    // Reset form data when canceling
    if (isEditing) {
      setFormData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    }
  };

  const handleSaveChanges = async () => {
    setError('');
    setSuccessMessage('');

    // Basic validation
    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      return;
    }

    // Password validation if changing password
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError('Current password is required to change password');
        return;
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        setError('New passwords do not match');
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        return;
      }
    }

    setIsLoading(true);

    try {
      const updateData = {
        name: formData.name,
        email: formData.email
      };

      // Include password change if provided
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await apiService.updateProfile(updateData);

      if (response.success) {
        // Update user data in parent component
        const updatedUser = {
          ...currentUser,
          name: formData.name,
          email: formData.email
        };
        
        if (onUserUpdate) {
          onUserUpdate(updatedUser);
        }

        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        }));
      }
    } catch (error) {
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // First confirmation
    const confirmDelete = window.confirm(
      '⚠️ PERMANENT DELETION WARNING ⚠️\n\nAre you absolutely sure you want to delete your account?\n\nThis action will:\n- Permanently delete all your data\n- Remove your account from our servers\n- Cannot be undone\n\nClick OK only if you are certain.'
    );

    if (!confirmDelete) return;

    // Second confirmation for extra safety
    const finalConfirm = window.confirm(
      '🚨 FINAL CONFIRMATION 🚨\n\nThis is your last chance!\n\nDeleting your account will permanently remove:\n✗ Your profile information\n✗ All your data\n✗ Your login credentials\n\nThere is NO way to recover your account after deletion.\n\nType your email in the next prompt to confirm.'
    );

    if (!finalConfirm) return;

    // Email confirmation
    const emailConfirmation = prompt(
      `To confirm account deletion, please type your email address:\n\n${currentUser?.email}\n\nType it exactly as shown above:`
    );

    if (emailConfirmation !== currentUser?.email) {
      alert('Email confirmation failed. Account deletion cancelled for your safety.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Starting account deletion process...');
      
      // Check if API is available first
      const isApiAvailable = await apiService.checkApiConnection();
      console.log('API availability check:', isApiAvailable);
      
      if (isApiAvailable) {
        // Try to call the API to delete account
        console.log('API is available, attempting server deletion...');
        const response = await apiService.deleteAccount();
        
        if (response.success) {
          console.log('Account successfully deleted from server');
          alert('✅ Account Deletion Successful!\n\nYour account has been permanently deleted from our servers.\n\nThank you for using GetCampWood!');
          
          if (onAccountDeleted) {
            onAccountDeleted();
          } else {
            // Fallback if onAccountDeleted is not provided
            if (onLogout) {
              onLogout();
            }
          }
          return;
        } else {
          throw new Error(response.message || 'Failed to delete account');
        }
      } else {
        throw new Error('Backend server is not available');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      
      // Handle different types of errors
      if (error.message.includes('Unable to connect to server') || error.message.includes('Backend server is not available')) {
        const proceedWithLocal = window.confirm(
          '⚠️ Server Connection Failed\n\nWe cannot connect to our servers right now, but we can:\n✓ Log you out locally\n✓ Clear your session data\n\nNote: If you had an online account, it will still exist on our servers.\n\nWould you like to proceed with local logout?'
        );
        
        if (proceedWithLocal) {
          console.log('User chose to proceed with local logout');
          alert('✅ Local Logout Successful!\n\nYour local session has been cleared.\n\nIf you had an online account, please contact support to delete it from our servers.');
          
          if (onAccountDeleted) {
            onAccountDeleted();
          } else {
            if (onLogout) {
              onLogout();
            }
          }
        } else {
          setError('Account deletion cancelled. Please try again when the server is available.');
        }
      } else {
        // Other API errors (like validation errors, auth errors, etc.)
        setError(`Account deletion failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder handlers for listing actions
  const handleAddListing = () => {
    alert('🚧 Add Listing feature coming soon!\n\nThis will allow you to create new firewood listings.');
  };

  const handleManageListings = () => {
    alert('🚧 Manage Listings feature coming soon!\n\nThis will show all your current listings with options to edit, delete, or update them.');
  };

  const handleEditDeleteListings = () => {
    alert('🚧 Edit/Delete Listings feature coming soon!\n\nThis will provide detailed controls for modifying or removing your listings.');
  };

  const handlePromoteListings = () => {
    alert('🚧 Promote Listings feature coming soon!\n\nThis will allow you to boost your listings for better visibility.');
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
      padding: '48px 16px',
      display: 'flex',
      justifyContent: 'center'
    },
    accountContainer: {
      width: '100%',
      maxWidth: '600px',
      backgroundColor: 'white',
      padding: '48px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '32px',
      color: '#1f2937'
    },
    section: {
      marginBottom: '32px',
      paddingBottom: '24px',
      borderBottom: '1px solid #e5e7eb'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '16px',
      color: '#1f2937'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px',
      fontFamily: 'inherit',
      backgroundColor: 'white',
      color: 'black',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
    },
    inputDisabled: {
      backgroundColor: '#f9fafb',
      color: '#6b7280',
      cursor: 'not-allowed'
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '24px'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      border: 'none'
    },
    primaryButton: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#6b7280',
      color: 'white'
    },
    editButton: {
      backgroundColor: '#059669',
      color: 'white'
    },
    dangerButton: {
      backgroundColor: '#dc2626',
      color: 'white'
    },
    message: {
      padding: '12px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      marginBottom: '20px'
    },
    errorMessage: {
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fecaca'
    },
    successMessage: {
      backgroundColor: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0'
    },
    infoText: {
      color: '#6b7280',
      fontSize: '14px',
      fontStyle: 'italic'
    },
    dangerZone: {
      marginTop: '40px',
      padding: '24px',
      backgroundColor: '#fef2f2',
      border: '2px solid #dc2626',
      borderRadius: '8px'
    },
    dangerTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#dc2626',
      marginBottom: '12px'
    },
    dangerText: {
      color: '#991b1b',
      fontSize: '14px',
      marginBottom: '16px',
      lineHeight: '1.5'
    },
    warningBox: {
      backgroundColor: '#fff3cd',
      border: '1px solid #ffc107',
      borderRadius: '6px',
      padding: '12px 16px',
      marginBottom: '16px'
    },
    warningText: {
      color: '#856404',
      fontSize: '14px',
      fontWeight: '500'
    },
    // New styles for listings section
    listingsSection: {
      marginBottom: '32px',
      paddingBottom: '24px',
      borderBottom: '1px solid #e5e7eb'
    },
    listingsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginBottom: '16px'
    },
    listingCard: {
      padding: '20px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#f9fafb',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'center'
    },
    listingCardHover: {
      borderColor: '#2563eb',
      backgroundColor: '#eff6ff',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    listingIcon: {
      fontSize: '32px',
      marginBottom: '12px',
      display: 'block'
    },
    listingTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '8px'
    },
    listingDescription: {
      fontSize: '14px',
      color: '#6b7280',
      lineHeight: '1.4'
    },
    comingSoonBadge: {
      display: 'inline-block',
      backgroundColor: '#fbbf24',
      color: '#92400e',
      fontSize: '12px',
      fontWeight: '600',
      padding: '4px 8px',
      borderRadius: '4px',
      marginTop: '8px'
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <Header onNavigate={onNavigate} isLoggedIn={isLoggedIn} currentUser={currentUser} onLogout={onLogout} />
      
      <div style={styles.container}>
        <main style={styles.mainContent}>
          <div style={styles.accountContainer}>
            <h1 style={styles.title}>Account Settings</h1>
            
            {error && (
              <div style={{...styles.message, ...styles.errorMessage}}>
                {error}
              </div>
            )}
            
            {successMessage && (
              <div style={{...styles.message, ...styles.successMessage}}>
                {successMessage}
              </div>
            )}

            {/* Profile Information */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Profile Information</h2>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    ...(isEditing ? {} : styles.inputDisabled)
                  }}
                  disabled={!isEditing}
                  placeholder="Enter your full name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    ...(isEditing ? {} : styles.inputDisabled)
                  }}
                  disabled={!isEditing}
                  placeholder="Enter your email address"
                />
              </div>

              {!isEditing && (
                <p style={styles.infoText}>
                  Click "Edit Profile" to make changes to your information.
                </p>
              )}
            </div>

            {/* Password Change Section (only when editing) */}
            {isEditing && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Change Password</h2>
                <p style={styles.infoText}>
                  Leave password fields empty if you don't want to change your password.
                </p>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter your current password"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter your new password"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Confirm your new password"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={styles.buttonGroup}>
              {!isEditing ? (
                <button 
                  style={{...styles.button, ...styles.editButton}}
                  onClick={handleEditToggle}
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button 
                    style={{...styles.button, ...styles.secondaryButton}}
                    onClick={handleEditToggle}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    style={{...styles.button, ...styles.primaryButton}}
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>

            {/* NEW: Listings Section */}
            <div style={styles.listingsSection}>
              <h2 style={styles.sectionTitle}>🪵 Your Firewood Listings</h2>
              
              <div style={styles.listingsGrid}>
                <ListingCard
                  icon="➕"
                  title="Add New Listing"
                  description="Create a new firewood listing to sell your wood locally"
                  onClick={handleAddListing}
                  styles={styles}
                />
                
                <ListingCard
                  icon="📋"
                  title="Manage Listings"
                  description="View and manage all your current firewood listings"
                  onClick={handleManageListings}
                  styles={styles}
                />
                
                <ListingCard
                  icon="✏️"
                  title="Edit/Delete Listings"
                  description="Modify details or remove existing listings"
                  onClick={handleEditDeleteListings}
                  styles={styles}
                />
                
                <ListingCard
                  icon="📢"
                  title="Promote Listings"
                  description="Boost your listings for better visibility and more sales"
                  onClick={handlePromoteListings}
                  styles={styles}
                />
              </div>
              
              <p style={styles.infoText}>
                ℹ️ All listing features are currently under development. Click any option above to learn more about upcoming functionality.
              </p>
            </div>

            {/* Danger Zone */}
            <div style={styles.dangerZone}>
              <h3 style={styles.dangerTitle}>🚨 Danger Zone</h3>
              
              <div style={styles.warningBox}>
                <p style={styles.warningText}>
                  ⚠️ PERMANENT DELETION: This action cannot be undone and will completely remove your account from our servers.
                </p>
              </div>
              
              <p style={styles.dangerText}>
                Deleting your account will permanently remove:
                <br />• All your profile information
                <br />• Any saved preferences
                <br />• Your login credentials
                <br />• All associated data
                <br /><br />
                <strong>This action is irreversible.</strong> Please be absolutely certain before proceeding.
              </p>
              <button 
                style={{...styles.button, ...styles.dangerButton}}
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting Account...' : '🗑️ Delete Account Permanently'}
              </button>
            </div>
          </div>
        </main>
      </div>

      <Footer onNavigate={onNavigate} isLoggedIn={isLoggedIn} onLogout={onLogout} />
    </div>
  );
};

// New component for individual listing cards
const ListingCard = ({ icon, title, description, onClick, styles }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.listingCard,
        ...(isHovered ? styles.listingCardHover : {})
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={styles.listingIcon}>{icon}</span>
      <h3 style={styles.listingTitle}>{title}</h3>
      <p style={styles.listingDescription}>{description}</p>
      <span style={styles.comingSoonBadge}>Coming Soon</span>
    </div>
  );
};

export default AccountPage;