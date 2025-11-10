const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['assignment', 'project', 'exam', 'quiz', 'presentation', 'lab', 'other'],
    default: 'assignment'
  },
  dueDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'overdue'],
    default: 'pending'
  },
  estimatedHours: {
    type: Number,
    default: 0
  },
  actualHours: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String
  }],
  attachments: [{
    name: String,
    url: String,
    uploadedAt: Date
  }],
  studyPlan: {
    generated: {
      type: Boolean,
      default: false
    },
    tasks: [{
      taskName: String,
      description: String,
      estimatedTime: String,
      deadline: Date,
      completed: {
        type: Boolean,
        default: false
      }
    }]
  },
  reminders: [{
    reminderDate: Date,
    sent: {
      type: Boolean,
      default: false
    },
    message: String
  }],
  completedAt: {
    type: Date
  },
  grade: {
    type: String
  },
  feedback: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
assignmentSchema.index({ userId: 1, status: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ userId: 1, dueDate: 1 });

// Virtual for checking if overdue
assignmentSchema.virtual('isOverdue').get(function() {
  return this.status !== 'completed' && new Date() > this.dueDate;
});

// Update status to overdue automatically
assignmentSchema.pre('save', function(next) {
  if (this.status !== 'completed' && new Date() > this.dueDate) {
    this.status = 'overdue';
  }
  next();
});

module.exports = mongoose.model('Assignment', assignmentSchema);
