// Footer.jsx
import React from 'react';
import { Youtube, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = ({ onNavigate, isLoggedIn, onLogout }) => {
  const styles = {
    newsletter: {
      backgroundColor: '#4b5563',
      padding: '32px 0'
    },
    newsletterContainer: {
      padding: '0 16px',
      textAlign: 'center',
      width: '100%',
      boxSizing: 'border-box'
    },
    newsletterForm: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px'
    },
    emailInput: {
      padding: '8px 16px',
      borderRadius: '4px',
      border: 'none',
      width: '100%',
      maxWidth: '320px',
      fontSize: '14px',
      backgroundColor: 'white',
      color: 'black'
    },
    subscribeButton: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '8px 24px',
      borderRadius: '4px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    },
    footer: {
      backgroundColor: '#374151',
      color: 'white',
      padding: '48px 0'
    },
    footerContainer: {
      padding: '0 16px',
      width: '100%',
      boxSizing: 'border-box'
    },
    footerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '32px',
      marginBottom: '32px'
    },
    footerSection: {
      fontSize: '14px'
    },
    footerTitle: {
      fontWeight: '600',
      marginBottom: '16px'
    },
    footerList: {
      listStyle: 'none',
      padding: '0',
      margin: '0'
    },
    footerListItem: {
      marginBottom: '8px'
    },
    footerLink: {
      color: 'white',
      textDecoration: 'none',
      transition: 'color 0.2s',
      cursor: 'pointer'
    },
    footerBottom: {
      borderTop: '1px solid #4b5563',
      paddingTop: '32px'
    },
    socialSection: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    socialIcons: {
      display: 'flex',
      gap: '12px',
      marginBottom: '16px'
    },
    socialIcon: {
      cursor: 'pointer',
      transition: 'color 0.2s'
    },
    copyright: {
      fontSize: '14px',
      color: '#9ca3af'
    },
    legalLinks: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      fontSize: '14px',
      color: '#9ca3af'
    },
    legalLink: {
      color: '#9ca3af',
      textDecoration: 'none',
      transition: 'color 0.2s'
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
  };

  const handleSignUpClick = () => {
    if (onNavigate) {
      onNavigate('register');
    }
  };

  const handleLoginClick = () => {
    if (onNavigate) {
      onNavigate('login');
    }
  };

  const handleLogoutClick = () => {
    // Ask for confirmation before logging out
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    
    if (confirmLogout) {
      if (onLogout) {
        onLogout(); // This will now show the success popup in App.jsx
      }
    }
  };

  return (
    <>
      {/* Newsletter */}
      <div style={styles.newsletter}>
        <div style={styles.newsletterContainer}>
          <div style={styles.newsletterForm}>
            <input 
              type="email" 
              placeholder="Enter your email to get the latest news..."
              style={styles.emailInput}
            />
            <button style={styles.subscribeButton}>Subscribe</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContainer}>
          <div style={styles.footerGrid}>
            <div style={styles.footerSection}>
              <h3 style={styles.footerTitle}>Find Firewood</h3>
              <ul style={styles.footerList}>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>View Map</a></li>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>Add a Location</a></li>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>Promote Your Location</a></li>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>Manage Listings</a></li>
              </ul>
            </div>

            <div style={styles.footerSection}>
              <h3 style={styles.footerTitle}>Account</h3>
              <ul style={styles.footerList}>
                <li style={styles.footerListItem}><span style={styles.footerLink} onClick={handleAccountClick}>Your Account</span></li>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>Manage Listings</a></li>
                {!isLoggedIn ? (
                  <>
                    <li style={styles.footerListItem}><span style={styles.footerLink} onClick={handleSignUpClick}>Sign Up</span></li>
                    <li style={styles.footerListItem}><span style={styles.footerLink} onClick={handleLoginClick}>Log In</span></li>
                  </>
                ) : (
                  <li style={styles.footerListItem}><span style={styles.footerLink} onClick={handleLogoutClick}>Logout</span></li>
                )}
              </ul>
            </div>

            <div style={styles.footerSection}>
              <h3 style={styles.footerTitle}>Help / Support</h3>
              <ul style={styles.footerList}>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>About Us</a></li>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>Contact Us</a></li>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>FAQ</a></li>
                <li style={styles.footerListItem}><a href="#" style={styles.footerLink}>Learn Why</a></li>
              </ul>
            </div>
          </div>

          <div style={styles.footerBottom}>
            <div style={styles.socialSection}>
              <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'}}>
                <span style={{fontSize: '14px'}}>Join Us</span>
                <div style={styles.socialIcons}>
                  <Youtube size={20} style={styles.socialIcon} />
                  <Facebook size={20} style={styles.socialIcon} />
                  <Twitter size={20} style={styles.socialIcon} />
                  <Instagram size={20} style={styles.socialIcon} />
                  <Linkedin size={20} style={styles.socialIcon} />
                </div>
              </div>
              
              <div style={styles.copyright}>
                GetCampWood © 2025. All rights reserved.
              </div>
            </div>
            
            <div style={styles.legalLinks}>
              <a href="#" style={styles.legalLink}>Terms of Service</a>
              <a href="#" style={styles.legalLink}>Sitemap</a>
              <a href="#" style={styles.legalLink}>Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (min-width: 640px) {
          .newsletterForm {
            flex-direction: row !important;
          }
          .socialSection {
            flex-direction: row !important;
          }
          .legalLinks {
            flex-direction: row !important;
          }
        }
      `}</style>
    </>
  );
};

export default Footer;