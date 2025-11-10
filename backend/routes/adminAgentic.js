const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const adminAgenticAI = require('../utils/adminAgenticAI');

// 1. Report Generation Agent
router.post('/generate-report', auth, authorize('admin'), async (req, res) => {
  try {
    const { reportType, filters } = req.body;
    
    if (!reportType) {
      return res.status(400).json({
        success: false,
        message: 'Report type is required'
      });
    }
    
    console.log(`🤖 Admin AI: Generating ${reportType} report`);
    const report = await adminAgenticAI.generateReport(reportType, {}, filters);
    
    res.json({
      success: true,
      report,
      message: `Report generated successfully`
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
});

// 2. Helpdesk Ticket Management Agent
router.post('/helpdesk-manage', auth, authorize('admin'), async (req, res) => {
  try {
    const { action, ticketData } = req.body;
    
    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action is required'
      });
    }
    
    console.log(`🤖 Admin AI: Managing helpdesk - ${action}`);
    const result = await adminAgenticAI.manageHelpdesk(action, ticketData);
    
    res.json({
      success: true,
      result,
      message: `Helpdesk ${action} completed successfully`
    });
  } catch (error) {
    console.error('Helpdesk management error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to manage helpdesk',
      error: error.message
    });
  }
});

// 3. Automated Scheduling Agent
router.post('/generate-timetable', auth, authorize('admin'), async (req, res) => {
  try {
    const { courses, faculty, rooms, constraints } = req.body;
    
    if (!courses || !Array.isArray(courses)) {
      return res.status(400).json({
        success: false,
        message: 'Courses array is required'
      });
    }
    
    console.log(`🤖 Admin AI: Generating smart timetable for ${courses.length} courses`);
    
    const scheduleData = {
      courses,
      faculty: faculty || [],
      rooms: rooms || [],
      constraints: constraints || {}
    };
    
    const result = await adminAgenticAI.generateTimetable(scheduleData);
    
    res.json({
      success: true,
      ...result,
      message: result.success ? 
        `✅ Smart timetable generated with AI optimization!` : 
        result.message
    });
  } catch (error) {
    console.error('Timetable generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate timetable',
      error: error.message
    });
  }
});

// 4. Smart User Management Agent
router.post('/user-management', auth, authorize('admin'), async (req, res) => {
  try {
    const { action, userData } = req.body;
    
    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action is required'
      });
    }
    
    console.log(`🤖 Admin AI: Smart user management - ${action}`);
    const result = await adminAgenticAI.manageUsers(action, userData);
    
    res.json({
      success: true,
      result,
      message: `User management ${action} completed successfully`
    });
  } catch (error) {
    console.error('User management error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to manage users',
      error: error.message
    });
  }
});

// 5. Communication Automation Agent
router.post('/automate-communication', auth, authorize('admin'), async (req, res) => {
  try {
    const { action, commData } = req.body;
    
    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action is required'
      });
    }
    
    console.log(`🤖 Admin AI: Automating communication - ${action}`);
    const result = await adminAgenticAI.automateComm(action, commData);
    
    res.json({
      success: true,
      result,
      message: `Communication automation ${action} completed successfully`
    });
  } catch (error) {
    console.error('Communication automation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to automate communication',
      error: error.message
    });
  }
});

// Admin AI Chat Interface
router.post('/admin-chat', auth, authorize('admin'), async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    console.log(`🤖 Admin AI Chat: "${message}"`);
    
    // Route admin queries to appropriate AI agents
    const lowerMessage = message.toLowerCase();
    let response = '';
    
    if (lowerMessage.includes('generate') && lowerMessage.includes('report')) {
      // Extract report type
      const reportTypes = ['student_performance', 'event_analytics', 'resource_utilization', 'engagement_metrics', 'system_overview'];
      const reportType = reportTypes.find(type => lowerMessage.includes(type.replace('_', ' '))) || 'system_overview';
      
      const result = await adminAgenticAI.generateReport(reportType, {}, {});
      response = `✅ Generated ${reportType} report successfully!\n\n📊 **Key Insights:**\n${result.analysis || 'Report data compiled successfully.'}`;
      
    } else if (lowerMessage.includes('timetable') || lowerMessage.includes('schedule')) {
      response = `🤖 I can help you generate smart timetables! Please provide:\n\n📚 **Courses** (with codes, faculty, year)\n👨‍🏫 **Faculty** availability\n🏫 **Rooms** available\n⏰ **Constraints** (if any)\n\nI'll automatically resolve conflicts and optimize the schedule according to college timings:\n• Years 1-3: 8:00 AM - 4:00 PM\n• Year 4: 10:00 AM - 4:00 PM`;
      
    } else if (lowerMessage.includes('helpdesk') || lowerMessage.includes('ticket')) {
      response = `🎫 I can help manage helpdesk tickets intelligently!\n\n**Available Actions:**\n• Auto-categorize tickets\n• Suggest solutions\n• Prioritize by urgency\n• Auto-assign to staff\n• Generate responses\n\nJust tell me what you need help with!`;
      
    } else if (lowerMessage.includes('user') && lowerMessage.includes('manage')) {
      response = `👥 Smart user management at your service!\n\n**I can help with:**\n• Analyze user activity patterns\n• Detect anomalies\n• Suggest interventions\n• Bulk operations\n• User engagement insights\n\nWhat would you like to analyze?`;
      
    } else if (lowerMessage.includes('communication') || lowerMessage.includes('announcement')) {
      response = `📢 Communication automation ready!\n\n**I can:**\n• Generate announcements\n• Personalize messages\n• Schedule notifications\n• Analyze engagement\n• Create targeted campaigns\n\nWhat communication task can I help with?`;
      
    } else {
      response = `🤖 **Admin AI Assistant Ready!**\n\nI can help you with:\n\n📊 **Report Generation** - Comprehensive analytics and insights\n🎫 **Helpdesk Management** - Smart ticket handling\n📅 **Timetable Generation** - AI-optimized scheduling\n👥 **User Management** - Smart user analytics\n📢 **Communication** - Automated messaging\n\nWhat would you like me to help you with today?`;
    }
    
    res.json({
      success: true,
      response,
      context: context || 'admin',
      timestamp: new Date(),
      agentic: true,
      adminAI: true
    });
    
  } catch (error) {
    console.error('Admin AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin AI chat failed',
      error: error.message
    });
  }
});

module.exports = router;
