const mongoose = require('mongoose');

const AgenticPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  planType: {
    type: String,
    enum: ['study', 'career', 'exam', 'learning', 'assignment'],
    required: true
  },
  goal: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['analyzing', 'planning', 'executing', 'monitoring', 'completed', 'failed'],
    default: 'analyzing'
  },
  
  // PHASE 1: Analysis
  analysis: {
    userContext: {
      courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
      department: String,
      year: Number,
      semester: Number,
      currentGPA: Number
    },
    identifiedGaps: [String],
    strengths: [String],
    recommendations: [String],
    estimatedDuration: String,
    estimatedHours: Number,
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert']
    },
    aiReasoning: String,
    analyzedAt: Date
  },
  
  // PHASE 2: Planning
  plan: {
    phases: [{
      name: String,
      order: Number,
      duration: String,
      startDate: Date,
      endDate: Date,
      tasks: [{
        title: String,
        description: String,
        type: String, // 'study', 'practice', 'assignment', 'test', 'review'
        estimatedHours: Number,
        deadline: Date,
        status: {
          type: String,
          enum: ['pending', 'in-progress', 'completed', 'skipped'],
          default: 'pending'
        },
        priority: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical'],
          default: 'medium'
        },
        aiGenerated: { type: Boolean, default: true },
        completedAt: Date
      }]
    }],
    timeline: String,
    milestones: [{
      name: String,
      targetDate: Date,
      achieved: { type: Boolean, default: false },
      achievedAt: Date
    }],
    resources: [{
      type: String, // 'material', 'course', 'video', 'article', 'book'
      title: String,
      link: String,
      materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
      aiRecommended: { type: Boolean, default: true },
      relevanceScore: Number, // 0-100
      reason: String
    }],
    plannedAt: Date
  },
  
  // PHASE 3: Execution
  execution: {
    currentPhase: { type: Number, default: 0 },
    currentTask: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    progress: { type: Number, default: 0, min: 0, max: 100 }, // Overall progress %
    phaseProgress: { type: Number, default: 0, min: 0, max: 100 }, // Current phase progress
    startedAt: Date,
    lastActionAt: Date,
    estimatedCompletionDate: Date,
    actualCompletionDate: Date,
    
    // Actions performed by agent
    actionsPerformed: [{
      action: String, // 'registered_event', 'found_materials', 'created_test', 'sent_reminder'
      description: String,
      timestamp: Date,
      success: Boolean,
      details: mongoose.Schema.Types.Mixed
    }],
    
    // Reminders scheduled
    reminders: [{
      type: String, // 'daily', 'task', 'milestone', 'deadline'
      title: String,
      message: String,
      scheduledFor: Date,
      sent: { type: Boolean, default: false },
      sentAt: Date
    }],
    
    // Tests generated
    testsGenerated: [{
      topic: String,
      questionCount: Number,
      testId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgenticTest' },
      scheduledFor: Date,
      completed: { type: Boolean, default: false },
      score: Number
    }]
  },
  
  // PHASE 4: Learning & Adaptation
  learning: {
    adjustmentsMade: [{
      reason: String,
      adjustment: String,
      timestamp: Date
    }],
    userFeedback: [{
      rating: Number, // 1-5
      comment: String,
      timestamp: Date
    }],
    successRate: { type: Number, default: 0 }, // % of tasks completed on time
    averageCompletionTime: Number, // In hours
    engagementScore: Number, // 0-100
    adaptations: [{
      from: String,
      to: String,
      reason: String,
      timestamp: Date
    }]
  },
  
  // Metadata
  isActive: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },
  tags: [String],
  notes: String
  
}, { timestamps: true });

// Indexes for performance
AgenticPlanSchema.index({ userId: 1, status: 1 });
AgenticPlanSchema.index({ userId: 1, planType: 1 });
AgenticPlanSchema.index({ 'execution.estimatedCompletionDate': 1 });

// Virtual for progress calculation
AgenticPlanSchema.virtual('overallProgress').get(function() {
  if (this.execution.totalTasks === 0) return 0;
  return Math.round((this.execution.tasksCompleted / this.execution.totalTasks) * 100);
});

// Method to update progress
AgenticPlanSchema.methods.updateProgress = function() {
  const totalTasks = this.plan.phases.reduce((sum, phase) => 
    sum + phase.tasks.length, 0
  );
  const completedTasks = this.plan.phases.reduce((sum, phase) => 
    sum + phase.tasks.filter(t => t.status === 'completed').length, 0
  );
  
  this.execution.totalTasks = totalTasks;
  this.execution.tasksCompleted = completedTasks;
  this.execution.progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  this.execution.lastActionAt = new Date();
  
  // Check if completed
  if (this.execution.progress === 100) {
    this.status = 'completed';
    this.execution.actualCompletionDate = new Date();
  }
};

// Method to add action
AgenticPlanSchema.methods.logAction = function(action, description, success = true, details = {}) {
  this.execution.actionsPerformed.push({
    action,
    description,
    timestamp: new Date(),
    success,
    details
  });
  this.execution.lastActionAt = new Date();
};

// Method to schedule reminder
AgenticPlanSchema.methods.scheduleReminder = function(type, title, message, scheduledFor) {
  this.execution.reminders.push({
    type,
    title,
    message,
    scheduledFor,
    sent: false
  });
};

module.exports = mongoose.model('AgenticPlan', AgenticPlanSchema);
