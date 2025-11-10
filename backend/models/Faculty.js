const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  office: {
    type: String
  },
  specialization: [{
    type: String
  }],
  qualifications: [{
    type: String
  }],
  officeHours: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  avatar: {
    type: String
  },
  bio: {
    type: String
  },
  publications: [{
    title: String,
    year: Number,
    link: String
  }],
  availableForAppointment: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Faculty', facultySchema);
