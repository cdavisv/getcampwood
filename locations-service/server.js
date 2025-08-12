import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FirewoodLocation from './models/FirewoodLocation.js';
import { authenticate } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const DB_NAME = process.env.MONGODB_DB || 'getcampwood';


app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI).then(() => {
  console.log('Mongo connected for locations service');
}).catch(err => {
  console.error('Mongo connection error:', err.message);
  process.exit(1);
});

app.get('/api/health', (req, res) => res.json({ success:true, service:'locations', time:new Date().toISOString() }));

// Public: list all locations
app.get('/api/locations', async (req, res) => {
  const items = await FirewoodLocation.find().sort({ createdAt: -1 }).lean();
  res.json({ success: true, locations: items });
});

// Public: get single
app.get('/api/locations/:id', async (req, res) => {
  try {
    const item = await FirewoodLocation.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, location: item });
  } catch (e) {
    res.status(400).json({ success:false, message:'Invalid id' });
  }
});

// Create (auth required)
app.post('/api/locations', authenticate, async (req, res) => {
  const { name, description, latitude, longitude } = req.body || {};
  if (!name || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ success:false, message:'name, latitude, longitude required' });
  }
  try {
    const item = await FirewoodLocation.create({
      name, description, latitude, longitude, addedBy: req.user.email || req.user.id
    });
    res.status(201).json({ success:true, location: item });
  } catch (e) {
    res.status(400).json({ success:false, message: e.message });
  }
});

// Update (only owner or admin - minimal check)
app.put('/api/locations/:id', authenticate, async (req, res) => {
  try {
    const item = await FirewoodLocation.findById(req.params.id);
    if (!item) return res.status(404).json({ success:false, message:'Not found' });
    const isOwner = (item.addedBy && (item.addedBy === req.user.email || item.addedBy === req.user.id));
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success:false, message:'Forbidden' });

    const { name, description, latitude, longitude } = req.body || {};
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (latitude !== undefined) item.latitude = latitude;
    if (longitude !== undefined) item.longitude = longitude;
    await item.save();
    res.json({ success:true, location: item });
  } catch (e) {
    res.status(400).json({ success:false, message:'Invalid id' });
  }
});

// Delete (only owner or admin)
app.delete('/api/locations/:id', authenticate, async (req, res) => {
  try {
    const item = await FirewoodLocation.findById(req.params.id);
    if (!item) return res.status(404).json({ success:false, message:'Not found' });
    const isOwner = (item.addedBy && (item.addedBy === req.user.email || item.addedBy === req.user.id));
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success:false, message:'Forbidden' });
    await item.deleteOne();
    res.json({ success:true, message:'Deleted' });
  } catch (e) {
    res.status(400).json({ success:false, message:'Invalid id' });
  }
});

app.listen(PORT, () => {
  console.log(`Locations service running on http://localhost:${PORT}`);
});
