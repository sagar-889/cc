const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['workshop', 'seminar', 'hackathon', 'fest', 'club', 'sports', 'cultural', 'other'],
    required: true
  },
  organizer: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  venue: {
    type: String
  },
  registrationRequired: {
    type: Boolean,
    default: false
  },
  registrationLink: {
    type: String
  },
  maxParticipants: {
    type: Number
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String
  }],
  poster: {
    type: String
  },
  contactEmail: {
    type: String
  },
  contactPhone: {
    type: String
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
