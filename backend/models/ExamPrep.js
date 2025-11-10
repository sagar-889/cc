const mongoose = require('mongoose');

const examPrepSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  examName: {
    type: String,
    required: true,
    trim: true
  },
  examDate: {
    type: Date,
    required: true
  },
  syllabus: [{
    topic: String,
    subtopics: [String],
    completed: {
      type: Boolean,
      default: false
    },
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    }
  }],
  preparationPlan: {
    generated: {
      type: Boolean,
      default: false
    },
    totalWeeks: Number,
    phases: [{
      phaseName: String,
      duration: String,
      description: String,
      tasks: [{
        taskName: String,
        description: String,
        deadline: Date,
        completed: {
          type: Boolean,
          default: false
        }
      }]
    }]
  },
  studyMaterials: [{
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    },
    materialName: String,
    materialType: String,
    relevance: String
  }],
  practiceTests: [{
    testName: String,
    scheduledDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    score: Number,
    totalMarks: Number,
    weakAreas: [String]
  }],
  flashcards: [{
    question: String,
    answer: String,
    topic: String,
    mastered: {
      type: Boolean,
      default: false
    }
  }],
  progress: {
    overallProgress: {
      type: Number,
      default: 0
    },
    topicsCompleted: {
      type: Number,
      default: 0
    },
    totalTopics: {
      type: Number,
      default: 0
    },
    studyHours: {
      type: Number,
      default: 0
    },
    lastStudied: Date
  },
  status: {
    type: String,
    enum: ['planning', 'in_progress', 'completed'],
    default: 'planning'
  }
}, {
  timestamps: true
});

// Index for efficient queries
examPrepSchema.index({ userId: 1, examDate: 1 });
examPrepSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('ExamPrep', examPrepSchema);
