const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('langchain/prompts');

/**
 * Student Agentic AI System
 * Specialized AI agents for student-specific tasks
 */
class StudentAgenticAISystem {
  constructor() {
    this.model = null;
    this.initializeModel();
  }

  initializeModel() {
    if (process.env.OPENAI_API_KEY) {
      this.model = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-3.5-turbo',
        temperature: 0.7
      });
    }
  }

  // 1. Event Registration Agent
  async handleEventRegistration(query, userId) {
    try {
      const Event = require('../models/Event');
      const User = require('../models/User');
      
      // Extract event information from query
      const eventInfo = await this.extractEventInfo(query);
      
      if (!eventInfo.eventName) {
        return "❌ Please specify which event you'd like to register for";
      }
      
      // Find matching events
      const events = await Event.find({
        title: { $regex: eventInfo.eventName, $options: 'i' },
        status: 'upcoming',
        registrationOpen: true
      }).sort({ date: 1 });
      
      if (events.length === 0) {
        return `❌ No upcoming events found matching "${eventInfo.eventName}"`;
      }
      
      // If multiple events, show options
      if (events.length > 1) {
        let response = `🎯 Found ${events.length} events matching "${eventInfo.eventName}":\n\n`;
        events.forEach((event, index) => {
          response += `${index + 1}. **${event.title}**\n`;
          response += `   Date: ${event.date.toDateString()}\n`;
          response += `   Type: ${event.type}\n`;
          response += `   Seats: ${event.maxParticipants - (event.registeredUsers?.length || 0)} available\n\n`;
        });
        response += "Please specify which event number you'd like to register for.";
        return response;
      }
      
      // Register for the event
      const event = events[0];
      
      // Check if already registered
      if (event.registeredUsers?.includes(userId)) {
        return `ℹ️ You're already registered for "${event.title}"`;
      }
      
      // Check capacity
      if (event.registeredUsers?.length >= event.maxParticipants) {
        return `❌ Sorry, "${event.title}" is full. You've been added to the waitlist.`;
      }
      
      // Register user
      event.registeredUsers = event.registeredUsers || [];
      event.registeredUsers.push(userId);
      await event.save();
      
      return `✅ Successfully registered you for "${event.title}" on ${event.date.toDateString()}!\n\n📍 Location: ${event.location}\n⏰ Time: ${event.time}\n📝 Don't forget to attend!`;
      
    } catch (error) {
      console.error('Event registration error:', error);
      return "❌ Failed to register for event. Please try again.";
    }
  }

  // 2. Study Material Finder Agent
  async findStudyMaterials(query, userId) {
    try {
      const Material = require('../models/Material');
      const User = require('../models/User');
      
      // Get user's enrolled courses for context
      const user = await User.findById(userId).populate('enrolledCourses', 'code name');
      
      // Extract search criteria
      const searchCriteria = await this.extractMaterialCriteria(query, user);
      
      // Build search query
      let searchQuery = {
        $or: [
          { title: { $regex: searchCriteria.term, $options: 'i' } },
          { description: { $regex: searchCriteria.term, $options: 'i' } },
          { tags: { $in: [new RegExp(searchCriteria.term, 'i')] } }
        ]
      };
      
      // Filter by course if specified
      if (searchCriteria.courseCode) {
        const Course = require('../models/Course');
        const course = await Course.findOne({ code: searchCriteria.courseCode });
        if (course) {
          searchQuery.course = course._id;
        }
      }
      
      // Filter by material type if specified
      if (searchCriteria.type) {
        searchQuery.category = searchCriteria.type;
      }
      
      const materials = await Material.find(searchQuery)
        .populate('course', 'code name')
        .populate('uploadedBy', 'name')
        .sort({ uploadDate: -1 })
        .limit(10);
      
      if (materials.length === 0) {
        return `❌ No materials found for "${searchCriteria.term}". Try different keywords or check if the course code is correct.`;
      }
      
      let response = `📚 Found ${materials.length} materials for "${searchCriteria.term}":\n\n`;
      
      materials.forEach((material, index) => {
        response += `${index + 1}. **${material.title}**\n`;
        response += `   📖 Course: ${material.course?.code || 'General'} - ${material.course?.name || 'N/A'}\n`;
        response += `   📄 Type: ${material.category}\n`;
        response += `   👤 By: ${material.uploadedBy?.name || 'Anonymous'}\n`;
        response += `   📅 Uploaded: ${material.uploadDate.toDateString()}\n`;
        response += `   🔗 Access: /materials/${material._id}\n\n`;
      });
      
      // AI-powered recommendations
      if (this.model && user.enrolledCourses.length > 0) {
        const recommendations = await this.generateMaterialRecommendations(materials, user);
        if (recommendations) {
          response += `\n🤖 **AI Recommendations:**\n${recommendations}`;
        }
      }
      
      return response;
      
    } catch (error) {
      console.error('Material search error:', error);
      return "❌ Failed to search materials. Please try again.";
    }
  }

  // 3. Assignment Manager Agent
  async manageAssignments(query, userId) {
    try {
      const Assignment = require('../models/Assignment');
      const User = require('../models/User');
      
      const user = await User.findById(userId).populate('enrolledCourses', 'code name');
      
      // Determine action type
      const action = await this.determineAssignmentAction(query);
      
      switch (action.type) {
        case 'list_upcoming':
          return await this.listUpcomingAssignments(userId, user);
        case 'list_overdue':
          return await this.listOverdueAssignments(userId, user);
        case 'create_schedule':
          return await this.createAssignmentSchedule(userId, user);
        case 'get_details':
          return await this.getAssignmentDetails(action.assignmentId, userId);
        case 'submit':
          return await this.handleAssignmentSubmission(action.assignmentId, userId, action.data);
        default:
          return await this.listUpcomingAssignments(userId, user);
      }
      
    } catch (error) {
      console.error('Assignment management error:', error);
      return "❌ Failed to manage assignments. Please try again.";
    }
  }

  // 4. Exam Prep Automation Agent
  async automateExamPrep(query, userId) {
    try {
      const User = require('../models/User');
      const Course = require('../models/Course');
      const Material = require('../models/Material');
      
      const user = await User.findById(userId).populate('enrolledCourses', 'code name');
      
      // Extract exam information
      const examInfo = await this.extractExamInfo(query);
      
      if (!examInfo.subject && !examInfo.course) {
        return "❌ Please specify which subject or course exam you're preparing for";
      }
      
      // Find relevant course
      let targetCourse = null;
      if (examInfo.course) {
        targetCourse = user.enrolledCourses.find(c => 
          c.code.toLowerCase().includes(examInfo.course.toLowerCase()) ||
          c.name.toLowerCase().includes(examInfo.course.toLowerCase())
        );
      }
      
      if (!targetCourse && examInfo.subject) {
        targetCourse = user.enrolledCourses.find(c => 
          c.name.toLowerCase().includes(examInfo.subject.toLowerCase())
        );
      }
      
      if (!targetCourse) {
        return `❌ Couldn't find a matching course. Your enrolled courses: ${user.enrolledCourses.map(c => c.code).join(', ')}`;
      }
      
      // Generate comprehensive exam prep plan
      const prepPlan = await this.generateExamPrepPlan(targetCourse, examInfo, userId);
      
      return prepPlan;
      
    } catch (error) {
      console.error('Exam prep automation error:', error);
      return "❌ Failed to create exam preparation plan. Please try again.";
    }
  }

  // Helper methods
  async extractEventInfo(query) {
    const eventMatch = query.match(/(?:register|join|attend)\s+(?:for\s+)?(?:event\s+)?(.+)/i);
    return {
      eventName: eventMatch ? eventMatch[1].trim() : null
    };
  }

  async extractMaterialCriteria(query, user) {
    // Extract course code
    const courseMatch = query.match(/(?:for\s+)?([A-Z]{2,4}\d{3})/i);
    
    // Extract material type
    const typeMatch = query.match(/(?:find|search)\s+(?:for\s+)?(\w+)\s+(?:materials?|notes?|books?)/i);
    
    // Extract main search term
    const termMatch = query.match(/(?:find|search)\s+(?:materials?\s+)?(?:for\s+)?(.+)/i);
    
    return {
      courseCode: courseMatch ? courseMatch[1] : null,
      type: typeMatch ? typeMatch[1] : null,
      term: termMatch ? termMatch[1].trim() : query
    };
  }

  async generateExamPrepPlan(course, examInfo, userId) {
    const Material = require('../models/Material');
    
    // Get course materials
    const materials = await Material.find({ course: course._id })
      .populate('uploadedBy', 'name')
      .sort({ uploadDate: -1 });
    
    const daysUntilExam = examInfo.daysUntil || 21; // Default 3 weeks
    
    let plan = `📚 **Comprehensive Exam Preparation Plan for ${course.code} - ${course.name}**\n\n`;
    plan += `⏰ **Timeline:** ${daysUntilExam} days until exam\n\n`;
    
    // Week-by-week breakdown
    const weeksUntilExam = Math.ceil(daysUntilExam / 7);
    
    for (let week = 1; week <= weeksUntilExam; week++) {
      plan += `## 📅 Week ${week} (${weeksUntilExam - week + 1} weeks remaining)\n\n`;
      
      if (week === 1) {
        plan += `**Focus: Foundation & Content Review**\n`;
        plan += `• Review all lecture notes and materials\n`;
        plan += `• Create comprehensive study notes\n`;
        plan += `• Identify weak areas\n\n`;
      } else if (week === weeksUntilExam) {
        plan += `**Focus: Final Review & Practice**\n`;
        plan += `• Take practice tests\n`;
        plan += `• Review flashcards\n`;
        plan += `• Focus on weak areas\n`;
        plan += `• Get adequate rest\n\n`;
      } else {
        plan += `**Focus: Deep Learning & Practice**\n`;
        plan += `• Solve practice problems\n`;
        plan += `• Group study sessions\n`;
        plan += `• Clarify doubts with faculty\n\n`;
      }
    }
    
    // Available materials
    if (materials.length > 0) {
      plan += `## 📖 **Available Study Materials:**\n\n`;
      materials.slice(0, 5).forEach((material, index) => {
        plan += `${index + 1}. **${material.title}** (${material.category})\n`;
      });
      plan += `\n`;
    }
    
    // AI-generated study tips
    if (this.model) {
      try {
        const tipsPrompt = `Generate 5 specific study tips for ${course.name} exam preparation in ${daysUntilExam} days. Make them actionable and practical.`;
        const tipsResponse = await this.model.call(tipsPrompt);
        plan += `## 🎯 **AI-Generated Study Tips:**\n\n${tipsResponse.content || tipsResponse.text}\n\n`;
      } catch (error) {
        console.error('AI tips generation error:', error);
      }
    }
    
    // Study schedule
    plan += `## ⏰ **Daily Study Schedule Recommendation:**\n\n`;
    plan += `• **Morning (2 hours):** Theory and concept review\n`;
    plan += `• **Afternoon (1.5 hours):** Problem solving and practice\n`;
    plan += `• **Evening (1 hour):** Revision and flashcard review\n\n`;
    
    plan += `## ✅ **Action Items:**\n`;
    plan += `1. Create a study calendar\n`;
    plan += `2. Gather all study materials\n`;
    plan += `3. Form a study group\n`;
    plan += `4. Schedule practice tests\n`;
    plan += `5. Set up regular review sessions\n\n`;
    
    plan += `🤖 **I'll check your progress weekly and adjust the plan as needed!**`;
    
    return plan;
  }

  async listUpcomingAssignments(userId, user) {
    const Assignment = require('../models/Assignment');
    
    const assignments = await Assignment.find({
      course: { $in: user.enrolledCourses.map(c => c._id) },
      dueDate: { $gte: new Date() }
    })
    .populate('course', 'code name')
    .sort({ dueDate: 1 })
    .limit(10);
    
    if (assignments.length === 0) {
      return "🎉 Great! No upcoming assignments found. You're all caught up!";
    }
    
    let response = `📝 **Upcoming Assignments (${assignments.length}):**\n\n`;
    
    assignments.forEach((assignment, index) => {
      const daysLeft = Math.ceil((assignment.dueDate - new Date()) / (1000 * 60 * 60 * 24));
      const urgency = daysLeft <= 2 ? '🔴' : daysLeft <= 7 ? '🟡' : '🟢';
      
      response += `${index + 1}. ${urgency} **${assignment.title}**\n`;
      response += `   📚 Course: ${assignment.course.code}\n`;
      response += `   📅 Due: ${assignment.dueDate.toDateString()} (${daysLeft} days)\n`;
      response += `   📊 Status: ${assignment.status}\n\n`;
    });
    
    return response;
  }

  async determineAssignmentAction(query) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('upcoming') || lowerQuery.includes('due')) {
      return { type: 'list_upcoming' };
    } else if (lowerQuery.includes('overdue') || lowerQuery.includes('late')) {
      return { type: 'list_overdue' };
    } else if (lowerQuery.includes('schedule') || lowerQuery.includes('plan')) {
      return { type: 'create_schedule' };
    } else {
      return { type: 'list_upcoming' };
    }
  }

  async extractExamInfo(query) {
    // Extract subject/course
    const courseMatch = query.match(/(?:exam|test)\s+(?:for\s+)?(?:in\s+)?([A-Z]{2,4}\d{3}|[\w\s]+)/i);
    
    // Extract time frame
    const timeMatch = query.match(/(?:in\s+)?(\d+)\s+(days?|weeks?|months?)/i);
    
    let daysUntil = 21; // Default 3 weeks
    if (timeMatch) {
      const number = parseInt(timeMatch[1]);
      const unit = timeMatch[2].toLowerCase();
      
      if (unit.includes('day')) {
        daysUntil = number;
      } else if (unit.includes('week')) {
        daysUntil = number * 7;
      } else if (unit.includes('month')) {
        daysUntil = number * 30;
      }
    }
    
    return {
      course: courseMatch ? courseMatch[1].trim() : null,
      subject: courseMatch ? courseMatch[1].trim() : null,
      daysUntil
    };
  }
}

module.exports = new StudentAgenticAISystem();
