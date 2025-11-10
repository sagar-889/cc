const mongoose = require('mongoose');

const timetableEntrySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  room: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['lecture', 'lab', 'tutorial', 'seminar'],
    default: 'lecture'
  }
});

const timetableSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  semester: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  entries: [timetableEntrySchema],
  clashes: [{
    entry1: timetableEntrySchema,
    entry2: timetableEntrySchema,
    detectedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Method to detect clashes
timetableSchema.methods.detectClashes = function() {
  const clashes = [];
  const entries = this.entries;

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      if (entries[i].day === entries[j].day) {
        const start1 = entries[i].startTime;
        const end1 = entries[i].endTime;
        const start2 = entries[j].startTime;
        const end2 = entries[j].endTime;

        // Check for time overlap
        if ((start1 < end2 && end1 > start2)) {
          clashes.push({
            entry1: entries[i],
            entry2: entries[j]
          });
        }
      }
    }
  }

  this.clashes = clashes;
  return clashes;
};

module.exports = mongoose.model('Timetable', timetableSchema);
