import mongoose from 'mongoose';

const FirewoodLocationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  addedBy: { type: String }, // user id or email
}, { timestamps: true });

export default mongoose.model('FirewoodLocation', FirewoodLocationSchema);
