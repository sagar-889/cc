const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['timetable', 'courses', 'materials', 'events', 'faculty', 'exams', 'finance', 'technical', 'general'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending'
  },
  response: {
    type: String
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
questionSchema.index({ status: 1, createdAt: -1 });
questionSchema.index({ category: 1 });
questionSchema.index({ priority: 1 });
questionSchema.index({ studentEmail: 1 });

module.exports = mongoose.model('Question', questionSchema);
