const mongoose = require('mongoose');

const navigationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['building', 'lab', 'classroom', 'office', 'facility', 'landmark'],
    required: true
  },
  block: {
    type: String,
    required: true
  },
  floor: {
    type: Number
  },
  roomNumber: {
    type: String
  },
  description: {
    type: String
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  department: {
    type: String
  },
  facilities: [{
    type: String
  }],
  images: [{
    type: String
  }],
  openingHours: {
    weekdays: String,
    weekends: String
  },
  isAccessible: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String
  }],
  googleMapsUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Index for geospatial queries
navigationSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Navigation', navigationSchema);
