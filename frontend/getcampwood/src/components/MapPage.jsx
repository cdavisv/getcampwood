// src/components/MapPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';
import api from '../services/api';
import Header from './Header';
import Footer from './Footer';

// Leaflet Icon Fix: By default, React build tools can lose the path to marker icons.
// This manually re-imports them to ensure they are bundled correctly.
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapPage = ({ onNavigate, isLoggedIn, currentUser, onLogout }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null); // To hold the map instance
  const markersLayerRef = useRef(null); // To hold the layer group for markers

  // State for the 'Add Location' modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [formState, setFormState] = useState({
    name: '',
    price: '',
    description: '',
    latitude: '',
    longitude: '',
  });

  // State for map status/feedback
  const [status, setStatus] = useState('Loading map...');

  // Effect for initializing the map (runs only once)
  useEffect(() => {
    if (mapRef.current) return; // Prevents re-initialization

    // Debug current user
    if (currentUser) {
      console.log('MapPage currentUser:', currentUser);
      api.debugCurrentUser().then(debugResult => {
        console.log('Debug user from API:', debugResult);
      });
    }

    // Initialize the map
    mapRef.current = L.map(mapContainerRef.current).setView([43.366, -124.217], 11);

    // Add tile layer - fetching directly from OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    // Initialize and add the markers layer
    markersLayerRef.current = L.layerGroup().addTo(mapRef.current);

    // --- Map Event Handlers ---
    mapRef.current.on('click', (e) => {
      if (!isLoggedIn) {
        alert('You must be logged in to add a new location. Please log in and try again.');
        return;
      }

      const { lat, lng } = e.latlng;
      setFormState(prev => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      }));
      setIsModalOpen(true);
    });

    // Disable map interaction on toolbar and modal elements to prevent event conflicts
    const disableMapEvents = (elementId) => {
      const element = document.getElementById(elementId);
      if (element) {
        L.DomEvent.disableClickPropagation(element);
        L.DomEvent.disableScrollPropagation(element);
      }
    };

    // Apply event disabling after a short delay to ensure elements exist
    setTimeout(() => {
      disableMapEvents('toolbar');
      disableMapEvents('addModal');
    }, 100);

    // Fetch initial locations
    fetchLocations();
    setStatus('');

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isLoggedIn, currentUser]); // Added currentUser as dependency

  // Effect to handle map resize when container changes
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    // Trigger initial resize
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Function to fetch and display markers
  const fetchLocations = async () => {
    setStatus('Loading locations...');
    try {
      const data = await api.getLocations();
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
        (data.locations || []).forEach(loc => {
          // Enhanced ownership check with debugging
          console.log('Location:', loc.name);
          console.log('Location createdBy:', loc.createdBy);
          console.log('Current user:', currentUser);
          
          const isOwner = checkOwnership(loc, currentUser);
          console.log('Is owner:', isOwner);
          
          const popupContent = createPopupContent(loc, isOwner);
          
          const marker = L.marker([loc.latitude, loc.longitude])
            .addTo(markersLayerRef.current)
            .bindPopup(popupContent);
          
          // Add event listener for delete button if user is owner
          if (isOwner) {
            marker.on('popupopen', () => {
              const deleteBtn = document.getElementById(`delete-btn-${loc._id}`);
              if (deleteBtn) {
                deleteBtn.addEventListener('click', () => handleDeleteLocation(loc._id, loc.name));
              }
            });
          }
        });
      }
      setStatus(`Loaded ${data.locations ? data.locations.length : 0} locations.`);
    } catch (e) {
      setStatus('Failed to load locations.');
      console.error(e);
    }
  };

  // Enhanced ownership checking function
  const checkOwnership = (location, user) => {
    if (!user || !location.createdBy) {
      console.log('No user or no createdBy field');
      return false;
    }

    // Get the user ID to compare
    const userId = user.id || user._id;
    console.log('User ID:', userId);

    // Handle different formats of createdBy
    let createdById;
    if (typeof location.createdBy === 'string') {
      createdById = location.createdBy;
    } else if (location.createdBy._id) {
      createdById = location.createdBy._id;
    } else if (location.createdBy.id) {
      createdById = location.createdBy.id;
    }
    
    console.log('Created by ID:', createdById);
    
    const isOwner = userId && createdById && (userId === createdById);
    console.log('Ownership comparison result:', isOwner);
    
    return isOwner;
  };

  // Create popup content with conditional delete button
  const createPopupContent = (location, isOwner) => {
    const deleteButton = isOwner ? 
      `<button 
        id="delete-btn-${location._id}" 
        style="
          background: #dc2626; 
          color: white; 
          border: none; 
          padding: 6px 12px; 
          border-radius: 4px; 
          cursor: pointer; 
          font-size: 12px;
          margin-top: 8px;
          width: 100%;
        "
        onmouseover="this.style.background='#b91c1c'"
        onmouseout="this.style.background='#dc2626'"
      >
        🗑️ Delete Location
      </button>` : '';

    const createdByText = location.createdBy?.name ? 
      `<p style="margin: 4px 0; color: #6b7280; font-size: 12px;">Added by: ${location.createdBy.name}</p>` : '';

    // Debug info (remove this in production)
    const debugInfo = isOwner ? 
      `<p style="margin: 4px 0; color: #059669; font-size: 10px; font-style: italic;">✓ You own this location</p>` : 
      `<p style="margin: 4px 0; color: #6b7280; font-size: 10px; font-style: italic;">○ Not your location</p>`;

    return `
      <div style="font-family: system-ui, sans-serif; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">${location.name || 'Firewood Spot'}</h3>
        ${location.description ? `<p style="margin: 4px 0; color: #6b7280; font-size: 14px;">${location.description}</p>` : ''}
        ${location.price ? `<p style="margin: 4px 0; font-weight: 600; color: #059669; font-size: 14px;">${location.price}</p>` : ''}
        ${createdByText}
        ${debugInfo}
        ${deleteButton}
      </div>
    `;
  };

  // Handle location deletion
  const handleDeleteLocation = async (locationId, locationName) => {
    // Confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${locationName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmDelete) return;

    setStatus('Deleting location...');

    try {
      const response = await api.deleteLocation(locationId);
      
      if (response.success) {
        setStatus('Location deleted successfully!');
        
        // Refresh the map to remove the deleted location
        await fetchLocations();
        
        // Clear status after 3 seconds
        setTimeout(() => setStatus(''), 3000);
        
        // Show success message
        alert(`"${locationName}" has been deleted successfully.`);
      }
    } catch (error) {
      console.error('Delete location error:', error);
      setStatus('Failed to delete location.');
      setTimeout(() => setStatus(''), 3000);
      
      // Show error message
      alert(`Failed to delete "${locationName}". ${error.message || 'Please try again.'}`);
    }
  };

  // --- Modal and Form Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = () => {
    if (!isLoggedIn) {
      alert('You must be logged in to add a new location. Please log in and try again.');
      return;
    }
    // Clear form and open modal
    setFormState({ name: '', price: '', description: '', latitude: '', longitude: '' });
    setModalMsg('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalMsg('');
  };

  const handleSubmitLocation = async () => {
    if (!formState.name || !formState.latitude || !formState.longitude) {
      setModalMsg('Please provide a name, latitude, and longitude.');
      return;
    }

    setModalMsg('Saving...');
    try {
      const response = await api.addLocation({
        name: formState.name,
        description: formState.description,
        price: parseFloat(formState.price) || null,
        latitude: parseFloat(formState.latitude),
        longitude: parseFloat(formState.longitude),
      });
      
      if (response.success) {
        setModalMsg('Saved! Refreshing map...');
        setTimeout(async () => {
          handleCloseModal();
          await fetchLocations(); // Refresh markers on map
          setStatus('New location added successfully!');
          setTimeout(() => setStatus(''), 3000);
        }, 1000);
      }
    } catch (e) {
      setModalMsg(`Error: ${e.message || 'Failed to save'}`);
      console.error(e);
    }
  };
  
  // --- Geocoding and Location Search ---
  const handleSearch = async () => {
    const addressInput = document.getElementById('address');
    const address = addressInput?.value?.trim();
    
    if (!address) {
      alert('Please enter an address to search for.');
      return;
    }
    
    setStatus('Searching...');
    
    try {
      // Call your geocoding microservice
      const response = await fetch(`http://localhost:5002/api/geocode?q=${encodeURIComponent(address)}`);
      const data = await response.json();
      
      if (response.ok && data.lat && data.lon) {
        // Center the map on the found location
        if (mapRef.current) {
          mapRef.current.setView([data.lat, data.lon], 14);
          
          // Add a temporary marker to show the search result
          const searchMarker = L.marker([data.lat, data.lon])
            .addTo(mapRef.current)
            .bindPopup(`<b>Search Result</b><br/>${data.label || address}`)
            .openPopup();
          
          // Remove the search marker after 10 seconds
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.removeLayer(searchMarker);
            }
          }, 10000);
        }
        
        setStatus(`Found: ${data.label || address}`);
        
        // Clear the search input
        addressInput.value = '';
        
        // Clear status after 3 seconds
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('No results found for that address.');
        setTimeout(() => setStatus(''), 3000);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setStatus('Search failed. Please try again.');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      // Fallback to IP-based geolocation
      setStatus('Browser geolocation not available, trying IP location...');
      tryIpLocation();
      return;
    }

    setStatus('Locating...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 14);
          // Remove any existing location marker
          mapRef.current.eachLayer((layer) => {
            if (layer.options && layer.options.className === 'current-location') {
              mapRef.current.removeLayer(layer);
            }
          });
          // Add a marker for current location
          L.circle([latitude, longitude], { 
            radius: 100, 
            color: '#2563eb', 
            fillColor: '#3b82f6',
            fillOpacity: 0.3,
            className: 'current-location'
          }).addTo(mapRef.current);
        }
        setStatus('');
      },
      (error) => {
        let errorMsg = 'Unable to retrieve your location.';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location access denied. Trying IP location...';
            tryIpLocation();
            return;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location information unavailable. Trying IP location...';
            tryIpLocation();
            return;
          case error.TIMEOUT:
            errorMsg = 'Location request timed out. Trying IP location...';
            tryIpLocation();
            return;
        }
        setStatus(errorMsg);
        setTimeout(() => setStatus(''), 5000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Fallback IP-based geolocation
  const tryIpLocation = async () => {
    try {
      const response = await fetch('http://localhost:5002/api/me');
      const data = await response.json();
      
      if (response.ok && data.lat && data.lon) {
        if (mapRef.current) {
          mapRef.current.setView([data.lat, data.lon], 10); // Slightly zoomed out for IP location
          
          // Remove any existing location marker
          mapRef.current.eachLayer((layer) => {
            if (layer.options && layer.options.className === 'current-location') {
              mapRef.current.removeLayer(layer);
            }
          });
          
          // Add a larger circle for IP-based location (less precise)
          L.circle([data.lat, data.lon], { 
            radius: 5000, // 5km radius for IP location
            color: '#f59e0b', 
            fillColor: '#fbbf24',
            fillOpacity: 0.2,
            className: 'current-location'
          }).addTo(mapRef.current)
          .bindPopup(`Approximate location: ${data.city || 'Unknown'}, ${data.region || 'Unknown'}`)
          .openPopup();
        }
        setStatus(`Located near: ${data.city || 'Unknown'}, ${data.region || 'Unknown'}`);
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('Unable to determine your location.');
        setTimeout(() => setStatus(''), 3000);
      }
    } catch (error) {
      console.error('IP geolocation error:', error);
      setStatus('Location services unavailable.');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return (
    <div className="map-page-wrapper">
      <Header onNavigate={onNavigate} isLoggedIn={isLoggedIn} currentUser={currentUser} onLogout={onLogout} />
      
      <main className="map-page-main">
        <div id="toolbar">
          <input 
            id="address" 
            placeholder="Search address..." 
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button id="btnSearch" onClick={handleSearch}>Search</button>
          <button id="btnMyLoc" onClick={locateMe}>My Location</button>
          {status && <span id="status">{status}</span>}
        </div>

        <div id="map" ref={mapContainerRef}></div>

        {isLoggedIn && (
          <button id="fabAdd" aria-label="Add Location" onClick={handleOpenModal}>
            ＋
          </button>
        )}

        {isModalOpen && (
          <div id="addModal" onClick={(e) => e.target.id === 'addModal' && handleCloseModal()}>
            <div id="modalCard">
              <h3>Add Firewood Location</h3>
              
              <label>
                Name *
                <input 
                  name="name" 
                  value={formState.name} 
                  onChange={handleInputChange} 
                  placeholder="e.g., Joe's Firewood Stand"
                  required 
                />
              </label>
              
              <label>
                Price (per bundle/cord)
                <input 
                  name="price" 
                  type="number" 
                  step="0.01" 
                  value={formState.price} 
                  onChange={handleInputChange} 
                  placeholder="e.g., 7.50" 
                />
              </label>
              
              <label>
                Description
                <input 
                  name="description" 
                  value={formState.description} 
                  onChange={handleInputChange}
                  placeholder="e.g., Seasoned oak and maple, available 24/7"
                />
              </label>
              
              <div className="coordinate-inputs">
                <label>
                  Latitude *
                  <input 
                    name="latitude" 
                    value={formState.latitude} 
                    onChange={handleInputChange} 
                    placeholder="e.g., 43.366000"
                    required 
                  />
                </label>
                <label>
                  Longitude *
                  <input 
                    name="longitude" 
                    value={formState.longitude} 
                    onChange={handleInputChange} 
                    placeholder="e.g., -124.217000"
                    required 
                  />
                </label>
              </div>
              
              <div className="modal-button-row">
                <button id="cancelBtn" type="button" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button id="submitBtn" type="button" onClick={handleSubmitLocation}>
                  Add Location
                </button>
              </div>
              
              {modalMsg && <p id="modalMsg">{modalMsg}</p>}
            </div>
          </div>
        )}
      </main>
      
      <Footer onNavigate={onNavigate} isLoggedIn={isLoggedIn} onLogout={onLogout} />
    </div>
  );
};

export default MapPage;