// src/components/GetCampWoodHomepage.jsx

import React from 'react';
import Header from './Header';
import Footer from './Footer';
// api service is not directly used here anymore for the map button
// import api from '../services/api'; 

const GetCampWoodHomepage = ({ onNavigate, isLoggedIn, currentUser, onLogout }) => {
  // ... (styles object remains the same)
  const styles = {
    pageWrapper: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif'
    },
    container: {
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    heroSection: {
      background: 'linear-gradient(to bottom, #0d9488, #0f766e)',
      paddingBottom: '32px'
    },
    heroContainer: {
      padding: '0 16px'
    },
    bannerContainer: {
      position: 'relative',
      background: 'linear-gradient(to bottom, #fef3c7, #fde68a)',
      borderRadius: '8px',
      margin: '0 0 32px',
      height: '400px',
      overflow: 'hidden',
      border: '8px solid #92400e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    bannerImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '4px'
    },
    fallbackBanner: {
      position: 'absolute',
      top: '16px',
      left: '16px',
      right: '16px',
      height: '48px',
      backgroundColor: '#92400e',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    titleText: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#451a03',
      letterSpacing: '0.1em'
    },
    scene: {
      position: 'absolute',
      top: '64px',
      left: '0',
      right: '0',
      bottom: '0',
      background: 'linear-gradient(to bottom, #bfdbfe, #bbf7d0)'
    },
    ground: {
      position: 'absolute',
      bottom: '32px',
      left: '0',
      right: '0',
      height: '128px',
      backgroundColor: '#86efac'
    },
    tree: {
      position: 'absolute',
      bottom: '64px',
      width: '0',
      height: '0',
      borderLeft: '16px solid transparent',
      borderRight: '16px solid transparent',
      borderBottom: '64px solid #166534'
    },
    character: {
      position: 'absolute',
      bottom: '64px',
      left: '50%',
      transform: 'translateX(-50%)',
      textAlign: 'center'
    },
    characterHead: {
      width: '64px',
      height: '64px',
      backgroundColor: '#ea580c',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      marginBottom: '8px'
    },
    characterBody: {
      width: '80px',
      height: '32px',
      backgroundColor: '#15803d',
      borderRadius: '4px'
    },
    logs: {
      position: 'absolute',
      bottom: '48px',
      left: '33%',
      display: 'flex',
      gap: '4px'
    },
    log: {
      width: '24px',
      height: '24px',
      backgroundColor: '#92400e',
      borderRadius: '50%'
    },
    fire: {
      position: 'absolute',
      bottom: '48px',
      right: '33%'
    },
    flame: {
      width: '48px',
      height: '48px',
      backgroundColor: '#f97316',
      borderRadius: '50%',
      animation: 'pulse 2s infinite'
    },
    fireBase: {
      width: '32px',
      height: '16px',
      backgroundColor: '#92400e',
      borderRadius: '4px',
      margin: '0 auto'
    },
    planks: {
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      height: '32px',
      backgroundColor: '#92400e',
      display: 'flex'
    },
    plank: {
      flex: '1',
      borderRight: '1px solid #451a03',
      height: '100%'
    },
    mainContent: {
      backgroundColor: 'white',
      paddingTop: '48px',
      paddingBottom: '48px'
    },
    contentContainer: {
      padding: '0 16px',
      textAlign: 'center'
    },
    subtitle: {
      color: '#2563eb',
      fontWeight: '600',
      fontSize: '14px',
      marginBottom: '8px',
      letterSpacing: '0.05em'
    },
    mainTitle: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '32px'
    },
    // NEW: Software benefits section
    softwareBenefitsSection: {
      backgroundColor: '#eff6ff',
      border: '2px solid #2563eb',
      borderRadius: '12px',
      padding: '32px',
      marginBottom: '48px',
      textAlign: 'left'
    },
    softwareBenefitsTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1e40af',
      marginBottom: '16px',
      textAlign: 'center'
    },
    softwareBenefitsSubtitle: {
      fontSize: '16px',
      color: '#3730a3',
      marginBottom: '24px',
      textAlign: 'center',
      fontStyle: 'italic'
    },
    benefitsList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '20px'
    },
    benefitItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    },
    benefitIcon: {
      fontSize: '20px',
      minWidth: '24px'
    },
    benefitText: {
      color: '#1e40af',
      fontSize: '15px',
      lineHeight: '1.5'
    },
    ctaSection: {
      backgroundColor: '#f0f9ff',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '24px',
      textAlign: 'center'
    },
    ctaText: {
      color: '#1e40af',
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '12px'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '32px',
      marginBottom: '48px'
    },
    feature: {
      textAlign: 'center'
    },
    featureIcon: {
      width: '64px',
      height: '64px',
      margin: '0 auto 16px',
      backgroundColor: '#e5e7eb',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px'
    },
    featureText: {
      color: '#374151',
      lineHeight: '1.6'
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      justifyContent: 'center',
      marginBottom: '48px'
    },
    button: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '12px 32px',
      borderRadius: '8px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.2s'
    }
  };


  const handleSignUpClick = () => {
    if (onNavigate) {
      onNavigate('register');
    }
  };

  const handleViewMapClick = () => {
    // UPDATED: Navigate internally instead of opening a new window
    if (onNavigate) {
      onNavigate('map');
    }
  };

  const handlePromoteListingsClick = () => {
    alert('📢 Listing Promotion Coming Soon!\n\nBoost your firewood listings to reach more customers and increase your sales.');
  };

  // The rest of the component's return statement is unchanged...
  return (
    <div style={styles.pageWrapper}>
      <Header onNavigate={onNavigate} isLoggedIn={isLoggedIn} currentUser={currentUser} onLogout={onLogout} />

      <div style={styles.container}>
        {/* Hero Section */}
        <div style={styles.heroSection}>
          <div style={styles.heroContainer}>
            <div style={styles.bannerContainer}>
              <img 
                src="banner size.png" 
                alt="GetCampWood Banner" 
                style={styles.bannerImage}
                onError={(e) => {
                  e.target.style.display = 'none';
                  // This logic to show a fallback is complex and might be better handled differently
                  // For now, we ensure it doesn't crash.
                  const fallback = e.target.nextSibling;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              {/* Fallback content */}
              <div style={{...styles.scene, display: 'none'}}>
                <div style={styles.fallbackBanner}>
                  <h1 style={styles.titleText}>FIREWOOD</h1>
                </div>
                
                <div style={styles.ground}></div>
                
                {/* Trees */}
                <div style={{...styles.tree, left: '64px'}}></div>
                <div style={{...styles.tree, left: '128px'}}></div>
                <div style={{...styles.tree, right: '64px'}}></div>
                
                {/* Character */}
                <div style={styles.character}>
                  <div style={styles.characterHead}>👨‍🌾</div>
                  <div style={styles.characterBody}></div>
                </div>
                
                {/* Logs */}
                <div style={styles.logs}>
                  <div style={styles.log}></div>
                  <div style={styles.log}></div>
                  <div style={styles.log}></div>
                </div>
                
                {/* Fire */}
                <div style={styles.fire}>
                  <div style={styles.flame}></div>
                  <div style={styles.fireBase}></div>
                </div>
                
                {/* Bottom planks */}
                <div style={styles.planks}>
                  {Array.from({length: 20}).map((_, i) => (
                    <div key={i} style={styles.plank}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          <div style={styles.contentContainer}>
            <p style={styles.subtitle}>FIND LOCAL FIREWOOD</p>
            <h2 style={styles.mainTitle}>Buy Local. Burn Local. Save the Forest.</h2>

            {/* NEW: Software Benefits Section */}
            <div style={styles.softwareBenefitsSection}>
              <h3 style={styles.softwareBenefitsTitle}>🚀 Why Use GetCampWood?</h3>
              <p style={styles.softwareBenefitsSubtitle}>
                GetCampWood makes finding and selling local firewood simple, fast, and reliable
              </p>
              
              <div style={styles.benefitsList}>
                <div style={styles.benefitItem}>
                  <span style={styles.benefitIcon}>🗺️</span>
                  <span style={styles.benefitText}>
                    <strong>Interactive Map:</strong> Instantly see all firewood suppliers near your location with real-time availability and pricing
                  </span>
                </div>
                
                <div style={styles.benefitItem}>
                  <span style={styles.benefitIcon}>⏰</span>
                  <span style={styles.benefitText}>
                    <strong>Save Time:</strong> No more driving around looking for firewood - find exactly what you need before you leave home
                  </span>
                </div>
                
                <div style={styles.benefitItem}>
                  <span style={styles.benefitIcon}>💰</span>
                  <span style={styles.benefitText}>
                    <strong>Compare Prices:</strong> Easily compare prices from multiple suppliers to get the best deal on quality firewood
                  </span>
                </div>
                
                <div style={styles.benefitItem}>
                  <span style={styles.benefitIcon}>📱</span>
                  <span style={styles.benefitText}>
                    <strong>Mobile Friendly:</strong> Access GetCampWood from anywhere - perfect for planning your camping trips on the go
                  </span>
                </div>
                
                <div style={styles.benefitItem}>
                  <span style={styles.benefitIcon}>✅</span>
                  <span style={styles.benefitText}>
                    <strong>Verified Suppliers:</strong> All suppliers are vetted to ensure you get quality, properly seasoned firewood every time
                  </span>
                </div>
                
                <div style={styles.benefitItem}>
                  <span style={styles.benefitIcon}>🎯</span>
                  <span style={styles.benefitText}>
                    <strong>Targeted Search:</strong> Filter by wood type, quantity, delivery options, and distance to find exactly what you need
                  </span>
                </div>
              </div>
              
              <div style={styles.ctaSection}>
                <p style={styles.ctaText}>
                  Join thousands of campers and suppliers already using GetCampWood!
                </p>
                <p style={{...styles.benefitText, textAlign: 'center', marginBottom: '0'}}>
                  🔥 Start finding local firewood in seconds, not hours
                </p>
              </div>
            </div>

            <div style={styles.featuresGrid}>
              <div style={styles.feature}>
                <div style={styles.featureIcon}>🐛</div>
                <p style={styles.featureText}>
                  Invasive pests like the emerald ash borer and Asian longhorned beetle can hitch a ride on firewood, spreading disease and destruction to forests far from their origin. Buying local firewood helps prevent these bugs from traveling across counties and states. Keep your campfire cozy and your forests healthy — don't move wood.
                </p>
              </div>

              <div style={styles.feature}>
                <div style={styles.featureIcon}>🏛️</div>
                <p style={styles.featureText}>
                  Why load your car with heavy firewood when you can pick it up near your campsite? Buying local means less packing, more space for gear and snacks, and a smoother trip. Focus on fun — not hauling logs.
                </p>
              </div>

              <div style={styles.feature}>
                <div style={styles.featureIcon}>💰</div>
                <p style={styles.featureText}>
                  When you buy campfire wood nearby, you're putting money directly into the hands of local landowners, sawmills, or small businesses. It's a simple way to support rural economies and sustainable forestry. Your fire warms more than your campsite — it helps your community thrive.
                </p>
              </div>

              <div style={styles.feature}>
                <div style={styles.featureIcon}>🚗</div>
                <p style={styles.featureText}>
                  Transporting firewood can leave bark, bugs, and even mold in your car. Local firewood keeps your vehicle cleaner and helps avoid introducing pests into your trunk or garage. Skip the mess and keep nature where it belongs.
                </p>
              </div>
            </div>

            <div style={styles.buttonContainer}>
              <button style={styles.button} onClick={handleViewMapClick}>View Map</button>
              <button style={styles.button} onClick={handleSignUpClick}>
                Sign up for free
              </button>
              <button style={styles.button} onClick={handlePromoteListingsClick}>Promote Listings</button>
            </div>
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} isLoggedIn={isLoggedIn} onLogout={onLogout} />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @media (min-width: 640px) {
          .buttonContainer {
            flex-direction: row !important;
          }
        }
      `}</style>
    </div>
  );
};

export default GetCampWoodHomepage;
