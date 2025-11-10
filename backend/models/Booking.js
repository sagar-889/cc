const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resourceType: {
    type: String,
    enum: ['event', 'material', 'faculty_appointment', 'lab', 'room'],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'resourceType'
  },
  bookingTime: {
    type: Date,
    default: Date.now
  },
  scheduledFor: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  automatedBy: {
    type: String,
    enum: ['user', 'AI'],
    default: 'AI'
  },
  agentType: {
    type: String,
    default: 'booking_agent'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ resourceType: 1, resourceId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
