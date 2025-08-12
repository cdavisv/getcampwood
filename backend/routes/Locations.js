// routes/locations.js
const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Location = require('../models/Location');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/locations
// @desc    Get all active locations (public endpoint)
// @access  Public
router.get('/', [
  query('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  query('radius').optional().isFloat({ min: 1, max: 1000 }).withMessage('Radius must be between 1 and 1000 km'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { lat, lng, radius, limit = 50 } = req.query;
    let query = { status: 'active' };
    let locations;

    console.log('Getting locations with query:', query);

    // If coordinates provided, find nearby locations
    if (lat && lng) {
      const radiusInKm = radius ? parseFloat(radius) : 50;
      locations = await Location.findNearby(parseFloat(lat), parseFloat(lng), radiusInKm)
        .populate('createdBy', 'name email')
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
    } else {
      // Get all active locations
      locations = await Location.find(query)
        .populate('createdBy', 'name email')
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
    }

    console.log('Found locations:', locations.length);
    console.log('Sample location:', locations[0]);

    // Transform the data to ensure consistent format
    const transformedLocations = locations.map(loc => {
      const locationObj = loc.toObject();
      return {
        ...locationObj,
        // Ensure createdBy is properly formatted
        createdBy: locationObj.createdBy ? {
          _id: locationObj.createdBy._id,
          name: locationObj.createdBy.name,
          email: locationObj.createdBy.email
        } : locationObj.createdBy
      };
    });

    console.log('Transformed locations sample:', transformedLocations[0]);

    res.json({
      success: true,
      locations: transformedLocations,
      count: transformedLocations.length
    });

  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching locations'
    });
  }
});

// @route   GET /api/locations/:id
// @desc    Get a specific location by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findOne({ 
      _id: req.params.id, 
      status: 'active' 
    }).populate('createdBy', 'name');

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      location: location.toPublicJSON()
    });

  } catch (error) {
    console.error('Get location error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid location ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching location'
    });
  }
});

// @route   POST /api/locations
// @desc    Create a new location
// @access  Private (requires authentication)
router.post('/', authenticate, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, price, latitude, longitude } = req.body;

    // Check for duplicate locations (same coordinates within 100 meters)
    const existingLocation = await Location.findOne({
      latitude: { $gte: latitude - 0.001, $lte: latitude + 0.001 },
      longitude: { $gte: longitude - 0.001, $lte: longitude + 0.001 },
      status: 'active'
    });

    if (existingLocation) {
      return res.status(400).json({
        success: false,
        message: 'A location already exists very close to these coordinates'
      });
    }

    // Create new location
    const location = new Location({
      name,
      description,
      price: price || null,
      latitude,
      longitude,
      createdBy: req.user._id
    });

    await location.save();

    // Populate the createdBy field for the response
    await location.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      location: location.toPublicJSON()
    });

  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating location'
    });
  }
});

// @route   PUT /api/locations/:id
// @desc    Update a location (only by creator or admin)
// @access  Private
router.put('/:id', authenticate, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // Check if user owns this location or is admin
    if (location.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this location'
      });
    }

    // Update fields
    const updates = ['name', 'description', 'price', 'latitude', 'longitude'];
    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        location[field] = req.body[field];
      }
    });

    await location.save();
    await location.populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Location updated successfully',
      location: location.toPublicJSON()
    });

  } catch (error) {
    console.error('Update location error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid location ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating location'
    });
  }
});

// @route   DELETE /api/locations/:id
// @desc    Delete a location (only by creator or admin)
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    // Check if user owns this location or is admin
    if (location.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this location'
      });
    }

    await Location.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Location deleted successfully'
    });

  } catch (error) {
    console.error('Delete location error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid location ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting location'
    });
  }
});

// @route   GET /api/locations/user/mine
// @desc    Get current user's locations
// @access  Private
router.get('/user/mine', authenticate, async (req, res) => {
  try {
    const locations = await Location.find({ createdBy: req.user._id })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      locations: locations.map(loc => loc.toPublicJSON()),
      count: locations.length
    });

  } catch (error) {
    console.error('Get user locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your locations'
    });
  }
});

module.exports = router;