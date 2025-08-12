// models/Location.js
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Location name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    default: null
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },
  // Who created this location
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Status for moderation
  status: {
    type: String,
    enum: ['active', 'pending', 'rejected'],
    default: 'active'
  },
  // Additional metadata
  verified: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Index for geospatial queries (for future map-based searches)
locationSchema.index({ latitude: 1, longitude: 1 });

// Index for text search
locationSchema.index({ name: 'text', description: 'text' });

// Instance method to get location data with user info
locationSchema.methods.toPublicJSON = function() {
  const location = this.toObject();
  return location;
};

// Static method to find locations within a radius (for future use)
locationSchema.statics.findNearby = function(lat, lng, radiusInKm = 50) {
  const radiusInRadians = radiusInKm / 6371; // Earth's radius in km
  
  return this.find({
    latitude: {
      $gte: lat - radiusInRadians,
      $lte: lat + radiusInRadians
    },
    longitude: {
      $gte: lng - radiusInRadians,
      $lte: lng + radiusInRadians
    },
    status: 'active'
  });
};

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;