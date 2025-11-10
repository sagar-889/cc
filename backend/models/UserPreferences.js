const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Event preferences
  eventPreferences: {
    autoRegister: {
      type: Boolean,
      default: false
    },
    categories: [{
      type: String
    }],
    maxDistance: {
      type: Number,
      default: 10 // km
    },
    preferredDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    avoidDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }]
  },

  // Schedule preferences
  schedulePreferences: {
    preferredStartTime: {
      type: String,
      default: '09:00'
    },
    preferredEndTime: {
      type: String,
      default: '17:00'
    },
    avoidEarlyMorning: {
      type: Boolean,
      default: false
    },
    avoidLateEvening: {
      type: Boolean,
      default: false
    },
    minimizeGaps: {
      type: Boolean,
      default: true
    },
    preferredBreakDuration: {
      type: Number,
      default: 60 // minutes
    }
  },

  // Study preferences
  studyPreferences: {
    studyStyle: {
      type: String,
      enum: ['visual', 'auditory', 'reading', 'kinesthetic', 'mixed'],
      default: 'mixed'
    },
    preferredStudyTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night'],
      default: 'afternoon'
    },
    sessionDuration: {
      type: Number,
      default: 50 // minutes
    },
    breakDuration: {
      type: Number,
      default: 10 // minutes
    },
    dailyStudyHours: {
      type: Number,
      default: 4
    }
  },

  // Material preferences
  materialPreferences: {
    autoDownload: {
      type: Boolean,
      default: false
    },
    preferredFormats: [{
      type: String,
      enum: ['pdf', 'doc', 'ppt', 'video', 'audio']
    }],
    autoOrganize: {
      type: Boolean,
      default: true
    }
  },

  // Notification preferences
  notificationPreferences: {
    enableReminders: {
      type: Boolean,
      default: true
    },
    reminderAdvance: {
      type: Number,
      default: 24 // hours before deadline
    },
    dailyDigest: {
      type: Boolean,
      default: true
    },
    digestTime: {
      type: String,
      default: '08:00'
    },
    enablePushNotifications: {
      type: Boolean,
      default: true
    }
  },

  // AI automation preferences
  automationPreferences: {
    enableAgenticAI: {
      type: Boolean,
      default: true
    },
    autoCreateStudyPlans: {
      type: Boolean,
      default: true
    },
    autoScheduleTasks: {
      type: Boolean,
      default: true
    },
    autoFindMaterials: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);
