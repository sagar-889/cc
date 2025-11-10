const mongoose = require('mongoose');

const AgenticNotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AgenticPlan'
  },
  
  // Notification details
  type: {
    type: String,
    enum: ['reminder', 'deadline', 'achievement', 'adjustment', 'recommendation', 'test', 'material'],
    required: true
  },
  category: {
    type: String,
    enum: ['study', 'assignment', 'exam', 'event', 'general', 'agent']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  title: {
    type: String,
    required: true
  },
  message: String,
  description: String,
  
  // Scheduling
  scheduledFor: {
    type: Date,
    required: true,
    index: true
  },
  sent: {
    type: Boolean,
    default: false,
    index: true
  },
  sentAt: Date,
  
  // Delivery channels
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  },
  
  // Delivery status
  delivery: {
    inAppDelivered: { type: Boolean, default: false },
    inAppDeliveredAt: Date,
    emailDelivered: { type: Boolean, default: false },
    emailDeliveredAt: Date,
    pushDelivered: { type: Boolean, default: false },
    pushDeliveredAt: Date
  },
  
  // User interaction
  read: { type: Boolean, default: false },
  readAt: Date,
  clicked: { type: Boolean, default: false },
  clickedAt: Date,
  dismissed: { type: Boolean, default: false },
  dismissedAt: Date,
  
  // Action required
  actionRequired: { type: Boolean, default: false },
  actionType: String, // 'view_plan', 'take_test', 'submit_assignment', 'review_material'
  actionLink: String,
  actionCompleted: { type: Boolean, default: false },
  actionCompletedAt: Date,
  
  // AI-generated
  aiGenerated: { type: Boolean, default: true },
  aiReason: String, // Why the agent sent this notification
  
  // Metadata
  metadata: mongoose.Schema.Types.Mixed, // Additional data
  
  // Recurring notifications
  isRecurring: { type: Boolean, default: false },
  recurrence: {
    frequency: String, // 'daily', 'weekly', 'monthly'
    interval: Number, // Every X days/weeks/months
    endDate: Date,
    nextScheduledDate: Date
  },
  
  // Expiry
  expiresAt: Date,
  isExpired: { type: Boolean, default: false }
  
}, { timestamps: true });

// Indexes for efficient querying
AgenticNotificationSchema.index({ userId: 1, sent: 1, scheduledFor: 1 });
AgenticNotificationSchema.index({ userId: 1, read: 1 });
AgenticNotificationSchema.index({ scheduledFor: 1, sent: 1 });
AgenticNotificationSchema.index({ expiresAt: 1 });

// Virtual for status
AgenticNotificationSchema.virtual('status').get(function() {
  if (this.dismissed) return 'dismissed';
  if (this.actionCompleted) return 'completed';
  if (this.read) return 'read';
  if (this.sent) return 'sent';
  if (this.scheduledFor > new Date()) return 'scheduled';
  return 'pending';
});

// Method to mark as sent
AgenticNotificationSchema.methods.markAsSent = function(channel = 'inApp') {
  this.sent = true;
  this.sentAt = new Date();
  
  if (channel === 'inApp') {
    this.delivery.inAppDelivered = true;
    this.delivery.inAppDeliveredAt = new Date();
  } else if (channel === 'email') {
    this.delivery.emailDelivered = true;
    this.delivery.emailDeliveredAt = new Date();
  } else if (channel === 'push') {
    this.delivery.pushDelivered = true;
    this.delivery.pushDeliveredAt = new Date();
  }
};

// Method to mark as read
AgenticNotificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
};

// Method to mark action completed
AgenticNotificationSchema.methods.completeAction = function() {
  this.actionCompleted = true;
  this.actionCompletedAt = new Date();
};

// Static method to get pending notifications
AgenticNotificationSchema.statics.getPendingNotifications = function() {
  return this.find({
    sent: false,
    scheduledFor: { $lte: new Date() },
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ scheduledFor: 1, priority: -1 });
};

// Static method to get user notifications
AgenticNotificationSchema.statics.getUserNotifications = function(userId, options = {}) {
  const query = { userId };
  
  if (options.unreadOnly) {
    query.read = false;
  }
  
  if (options.type) {
    query.type = options.type;
  }
  
  return this.find(query)
    .sort({ scheduledFor: -1, createdAt: -1 })
    .limit(options.limit || 50);
};

// Pre-save hook to check expiry
AgenticNotificationSchema.pre('save', function(next) {
  if (this.expiresAt && this.expiresAt <= new Date()) {
    this.isExpired = true;
  }
  next();
});

module.exports = mongoose.model('AgenticNotification', AgenticNotificationSchema);
