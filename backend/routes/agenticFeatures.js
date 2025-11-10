const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const agenticAICore = require('../utils/agenticAICore');
const Assignment = require('../models/Assignment');
const Booking = require('../models/Booking');
const UserPreferences = require('../models/UserPreferences');
const ExamPrep = require('../models/ExamPrep');

/**
 * @route   POST /api/agentic/events/auto-register
 * @desc    Auto-register for events based on preferences
 * @access  Private
 */
router.post('/events/auto-register', auth, async (req, res) => {
  try {
    const { query, preferences } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const result = await agenticAICore.autoRegisterForEvents(
      req.user.id,
      query,
      preferences || {}
    );

    res.json(result);
  } catch (error) {
    console.error('Auto-register events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/agentic/materials/find
 * @desc    Find and organize study materials
 * @access  Private
 */
router.post('/materials/find', auth, async (req, res) => {
  try {
    const { query, options } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    const result = await agenticAICore.findAndOrganizeMaterials(
      req.user.id,
      query,
      options || {}
    );

    res.json(result);
  } catch (error) {
    console.error('Find materials error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/agentic/assignments/manage
 * @desc    Get assignment management and schedule
 * @access  Private
 */
router.get('/assignments/manage', auth, async (req, res) => {
  try {
    const result = await agenticAICore.manageAssignmentsAndDeadlines(
      req.user.id,
      {}
    );

    res.json(result);
  } catch (error) {
    console.error('Manage assignments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/agentic/assignments/create
 * @desc    Create a new assignment
 * @access  Private
 */
router.post('/assignments/create', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      type,
      dueDate,
      priority,
      estimatedHours,
      difficulty,
      tags
    } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({ message: 'Title and due date are required' });
    }

    const assignment = new Assignment({
      userId: req.user.id,
      title,
      description,
      courseId,
      type: type || 'assignment',
      dueDate,
      priority: priority || 'medium',
      estimatedHours: estimatedHours || 2,
      difficulty: difficulty || 'medium',
      tags: tags || [],
      status: 'pending'
    });

    await assignment.save();

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/agentic/assignments
 * @desc    Get all assignments for user
 * @access  Private
 */
router.get('/assignments', auth, async (req, res) => {
  try {
    const { status, type } = req.query;
    
    const query = { userId: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }

    const assignments = await Assignment.find(query)
      .populate('courseId', 'name code')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/agentic/assignments/:id
 * @desc    Update assignment
 * @access  Private
 */
router.put('/assignments/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      assignment[key] = updates[key];
    });

    await assignment.save();

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   DELETE /api/agentic/assignments/:id
 * @desc    Delete assignment
 * @access  Private
 */
router.delete('/assignments/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/agentic/exam-prep/create
 * @desc    Create exam preparation plan
 * @access  Private
 */
router.post('/exam-prep/create', auth, async (req, res) => {
  try {
    const { examName, examDate, courseId, topics } = req.body;

    if (!examName || !examDate) {
      return res.status(400).json({ message: 'Exam name and date are required' });
    }

    const examDetails = {
      examName,
      examDate,
      courseId,
      topics: topics || []
    };

    const result = await agenticAICore.createExamPreparationPlan(
      req.user.id,
      examDetails
    );

    res.json(result);
  } catch (error) {
    console.error('Create exam prep error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/agentic/exam-prep
 * @desc    Get all exam preparations
 * @access  Private
 */
router.get('/exam-prep', auth, async (req, res) => {
  try {
    const examPreps = await ExamPrep.find({ userId: req.user.id })
      .populate('courseId', 'name code')
      .sort({ examDate: 1 });

    res.json({
      success: true,
      count: examPreps.length,
      examPreps
    });
  } catch (error) {
    console.error('Get exam preps error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/agentic/exam-prep/:id
 * @desc    Get specific exam preparation
 * @access  Private
 */
router.get('/exam-prep/:id', auth, async (req, res) => {
  try {
    const examPrep = await ExamPrep.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('courseId', 'name code');

    if (!examPrep) {
      return res.status(404).json({ message: 'Exam preparation not found' });
    }

    res.json({
      success: true,
      examPrep
    });
  } catch (error) {
    console.error('Get exam prep error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/agentic/exam-prep/:id/progress
 * @desc    Update exam preparation progress
 * @access  Private
 */
router.put('/exam-prep/:id/progress', auth, async (req, res) => {
  try {
    const { topicIndex, completed, confidence, studyHours } = req.body;

    const examPrep = await ExamPrep.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!examPrep) {
      return res.status(404).json({ message: 'Exam preparation not found' });
    }

    // Update topic progress
    if (topicIndex !== undefined && examPrep.syllabus[topicIndex]) {
      if (completed !== undefined) {
        examPrep.syllabus[topicIndex].completed = completed;
      }
      if (confidence !== undefined) {
        examPrep.syllabus[topicIndex].confidence = confidence;
      }
    }

    // Update overall progress
    if (studyHours !== undefined) {
      examPrep.progress.studyHours += studyHours;
    }

    const completedTopics = examPrep.syllabus.filter(t => t.completed).length;
    examPrep.progress.topicsCompleted = completedTopics;
    examPrep.progress.overallProgress = Math.round((completedTopics / examPrep.syllabus.length) * 100);
    examPrep.progress.lastStudied = new Date();

    await examPrep.save();

    res.json({
      success: true,
      message: 'Progress updated successfully',
      progress: examPrep.progress
    });
  } catch (error) {
    console.error('Update exam prep progress error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/agentic/bookings
 * @desc    Get all bookings for user
 * @access  Private
 */
router.get('/bookings', auth, async (req, res) => {
  try {
    const { resourceType, status } = req.query;
    
    const query = { userId: req.user.id };
    
    if (resourceType) {
      query.resourceType = resourceType;
    }
    
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ bookingTime: -1 })
      .limit(50);

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/agentic/preferences
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/preferences', auth, async (req, res) => {
  try {
    let preferences = await UserPreferences.findOne({ userId: req.user.id });

    if (!preferences) {
      // Create default preferences
      preferences = new UserPreferences({
        userId: req.user.id
      });
      await preferences.save();
    }

    res.json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   PUT /api/agentic/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', auth, async (req, res) => {
  try {
    let preferences = await UserPreferences.findOne({ userId: req.user.id });

    if (!preferences) {
      preferences = new UserPreferences({
        userId: req.user.id,
        ...req.body
      });
    } else {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'object' && !Array.isArray(req.body[key])) {
          preferences[key] = { ...preferences[key], ...req.body[key] };
        } else {
          preferences[key] = req.body[key];
        }
      });
    }

    await preferences.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/agentic/assignments/generate-content
 * @desc    Generate assignment content using AI
 * @access  Private
 */
router.post('/assignments/generate-content', auth, async (req, res) => {
  try {
    const { assignmentTitle, problemStatement, requirements, type } = req.body;

    if (!problemStatement) {
      return res.status(400).json({ 
        success: false,
        message: 'Problem statement is required' 
      });
    }

    const agenticAICore = require('../utils/agenticAICore');
    
    // Generate content using AI
    const content = await agenticAICore.generateAssignmentContent(
      assignmentTitle,
      problemStatement,
      requirements,
      type
    );

    res.json({
      success: true,
      content,
      message: 'Assignment content generated successfully'
    });
  } catch (error) {
    console.error('Generate content error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate content',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/agentic/assignments/convert-ieee
 * @desc    Convert content to IEEE format and download as text file
 * @access  Private
 */
router.post('/assignments/convert-ieee', auth, async (req, res) => {
  try {
    const { content, title, format } = req.body;

    if (!content) {
      return res.status(400).json({ 
        success: false,
        message: 'Content is required' 
      });
    }

    const agenticAICore = require('../utils/agenticAICore');
    
    // Format content in IEEE style
    const formattedContent = agenticAICore.formatAsIEEE(content, title);

    // For now, download as text file (proper PDF/Word generation requires additional libraries)
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${title}_IEEE_Format.txt"`);
    res.send(formattedContent);
  } catch (error) {
    console.error('Convert IEEE error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to convert to IEEE format',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/agentic/dashboard
 * @desc    Get agentic AI dashboard overview
 * @access  Private
 */
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get pending assignments
    const pendingAssignments = await Assignment.find({
      userId: req.user.id,
      status: { $in: ['pending', 'in_progress'] }
    }).sort({ dueDate: 1 }).limit(5);

    // Get upcoming exams
    const upcomingExams = await ExamPrep.find({
      userId: req.user.id,
      examDate: { $gte: new Date() },
      status: { $in: ['planning', 'in_progress'] }
    }).sort({ examDate: 1 }).limit(5);

    // Get recent bookings
    const recentBookings = await Booking.find({
      userId: req.user.id,
      status: { $in: ['pending', 'confirmed'] }
    }).sort({ bookingTime: -1 }).limit(5);

    // Calculate statistics
    const totalAssignments = await Assignment.countDocuments({
      userId: req.user.id,
      status: { $in: ['pending', 'in_progress'] }
    });

    const urgentAssignments = await Assignment.countDocuments({
      userId: req.user.id,
      status: { $in: ['pending', 'in_progress'] },
      dueDate: { $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) }
    });

    const completedAssignments = await Assignment.countDocuments({
      userId: req.user.id,
      status: 'completed'
    });

    res.json({
      success: true,
      dashboard: {
        assignments: {
          total: totalAssignments,
          urgent: urgentAssignments,
          completed: completedAssignments,
          recent: pendingAssignments
        },
        exams: {
          total: upcomingExams.length,
          upcoming: upcomingExams
        },
        bookings: {
          total: recentBookings.length,
          recent: recentBookings
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all assignments for a user
router.get('/assignments', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      assignments
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate assignment schedule
router.get('/assignments/manage', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({ 
      userId: req.user.id,
      status: { $ne: 'completed' }
    }).sort({ dueDate: 1 });
    
    // Generate optimal schedule
    const schedule = {
      success: true,
      message: 'Optimal study schedule generated',
      totalAssignments: assignments.length,
      upcomingDeadlines: assignments.slice(0, 5),
      recommendations: [
        'Start with high-priority assignments',
        'Break large tasks into smaller chunks',
        'Schedule regular study breaks'
      ]
    };
    
    res.json(schedule);
  } catch (error) {
    console.error('Generate schedule error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update assignment status
router.put('/assignments/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true }
    );
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json({
      success: true,
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate assignment content using AI
router.post('/assignments/generate-content', auth, async (req, res) => {
  try {
    const { assignmentTitle, problemStatement, requirements, type } = req.body;
    
    if (!problemStatement) {
      return res.status(400).json({ message: 'Problem statement is required' });
    }
    
    // Simulate AI content generation with comprehensive content
    const generatedContent = `# ${assignmentTitle}

## Problem Analysis
${problemStatement}

## Requirements Analysis
${requirements || 'Standard academic requirements apply'}

## Proposed Solution

### 1. Introduction
This ${type || 'assignment'} addresses the problem of ${problemStatement.toLowerCase()}. The solution involves a systematic approach to understanding and implementing the required functionality.

### 2. Methodology
- **Research Phase**: Conduct thorough literature review
- **Design Phase**: Create system architecture and design patterns
- **Implementation Phase**: Develop the solution using appropriate technologies
- **Testing Phase**: Validate the solution against requirements

### 3. Technical Approach
\`\`\`
// Sample code structure
class Solution {
  constructor() {
    this.initialize();
  }
  
  initialize() {
    // Setup initial parameters
  }
  
  solve() {
    // Main solution logic
    return this.processData();
  }
  
  processData() {
    // Data processing implementation
  }
}
\`\`\`

### 4. Expected Outcomes
- Comprehensive understanding of the problem domain
- Efficient and scalable solution implementation
- Proper documentation and testing coverage
- Adherence to academic and industry standards

### 5. Conclusion
This solution provides a robust framework for addressing ${problemStatement.toLowerCase()}. The implementation follows best practices and ensures maintainability and extensibility.

### 6. References
1. Academic Source 1 - Relevant to ${assignmentTitle}
2. Industry Best Practices Guide
3. Technical Documentation Standards
4. Testing and Validation Methodologies

---
*Generated by CampusCompanion AI Assistant*`;
    
    res.json({
      success: true,
      message: 'Assignment content generated successfully',
      content: generatedContent,
      wordCount: generatedContent.split(' ').length,
      sections: ['Introduction', 'Methodology', 'Technical Approach', 'Expected Outcomes', 'Conclusion', 'References']
    });
  } catch (error) {
    console.error('Generate content error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Convert content to IEEE format
router.post('/assignments/convert-ieee', auth, async (req, res) => {
  try {
    const { content, title, format } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }
    
    // Convert to IEEE format
    const ieeeContent = `IEEE FORMATTED DOCUMENT\n\n${title.toUpperCase()}\n\nAbstract\n${content.substring(0, 200)}...\n\nI. INTRODUCTION\n${content}\n\nII. CONCLUSION\nThis document presents a comprehensive analysis...\n\nREFERENCES\n[1] Author, "Title," Journal, vol. X, no. Y, pp. Z-Z, Year.`;
    
    // Create downloadable file
    const filename = `${title.replace(/\s+/g, '_')}_IEEE.txt`;
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(ieeeContent);
  } catch (error) {
    console.error('Convert IEEE error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all exam preparations
router.get('/exam-prep', auth, async (req, res) => {
  try {
    const examPreps = await ExamPrep.find({ userId: req.user.id })
      .sort({ examDate: 1 });
    
    res.json({
      success: true,
      examPreps
    });
  } catch (error) {
    console.error('Get exam preps error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create exam preparation plan
router.post('/exam-prep/create', auth, async (req, res) => {
  try {
    const { examName, examDate, topics } = req.body;
    
    if (!examName || !examDate || !topics || topics.length === 0) {
      return res.status(400).json({ message: 'Exam name, date, and topics are required' });
    }
    
    // Generate study plan
    const studyPlan = topics.map((topic, index) => ({
      topic,
      completed: false,
      confidence: 0,
      studyHours: 0,
      resources: [
        `${topic} - Textbook Chapter`,
        `${topic} - Online Tutorial`,
        `${topic} - Practice Problems`
      ],
      schedule: {
        startDate: new Date(),
        endDate: new Date(examDate),
        dailyHours: 2
      }
    }));
    
    const examPrep = new ExamPrep({
      userId: req.user.id,
      examName,
      examDate,
      topics: studyPlan,
      totalTopics: topics.length,
      completedTopics: 0,
      overallProgress: 0
    });
    
    await examPrep.save();
    
    res.status(201).json({
      success: true,
      message: 'Exam preparation plan created successfully',
      examPrep
    });
  } catch (error) {
    console.error('Create exam prep error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get specific exam preparation
router.get('/exam-prep/:id', auth, async (req, res) => {
  try {
    const examPrep = await ExamPrep.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!examPrep) {
      return res.status(404).json({ message: 'Exam preparation not found' });
    }
    
    res.json({
      success: true,
      examPrep
    });
  } catch (error) {
    console.error('Get exam prep error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update exam preparation progress
router.put('/exam-prep/:id/progress', auth, async (req, res) => {
  try {
    const { topicIndex, completed, confidence, studyHours } = req.body;
    
    const examPrep = await ExamPrep.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!examPrep) {
      return res.status(404).json({ message: 'Exam preparation not found' });
    }
    
    // Update topic progress
    if (topicIndex >= 0 && topicIndex < examPrep.topics.length) {
      examPrep.topics[topicIndex].completed = completed;
      examPrep.topics[topicIndex].confidence = confidence;
      examPrep.topics[topicIndex].studyHours += studyHours || 0;
      
      // Recalculate overall progress
      const completedCount = examPrep.topics.filter(t => t.completed).length;
      examPrep.completedTopics = completedCount;
      examPrep.overallProgress = (completedCount / examPrep.totalTopics) * 100;
      
      await examPrep.save();
    }
    
    res.json({
      success: true,
      message: 'Progress updated successfully',
      examPrep
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
