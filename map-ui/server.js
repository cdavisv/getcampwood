import express from 'express';
import path from 'path';
import helmet from 'helmet';
import morgan from 'morgan';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5174;

// CSP: allow inline styles for our <style> block and allow API calls to 5001/5002
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:"],
      "connect-src": ["'self'", "http://localhost:5001", "http://localhost:5002"],
      "font-src": ["'self'"],
      "object-src": ["'none'"]
    }
  }
}));
app.use(morgan('dev'));

// Expose config to front-end JS
app.get('/config.js', (req, res) => {
  const cfg = {
    GEO_URL: process.env.GEO_URL || 'http://localhost:5002/api',
    LOC_URL: process.env.LOC_URL || 'http://localhost:5001/api',
  };
  res.type('application/javascript').send(`window.CONFIG = ${JSON.stringify(cfg)};`);
});

// Serve Leaflet from node_modules (CSP-safe, same-origin)
app.use('/vendor/leaflet', express.static(path.join(__dirname, 'node_modules', 'leaflet', 'dist')));

// Dev proxy for OSM tiles (so tiles are also same-origin)
app.get('/tiles/:z/:x/:y.png', async (req, res) => {
  const { z, x, y } = req.params;
  const upstream = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  try {
    const r = await fetch(upstream, { headers: { 'User-Agent': 'GetCampWood/1.0 demo' }});
    if (!r.ok) return res.sendStatus(r.status);
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    r.body.pipe(res);
  } catch {
    res.sendStatus(502);
  }
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Map UI service running on http://localhost:${PORT}`);
});
