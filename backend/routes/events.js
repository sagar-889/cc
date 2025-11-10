const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');
const { isAdminOrFaculty } = require('../middleware/checkRole');

// Get all events with optional authentication for registration status
router.get('/', async (req, res) => {
  try {
    const { type, status, search } = req.query;

    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .populate('participants', 'name email');

    // Add registration status if user is authenticated (check for Authorization header)
    let eventsWithStatus = events;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;
        
        eventsWithStatus = events.map(event => ({
          ...event.toObject(),
          isRegistered: event.participants.some(p => p._id.toString() === userId.toString()),
          participantCount: event.participants.length
        }));
      } catch (error) {
        // If token is invalid, just return events without registration status
        eventsWithStatus = events.map(event => ({
          ...event.toObject(),
          participantCount: event.participants.length
        }));
      }
    } else {
      eventsWithStatus = events.map(event => ({
        ...event.toObject(),
        participantCount: event.participants.length
      }));
    }

    res.json({
      success: true,
      count: events.length,
      events: eventsWithStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
});

// Create new event (All authenticated users can create events)
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      category,
      maxParticipants,
      registrationDeadline,
      organizer,
      contactEmail,
      contactPhone,
      imageUrl,
      tags
    } = req.body;

    // Validate required fields
    const requiredFields = { title, description, date, location, organizer, contactEmail };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || value.trim() === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid contact email address'
      });
    }

    // Validate date is not in the past
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Event date cannot be in the past'
      });
    }

    // Combine date and time for startDate
    let startDate;
    try {
      startDate = time ? new Date(`${date}T${time}`) : new Date(date);
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date or time format'
      });
    }

    const event = new Event({
      title,
      description,
      startDate,
      endDate: startDate, // Can be extended if needed
      location,
      type: category || 'other',
      organizer: organizer || req.user?.name || 'Admin',
      contactEmail: contactEmail || req.user?.email,
      contactPhone,
      imageUrl,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : startDate,
      tags: Array.isArray(tags) ? tags : [],
      createdBy: req.userId
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
});

// Get single event
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('participants', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if current user is registered
    const isRegistered = event.participants.some(p => p._id.toString() === req.userId.toString());

    res.json({
      success: true,
      event,
      isRegistered,
      participantCount: event.participants.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
});

// Register for event
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (event.participants.includes(req.userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this event'
      });
    }

    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full'
      });
    }

    event.participants.push(req.userId);
    await event.save();

    // Populate the updated event with participant details
    await event.populate('participants', 'name email');

    res.json({
      success: true,
      message: 'Successfully registered for event',
      event,
      isRegistered: true,
      participantCount: event.participants.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register',
      error: error.message
    });
  }
});

// Unregister from event
router.post('/:id/unregister', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.participants = event.participants.filter(
      id => id.toString() !== req.userId.toString()
    );

    await event.save();

    res.json({
      success: true,
      message: 'Successfully unregistered from event',
      event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to unregister',
      error: error.message
    });
  }
});

// Get recommended events
router.get('/recommend/me', auth, async (req, res) => {
  try {
    const user = req.user;
    const userInterests = user.interests || [];

    const events = await Event.find({
      status: 'upcoming',
      tags: { $in: userInterests }
    }).limit(5);

    res.json({
      success: true,
      events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

module.exports = router;
