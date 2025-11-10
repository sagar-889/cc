const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const agenticAICore = require('../utils/agenticAICore');

/**
 * ADMIN-ONLY AGENTIC AI ROUTES
 * All routes require admin authentication
 */

// ==========================================
// 1. AUTOMATED REPORT GENERATION AGENT
// ==========================================

/**
 * @route   POST /api/admin/agentic/reports/generate
 * @desc    Generate comprehensive reports
 * @access  Admin only
 */
router.post('/reports/generate', auth, authorize('admin'), async (req, res) => {
  try {
    const { reportType, filters } = req.body;

    if (!reportType) {
      return res.status(400).json({ 
        success: false,
        message: 'Report type is required' 
      });
    }

    const report = await agenticAICore.generateAdminReport(reportType, filters || {});

    res.json(report);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate report',
      error: error.message 
    });
  }
});

// ==========================================
// 2. HELPDESK TICKET MANAGEMENT AGENT
// ==========================================

/**
 * @route   POST /api/admin/agentic/helpdesk/manage
 * @desc    Manage helpdesk tickets with AI
 * @access  Admin only
 */
router.post('/helpdesk/manage', auth, authorize('admin'), async (req, res) => {
  try {
    const { action, data } = req.body;

    if (!action) {
      return res.status(400).json({ 
        success: false,
        message: 'Action is required' 
      });
    }

    const result = await agenticAICore.manageHelpdeskTickets(action, data || {});

    res.json(result);
  } catch (error) {
    console.error('Helpdesk management error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to manage tickets',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/admin/agentic/helpdesk/auto-process
 * @desc    Auto-process all pending tickets
 * @access  Admin only
 */
router.post('/helpdesk/auto-process', auth, authorize('admin'), async (req, res) => {
  try {
    const result = await agenticAICore.autoProcessTickets();
    res.json(result);
  } catch (error) {
    console.error('Auto-process error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to auto-process tickets',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/admin/agentic/helpdesk/generate-response
 * @desc    Generate AI response for a ticket
 * @access  Admin only
 */
router.post('/helpdesk/generate-response', auth, authorize('admin'), async (req, res) => {
  try {
    const { ticketId, question } = req.body;

    if (!question) {
      return res.status(400).json({ 
        success: false,
        message: 'Question is required' 
      });
    }

    const result = await agenticAICore.generateTicketResponse(ticketId, question);
    res.json(result);
  } catch (error) {
    console.error('Response generation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate response',
      error: error.message 
    });
  }
});

// ==========================================
// 3. AUTOMATED SCHEDULING AGENT
// ==========================================

/**
 * @route   POST /api/admin/agentic/scheduling/optimize
 * @desc    Optimize scheduling (timetable, rooms, exams)
 * @access  Admin only
 */
router.post('/scheduling/optimize', auth, authorize('admin'), async (req, res) => {
  try {
    const { scheduleType, data } = req.body;

    if (!scheduleType) {
      return res.status(400).json({ 
        success: false,
        message: 'Schedule type is required' 
      });
    }

    const result = await agenticAICore.optimizeScheduling(scheduleType, data || {});

    res.json(result);
  } catch (error) {
    console.error('Scheduling error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to optimize schedule',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/admin/agentic/scheduling/timetable
 * @desc    Generate optimal timetable
 * @access  Admin only
 */
router.post('/scheduling/timetable', auth, authorize('admin'), async (req, res) => {
  try {
    const { department, year, courses } = req.body;

    const result = await agenticAICore.generateOptimalTimetable({
      department,
      year,
      courses
    });

    res.json(result);
  } catch (error) {
    console.error('Timetable generation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate timetable',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/admin/agentic/scheduling/exam-schedule
 * @desc    Generate exam schedule
 * @access  Admin only
 */
router.post('/scheduling/exam-schedule', auth, authorize('admin'), async (req, res) => {
  try {
    const { courses, startDate } = req.body;

    const result = await agenticAICore.generateExamSchedule({
      courses,
      startDate
    });

    res.json(result);
  } catch (error) {
    console.error('Exam schedule error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate exam schedule',
      error: error.message 
    });
  }
});

// ==========================================
// 4. SMART USER MANAGEMENT AGENT
// ==========================================

/**
 * @route   POST /api/admin/agentic/users/manage
 * @desc    Manage users with AI
 * @access  Admin only
 */
router.post('/users/manage', auth, authorize('admin'), async (req, res) => {
  try {
    const { action, data } = req.body;

    if (!action) {
      return res.status(400).json({ 
        success: false,
        message: 'Action is required' 
      });
    }

    const result = await agenticAICore.manageUsers(action, data || {});

    res.json(result);
  } catch (error) {
    console.error('User management error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to manage users',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/admin/agentic/users/bulk-create
 * @desc    Bulk create users from CSV data
 * @access  Admin only
 */
router.post('/users/bulk-create', auth, authorize('admin'), async (req, res) => {
  try {
    const { users } = req.body;

    if (!users || !Array.isArray(users)) {
      return res.status(400).json({ 
        success: false,
        message: 'Users array is required' 
      });
    }

    const result = await agenticAICore.bulkCreateUsers(users);

    res.json(result);
  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create users',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/admin/agentic/users/inactive
 * @desc    Detect inactive users
 * @access  Admin only
 */
router.get('/users/inactive', auth, authorize('admin'), async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const result = await agenticAICore.detectInactiveUsers(days);

    res.json(result);
  } catch (error) {
    console.error('Inactive detection error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to detect inactive users',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/admin/agentic/users/anomalies
 * @desc    Detect account anomalies
 * @access  Admin only
 */
router.get('/users/anomalies', auth, authorize('admin'), async (req, res) => {
  try {
    const result = await agenticAICore.detectAccountAnomalies();
    res.json(result);
  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to detect anomalies',
      error: error.message 
    });
  }
});

// ==========================================
// 5. COMMUNICATION AUTOMATION AGENT
// ==========================================

/**
 * @route   POST /api/admin/agentic/communication/draft
 * @desc    Draft announcement with AI
 * @access  Admin only
 */
router.post('/communication/draft', auth, authorize('admin'), async (req, res) => {
  try {
    const { topic, targetAudience, urgency } = req.body;

    if (!topic) {
      return res.status(400).json({ 
        success: false,
        message: 'Topic is required' 
      });
    }

    const result = await agenticAICore.draftAnnouncement({
      topic,
      targetAudience: targetAudience || 'All Students',
      urgency: urgency || 'normal'
    });

    res.json(result);
  } catch (error) {
    console.error('Draft announcement error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to draft announcement',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/admin/agentic/communication/targeted
 * @desc    Send targeted message
 * @access  Admin only
 */
router.post('/communication/targeted', auth, authorize('admin'), async (req, res) => {
  try {
    const { message, filters } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false,
        message: 'Message is required' 
      });
    }

    const result = await agenticAICore.sendTargetedMessage({
      message,
      filters: filters || {}
    });

    res.json(result);
  } catch (error) {
    console.error('Targeted message error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send targeted message',
      error: error.message 
    });
  }
});

/**
 * @route   POST /api/admin/agentic/communication/campaign
 * @desc    Create email campaign
 * @access  Admin only
 */
router.post('/communication/campaign', auth, authorize('admin'), async (req, res) => {
  try {
    const { campaignName, subject, body, targetAudience } = req.body;

    if (!campaignName || !subject || !body) {
      return res.status(400).json({ 
        success: false,
        message: 'Campaign name, subject, and body are required' 
      });
    }

    const result = await agenticAICore.createEmailCampaign({
      campaignName,
      subject,
      body,
      targetAudience
    });

    res.json(result);
  } catch (error) {
    console.error('Campaign creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create campaign',
      error: error.message 
    });
  }
});

module.exports = router;
