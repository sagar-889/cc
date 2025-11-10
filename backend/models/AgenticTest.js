const mongoose = require('mongoose');

const AgenticTestSchema = new mongoose.Schema({
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
  examPrepId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamPrep'
  },
  
  // Test details
  title: {
    type: String,
    required: true
  },
  topic: String,
  subject: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'medium'
  },
  duration: Number, // in minutes
  totalMarks: Number,
  
  // AI-generated questions
  questions: [{
    questionNumber: Number,
    questionType: {
      type: String,
      enum: ['mcq', 'true-false', 'short-answer', 'essay', 'coding'],
      default: 'mcq'
    },
    question: String,
    options: [String], // For MCQ
    correctAnswer: String,
    correctAnswers: [String], // For multiple correct answers
    explanation: String,
    marks: Number,
    difficulty: String,
    topic: String,
    aiGenerated: { type: Boolean, default: true },
    
    // User's answer
    userAnswer: String,
    userAnswers: [String],
    isCorrect: Boolean,
    marksObtained: Number,
    timeSpent: Number // seconds
  }],
  
  // Test status
  status: {
    type: String,
    enum: ['generated', 'in-progress', 'completed', 'reviewed'],
    default: 'generated'
  },
  
  // Results
  results: {
    score: Number, // Percentage
    marksObtained: Number,
    totalMarks: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    wrongAnswers: Number,
    skippedAnswers: Number,
    timeTaken: Number, // minutes
    
    // Topic-wise analysis
    topicAnalysis: [{
      topic: String,
      totalQuestions: Number,
      correctAnswers: Number,
      accuracy: Number // percentage
    }],
    
    // Difficulty-wise analysis
    difficultyAnalysis: [{
      difficulty: String,
      totalQuestions: Number,
      correctAnswers: Number,
      accuracy: Number
    }],
    
    // AI feedback
    aiFeedback: {
      strengths: [String],
      weaknesses: [String],
      recommendations: [String],
      nextSteps: [String]
    },
    
    completedAt: Date
  },
  
  // Scheduling
  scheduledFor: Date,
  startedAt: Date,
  submittedAt: Date,
  
  // AI generation metadata
  aiMetadata: {
    model: String, // 'gemini-pro', 'gpt-4', etc.
    prompt: String,
    generatedAt: Date,
    generationTime: Number // milliseconds
  },
  
  // Analytics
  attempts: { type: Number, default: 0 },
  bestScore: Number,
  averageScore: Number,
  
  tags: [String],
  notes: String
  
}, { timestamps: true });

// Indexes
AgenticTestSchema.index({ userId: 1, status: 1 });
AgenticTestSchema.index({ userId: 1, subject: 1 });
AgenticTestSchema.index({ scheduledFor: 1 });

// Method to calculate results
AgenticTestSchema.methods.calculateResults = function() {
  const totalQuestions = this.questions.length;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let skippedAnswers = 0;
  let marksObtained = 0;
  
  this.questions.forEach(q => {
    if (!q.userAnswer && !q.userAnswers) {
      skippedAnswers++;
    } else if (q.isCorrect) {
      correctAnswers++;
      marksObtained += q.marksObtained || q.marks || 1;
    } else {
      wrongAnswers++;
    }
  });
  
  const totalMarks = this.totalMarks || this.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  const score = totalMarks > 0 ? Math.round((marksObtained / totalMarks) * 100) : 0;
  
  this.results = {
    score,
    marksObtained,
    totalMarks,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    skippedAnswers,
    completedAt: new Date()
  };
  
  this.status = 'completed';
  this.submittedAt = new Date();
  
  // Update attempts
  this.attempts += 1;
  if (!this.bestScore || score > this.bestScore) {
    this.bestScore = score;
  }
};

// Method to generate AI feedback
AgenticTestSchema.methods.generateAIFeedback = async function() {
  const accuracy = this.results.score;
  
  const strengths = [];
  const weaknesses = [];
  const recommendations = [];
  
  // Analyze performance
  if (accuracy >= 80) {
    strengths.push('Excellent overall performance');
    recommendations.push('Try more advanced topics to challenge yourself');
  } else if (accuracy >= 60) {
    strengths.push('Good understanding of core concepts');
    recommendations.push('Focus on practicing weak areas');
  } else {
    weaknesses.push('Need more practice on fundamentals');
    recommendations.push('Review study materials and attempt practice problems');
  }
  
  // Topic-wise analysis
  const topicPerformance = {};
  this.questions.forEach(q => {
    if (!topicPerformance[q.topic]) {
      topicPerformance[q.topic] = { correct: 0, total: 0 };
    }
    topicPerformance[q.topic].total++;
    if (q.isCorrect) topicPerformance[q.topic].correct++;
  });
  
  const topicAnalysis = Object.entries(topicPerformance).map(([topic, data]) => ({
    topic,
    totalQuestions: data.total,
    correctAnswers: data.correct,
    accuracy: Math.round((data.correct / data.total) * 100)
  }));
  
  // Identify weak topics
  topicAnalysis.forEach(t => {
    if (t.accuracy < 50) {
      weaknesses.push(`Low accuracy in ${t.topic} (${t.accuracy}%)`);
      recommendations.push(`Review ${t.topic} concepts and practice more problems`);
    } else if (t.accuracy >= 80) {
      strengths.push(`Strong grasp of ${t.topic} (${t.accuracy}%)`);
    }
  });
  
  this.results.topicAnalysis = topicAnalysis;
  this.results.aiFeedback = {
    strengths,
    weaknesses,
    recommendations,
    nextSteps: [
      'Review incorrect answers and understand the concepts',
      'Practice similar questions',
      'Take another test after reviewing'
    ]
  };
};

module.exports = mongoose.model('AgenticTest', AgenticTestSchema);
