const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isAccepted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const helpdeskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  askedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['academic', 'technical', 'administrative', 'general'],
    required: true
  },
  tags: [{
    type: String
  }],
  answers: [answerSchema],
  views: {
    type: Number,
    default: 0
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['open', 'answered', 'closed'],
    default: 'open'
  },
  relatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Helpdesk', helpdeskSchema);
