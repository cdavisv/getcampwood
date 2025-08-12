import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 5002;
const Nominatim = 'https://nominatim.openstreetmap.org'; // Respect usage policy

app.use(cors());
app.use(morgan('dev'));

// Simple geocode
app.get('/api/geocode', async (req, res) => {
  const q = (req.query.q || '').toString();
  if (!q) return res.status(400).json({ error: 'Missing q parameter' });
  try {
    const url = `${Nominatim}/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'GetCampWood/1.0 (educational demo)' } });
    const arr = await resp.json();
    if (arr && arr[0]) {
      const { lat, lon, display_name } = arr[0];
      return res.json({ lat: parseFloat(lat), lon: parseFloat(lon), label: display_name });
    }
    res.status(404).json({ error: 'No results' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

// Reverse geocode
app.get('/api/reverse', async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return res.status(400).json({ error: 'lat/lon required' });
  try {
    const url = `${Nominatim}/reverse?format=json&lat=${lat}&lon=${lon}`;
    const resp = await fetch(url, { headers: { 'User-Agent': 'GetCampWood/1.0 (educational demo)' } });
    const data = await resp.json();
    res.json({ label: data.display_name || '', lat, lon });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Reverse lookup failed' });
  }
});

// IP-based rough location
app.get('/api/me', async (req, res) => {
  try {
    const url = process.env.IP_GEO_URL || 'https://ipapi.co/json/';
    const resp = await fetch(url);
    const data = await resp.json();
    if (data && data.latitude && data.longitude) {
      return res.json({ lat: data.latitude, lon: data.longitude, city: data.city, region: data.region });
    }
    res.status(404).json({ error: 'No IP location available' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'IP geolocation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Geolocation service running on http://localhost:${PORT}`);
});
