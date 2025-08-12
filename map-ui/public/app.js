(function(){
  const statusEl = document.getElementById('status');
  const setStatus = (msg) => statusEl.textContent = msg || '';
  const GEO = (window.CONFIG && window.CONFIG.GEO_URL) || 'http://localhost:5002/api';
  const LOC = (window.CONFIG && window.CONFIG.LOC_URL) || 'http://localhost:5001/api';

  const map = L.map('map').setView([43.366, -124.217], 11); // default center
  // Use local tile proxy so CSP 'self' is satisfied
  L.tileLayer('/tiles/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const markersLayer = L.layerGroup().addTo(map);

  // Click on map to prefill lat/lon (and open modal if logged in)
  map.on('click', (e) => {
    try {
      const { lat, lng } = e.latlng;
      const latEl = document.getElementById('latInput');
      const lonEl = document.getElementById('lonInput');
      if (latEl && lonEl) {
        latEl.value = lat.toFixed(6);
        lonEl.value = lng.toFixed(6);
      }
      const t = getToken(); // Use the new getToken function
      if (t) {
        const modal = document.getElementById('addModal');
        if (modal && modal.hasAttribute('hidden')) modal.removeAttribute('hidden');
      }
    } catch {}
  });

  async function fetchLocations() {
    try {
      const res = await fetch(`${LOC}/locations`);
      const data = await res.json();
      markersLayer.clearLayers();
      (data.locations || []).forEach(loc => {
        const m = L.marker([loc.latitude, loc.longitude]).addTo(markersLayer);
        m.bindPopup(`<b>${loc.name || 'Firewood Spot'}</b><br/>${loc.description || ''}`);
      });
      setStatus(`Loaded ${data.locations ? data.locations.length : 0} locations.`);
    } catch (e) {
      setStatus('Failed to load locations.');
      console.error(e);
    }
  }

  async function geocode(q){
    const res = await fetch(`${GEO}/geocode?q=${encodeURIComponent(q)}`);
    if(!res.ok) throw new Error('Geocode failed');
    return res.json();
  }

  async function locateMe(){
    try {
      setStatus('Locating...');
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 14);
          L.circle([latitude, longitude], { radius: 25 }).addTo(map);
          setStatus('');
        }, async () => {
          const res = await fetch(`${GEO}/me`);
          const data = await res.json();
          if (data && data.lat && data.lon) {
            map.setView([data.lat, data.lon], 13);
            setStatus('');
          } else {
            setStatus('Unable to determine your location.');
          }
        });
      } else {
        const res = await fetch(`${GEO}/me`);
        const data = await res.json();
        if (data && data.lat && data.lon) {
          map.setView([data.lat, data.lon], 13);
          setStatus('');
        }
      }
    } catch(e){
      console.error(e);
      setStatus('Location lookup failed.');
    }
  }

  document.getElementById('btnSearch').addEventListener('click', async () => {
    const q = document.getElementById('address').value.trim();
    if (!q) return;
    setStatus('Searching...');
    try {
      const result = await geocode(q);
      if (result && result.lat && result.lon) {
        map.setView([result.lat, result.lon], 13);
        setStatus('');
      } else {
        setStatus('No result.');
      }
    } catch(e){
      console.error(e);
      setStatus('Search failed.');
    }
  });

  document.getElementById('btnMyLoc').addEventListener('click', locateMe);
  
  // This function now reads from localStorage, the same source as the main app.
  function getToken() {
    try { return localStorage.getItem('authToken'); } catch { return null; }
  }

  // --- Add Location modal wiring ---
  const fab = document.getElementById('fabAdd');
  const updateFab = () => {
    const t = getToken();
    if (!fab) return;
    if (t) {
      fab.removeAttribute('hidden');
      fab.style.display = 'inline-flex';
      fab.title = 'Add a new firewood location';
    } else {
      fab.setAttribute('hidden','');
      fab.style.display = 'none';
      fab.title = 'Log in via the main app then click View Map';
    }
  };
  
  // Run on load and when storage changes in another tab
  updateFab();
  window.addEventListener('storage', (e) => { 
    if (e.key === 'authToken') updateFab(); 
  });

  const modal = document.getElementById('addModal');
  const nameInput = document.getElementById('nameInput');
  const priceInput = document.getElementById('priceInput');
  const descInput = document.getElementById('descInput');
  const latInput = document.getElementById('latInput');
  const lonInput = document.getElementById('lonInput');
  const cancelBtn = document.getElementById('cancelBtn');
  const submitBtn = document.getElementById('submitBtn');
  const modalMsg = document.getElementById('modalMsg');

  function openModal() {
    const token = getToken();
    if (!token) {
      alert('You must be logged in. Open the map from the main app so it can pass your login token.');
      return;
    }
    modal.removeAttribute('hidden');
  }
  function closeModal() {
    modal.setAttribute('hidden', '');
    modalMsg.textContent = '';
  }

  fab.addEventListener('click', openModal);
  cancelBtn.addEventListener('click', closeModal);

  submitBtn.addEventListener('click', async () => {
    const token = getToken();
    if (!token) { alert('Missing login token'); return; }
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value) || null;
    const description = descInput.value.trim();
    const latitude = parseFloat(latInput.value);
    const longitude = parseFloat(lonInput.value);
    if (!name || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      modalMsg.textContent = 'Please enter a name, latitude, and longitude.';
      return;
    }
    try {
      modalMsg.textContent = 'Saving...';
      const res = await fetch(`${LOC}/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, price, latitude, longitude })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Request failed');
      }
      modalMsg.textContent = 'Saved! Refreshing markers...';
      closeModal();
      await fetchLocations();
    } catch (e) {
      console.error(e);
      modalMsg.textContent = 'Error: ' + (e.message || 'Failed to save');
    }
  });

  // initial data
  fetchLocations();
})();