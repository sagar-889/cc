const express = require('express');
const router = express.Router();
const Navigation = require('../models/Navigation');
const { auth } = require('../middleware/auth');

// Get all locations (public access)
router.get('/', async (req, res) => {
  try {
    const { type, block, search } = req.query;
    
    let query = {};
    if (type) query.type = type;
    if (block) query.block = block;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { block: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const locations = await Navigation.find(query).sort({ name: 1 });

    res.json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch locations',
      error: error.message
    });
  }
});

// Get single location
router.get('/:id', auth, async (req, res) => {
  try {
    const location = await Navigation.findById(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location',
      error: error.message
    });
  }
});

// Search nearby locations
router.get('/nearby/:lat/:lng', auth, async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const maxDistance = req.query.distance || 1000; // meters

    const locations = await Navigation.find({
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).limit(10);

    res.json({
      success: true,
      count: locations.length,
      locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to find nearby locations',
      error: error.message
    });
  }
});

// Create new location (Admin/Faculty only)
router.post('/', auth, async (req, res) => {
  try {
    const location = new Navigation(req.body);
    await location.save();

    res.status(201).json({
      success: true,
      message: 'Location created successfully',
      location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create location',
      error: error.message
    });
  }
});

// Update location (Admin/Faculty only)
router.put('/:id', auth, async (req, res) => {
  try {
    const location = await Navigation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
});

// Delete location (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const location = await Navigation.findByIdAndDelete(req.params.id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete location',
      error: error.message
    });
  }
});

module.exports = router;
