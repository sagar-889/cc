const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  department: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    default: new Date().getFullYear()
  },
  prerequisites: [{
    type: String
  }],
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  syllabus: {
    type: String
  },
  maxStudents: {
    type: Number,
    default: 60
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
