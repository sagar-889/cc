const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
// Use Intelligent Chatbot for advanced AI capabilities
const intelligentChatbot = require('../utils/intelligentChatbot');
const simpleChatbot = require('../utils/simpleChatbot');
const agenticAI = require('../utils/agenticAI');
const advancedAI = require('../utils/advancedAI');
const geminiAI = require('../utils/geminiAI');
const studentAgenticAI = require('../utils/studentAgenticAI');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const Timetable = require('../models/Timetable');
const Event = require('../models/Event');
const Navigation = require('../models/Navigation');
const User = require('../models/User');

// Intelligent Chat endpoint - Advanced AI with thinking and action capabilities
router.post('/intelligent-chat', auth, async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    console.log(`🧠 Intelligent AI processing: "${message}"`);

    // Get user info for context
    const user = await User.findById(req.userId).select('name email department year role enrolledCourses');

    // Enhanced context gathering
    const context = await gatherEnhancedContext(message, req.userId);
    context.user = user;

    // Process with intelligent chatbot, fallback to simple chatbot if error
    let result;
    try {
      result = await intelligentChatbot.processMessage(message, req.userId, context);
    } catch (error) {
      console.log('🔄 Falling back to simple chatbot due to error:', error.message);
      result = await simpleChatbot.processMessage(message, req.userId, context);
      result.fallback = true;
    }

    res.json({
      success: result.success,
      response: result.response,
      analysis: result.analysis,
      actions: result.actions,
      actionResults: result.actionResults,
      conversationId: result.conversationId,
      timestamp: new Date(),
      intelligent: true,
      agentic: true
    });
  } catch (error) {
    console.error('Intelligent chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process intelligent chat',
      error: error.message
    });
  }
});

// Chat endpoint - Enhanced with campus data integration (Fallback)
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    console.log(`🤖 Processing message: "${message}"`);

    // Get user info for context
    const user = await User.findById(req.userId).select('name email department year role enrolledCourses');

    // Enhanced context gathering with campus data
    const context = await gatherEnhancedContext(message, req.userId);
    context.user = user;

    // Enhanced smart routing with better pattern matching
    let response;
    const lowerMessage = message.toLowerCase();
    
    console.log(`🔍 Analyzing message: "${message}"`);
    
    // Priority 1: Course enrollment/unenrollment queries
    if ((lowerMessage.includes('enroll') || lowerMessage.includes('register') || 
         lowerMessage.includes('join') || lowerMessage.includes('take') ||
         lowerMessage.includes('unenroll') || lowerMessage.includes('unregister') ||
         lowerMessage.includes('drop') || lowerMessage.includes('leave') ||
         lowerMessage.includes('withdraw')) && 
        (lowerMessage.includes('course') || lowerMessage.includes('cs') || lowerMessage.includes('22cs') || 
         lowerMessage.includes('me in') || lowerMessage.includes('me for') || lowerMessage.includes('me from') ||
         lowerMessage.match(/\b(\d{2}[A-Z]{2}\d{3}|[A-Z]{2}\d{3})\b/i))) {
      console.log('🎓 Routing to course enrollment/unenrollment handler');
      response = await handleCourseEnrollment(message, user, context);
    } 
    // Priority 2: Faculty and professor queries
    else if ((lowerMessage.includes('find') || lowerMessage.includes('show') || lowerMessage.includes('get')) && 
             (lowerMessage.includes('faculty') || lowerMessage.includes('professor') || 
              lowerMessage.includes('teacher') || lowerMessage.includes('instructor'))) {
      console.log('👨‍🏫 Routing to faculty search handler');
      response = await handleFacultySearch(message, context);
    } 
    // Priority 3: Event-related queries
    else if (lowerMessage.includes('event') || 
             (lowerMessage.includes('register') && !lowerMessage.includes('course')) ||
             lowerMessage.includes('upcoming') || lowerMessage.includes('activity')) {
      console.log('🎉 Routing to event handler');
      response = await handleEventQueries(message, user, context);
    } 
    // Priority 4: Navigation and location queries
    else if (lowerMessage.includes('navigate') || lowerMessage.includes('direction') ||
             lowerMessage.includes('location') || lowerMessage.includes('where is') ||
             lowerMessage.includes('give me directions') || lowerMessage.includes('how to get') ||
             lowerMessage.includes('please navigate') || lowerMessage.includes('directions to') ||
             (lowerMessage.includes('find') && (lowerMessage.includes('building') || 
              lowerMessage.includes('room') || lowerMessage.includes('block'))) ||
             (lowerMessage.includes('to') && (lowerMessage.includes('block') || 
              lowerMessage.includes('library') || lowerMessage.includes('cafeteria')))) {
      console.log('🗺️ Routing to navigation handler');
      response = await handleNavigationQueries(message, context);
    } 
    // Priority 5: Timetable and schedule queries
    else if (lowerMessage.includes('timetable') || lowerMessage.includes('schedule') ||
             lowerMessage.includes('class time') || lowerMessage.includes('when is')) {
      console.log('📅 Routing to timetable handler');
      response = await handleTimetableQueries(message, user, context);
    }
    // Priority 6: Assignment and study help
    else if (lowerMessage.includes('assignment') || lowerMessage.includes('homework') ||
             lowerMessage.includes('study plan') || lowerMessage.includes('exam prep')) {
      console.log('📚 Routing to study assistance');
      response = await handleStudyAssistance(message, user, context);
    }
    // Default: Enhanced general AI response
    else {
      console.log('🤖 Routing to general AI response');
      response = await generateSmartCampusResponse(message, context);
    }

    res.json({
      success: true,
      response,
      context: context.type || 'general',
      timestamp: new Date(),
      agentic: true
    });
  } catch (error) {
    console.error('Agentic Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message
    });
  }
});

// Solve math problems
router.post('/solve-math', auth, async (req, res) => {
  try {
    const { problem } = req.body;

    if (!problem) {
      return res.status(400).json({
        success: false,
        message: 'Math problem is required'
      });
    }

    const solution = await advancedAI.solveMath(problem, req.userId);

    res.json({
      success: true,
      solution,
      problem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to solve math problem',
      error: error.message
    });
  }
});

// Help with coding
router.post('/code-help', auth, async (req, res) => {
  try {
    const { query, code, language } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    const help = await advancedAI.helpWithCode(query, code, language, req.userId);

    res.json({
      success: true,
      help,
      query
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to provide code help',
      error: error.message
    });
  }
});

// Explain concepts
router.post('/explain', auth, async (req, res) => {
  try {
    const { concept, level } = req.body;

    if (!concept) {
      return res.status(400).json({
        success: false,
        message: 'Concept is required'
      });
    }

    const explanation = await advancedAI.explainConcept(concept, level || 'beginner', req.userId);

    res.json({
      success: true,
      explanation,
      concept
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to explain concept',
      error: error.message
    });
  }
});

// Answer questions
router.post('/ask', auth, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    const context = await gatherContext(question, req.userId);
    const answer = await advancedAI.answerQuestion(question, context, req.userId);

    res.json({
      success: true,
      answer,
      question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to answer question',
      error: error.message
    });
  }
});

// Clear conversation history
router.post('/clear-history', auth, async (req, res) => {
  try {
    advancedAI.clearHistory(req.userId);

    res.json({
      success: true,
      message: 'Conversation history cleared'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear history'
    });
  }
});

// Generate study plan
router.post('/study-plan', auth, async (req, res) => {
  try {
    const { topics, timeline } = req.body;
    
    const user = await User.findById(req.userId);
    const timetable = await Timetable.findOne({ user: req.userId })
      .populate('entries.course', 'code name credits');

    let userContext = {
      department: user.department,
      year: user.year,
      semester: user.semester
    };

    // If topics provided, use them; otherwise use enrolled courses
    if (topics) {
      const studyPlan = await advancedAI.generateStudyPlan(
        topics,
        timeline || '1 week',
        userContext,
        req.userId
      );
      return res.json({ success: true, studyPlan });
    }

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'No timetable found. Please provide topics or create a timetable first.'
      });
    }

    const courses = timetable.entries.map(entry => entry.course);
    userContext.courses = courses;

    const studyPlan = await geminiAI.generateStudyPlan(userContext);

    res.json({
      success: true,
      studyPlan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate study plan',
      error: error.message
    });
  }
});

// Voice query endpoint
router.post('/voice', auth, async (req, res) => {
  try {
    const { query, transcript } = req.body;
    const message = query || transcript;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Voice query is required'
      });
    }

    const user = await User.findById(req.userId).select('name email department year role enrolledCourses');
    const context = await gatherContext(message, req.userId);
    context.user = user;

    // Enhanced voice routing with student-specific agents
    console.log(`🎤 Voice query: "${message}" for user ${user.name}`);
    let response;
    
    // Check for student-specific voice actions
    if (user.role === 'student') {
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('register') && lowerMessage.includes('event')) {
        response = await studentAgenticAI.handleEventRegistration(message, req.userId);
      } else if (lowerMessage.includes('find') && (lowerMessage.includes('material') || lowerMessage.includes('notes'))) {
        response = await studentAgenticAI.findStudyMaterials(message, req.userId);
      } else if (lowerMessage.includes('assignment')) {
        response = await studentAgenticAI.manageAssignments(message, req.userId);
      } else if (lowerMessage.includes('exam') && (lowerMessage.includes('prep') || lowerMessage.includes('study'))) {
        response = await studentAgenticAI.automateExamPrep(message, req.userId);
      } else {
        response = await agenticAI.routeQuery(message, context, req.userId);
      }
    } else {
      response = await agenticAI.routeQuery(message, context, req.userId);
    }

    res.json({
      success: true,
      response,
      voiceEnabled: true,
      transcript: message,
      agentic: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process voice query',
      error: error.message
    });
  }
});

// Helper function to gather context
async function gatherContext(query, userId) {
  const lowerQuery = query.toLowerCase();
  let context = { type: 'general' };

  try {
    // Timetable context
    if (lowerQuery.includes('timetable') || lowerQuery.includes('schedule') || lowerQuery.includes('class')) {
      const timetable = await Timetable.findOne({ user: userId })
        .populate('entries.course', 'code name');
      
      if (timetable) {
        context.type = 'timetable';
        context.data = timetable.entries;
      }
    }

    // Course context
    if (lowerQuery.includes('course')) {
      const courses = await Course.find().limit(5);
      context.type = 'courses';
      context.data = courses;
    }

    // Faculty context
    if (lowerQuery.includes('faculty') || lowerQuery.includes('professor') || lowerQuery.includes('teacher')) {
      const faculty = await Faculty.find().limit(5);
      context.type = 'faculty';
      context.data = faculty;
    }

    // Event context
    if (lowerQuery.includes('event') || lowerQuery.includes('fest') || lowerQuery.includes('workshop')) {
      const events = await Event.find({ status: 'upcoming' }).limit(5);
      context.type = 'events';
      context.data = events;
    }

    // Navigation context
    if (lowerQuery.includes('where') || lowerQuery.includes('location') || lowerQuery.includes('find')) {
      const locations = await Navigation.find().limit(5);
      context.type = 'navigation';
      context.data = locations;
    }
  } catch (error) {
    console.error('Context gathering error:', error);
  }

  return context;
}

// Enhanced context gathering with real campus data
async function gatherEnhancedContext(message, userId) {
  const context = {
    courses: [],
    faculty: [],
    events: [],
    navigation: [],
    user: null
  };

  try {
    // Get relevant courses
    const courses = await Course.find({}).limit(10);
    context.courses = courses;

    // Get faculty info
    const faculty = await Faculty.find({}).limit(10);
    context.faculty = faculty;

    // Get upcoming events
    const events = await Event.find({ 
      startDate: { $gte: new Date() } 
    }).limit(5);
    context.events = events;

    // Get navigation points
    const navigation = await Navigation.find({}).limit(10);
    context.navigation = navigation;

  } catch (error) {
    console.error('Context gathering error:', error);
  }

  return context;
}

// Handle course enrollment/unenrollment queries
async function handleCourseEnrollment(message, user, context) {
  const lowerMessage = message.toLowerCase();
  const courseCode = extractCourseCode(message);
  
  // Check if user is asking to UNENROLL from a course
  if (lowerMessage.includes('unenroll') || lowerMessage.includes('unregister') || 
      lowerMessage.includes('drop') || lowerMessage.includes('leave') || 
      lowerMessage.includes('withdraw') || lowerMessage.includes('me from')) {
    
    let targetCourse = null;
    
    if (courseCode) {
      targetCourse = context.courses.find(c => 
        c.code.toLowerCase().includes(courseCode.toLowerCase())
      );
    } else {
      // Try to find course by name or partial match
      const courseKeywords = ['cs101', 'cs406', '22cs406', 'privacy', 'intrusion', 'detection'];
      for (const keyword of courseKeywords) {
        if (lowerMessage.includes(keyword)) {
          targetCourse = context.courses.find(c => 
            c.code.toLowerCase().includes(keyword) || 
            c.name.toLowerCase().includes(keyword)
          );
          if (targetCourse) break;
        }
      }
    }
    
    if (targetCourse) {
      try {
        // Perform actual unenrollment
        const unenrollmentResult = await performCourseUnenrollment(user._id, targetCourse._id);
        
        if (unenrollmentResult.success) {
          return `✅ **Unenrollment Successful!** 

🎓 You have been successfully unenrolled from:
📚 **${targetCourse.code} - ${targetCourse.name}**

📋 **Course Details:**
- **Department:** ${targetCourse.department}
- **Credits:** ${targetCourse.credits}
- **Status:** No longer enrolled

📅 **What happens next:**
• Course removed from your timetable
• Access to course materials may be restricted
• You can re-enroll during the next registration period

💡 **Need help?** You can:
• Browse other available courses
• Check your updated timetable
• Contact Academic Office for questions

Would you like me to show you other available courses?`;
        } else {
          return `❌ **Unenrollment Failed**

Sorry, I couldn't unenroll you from ${targetCourse.code} - ${targetCourse.name}.

**Possible reasons:**
• You may not be enrolled in this course
• Unenrollment period may be closed
• Course may have attendance/grade requirements
• Technical issue occurred

💡 **What to do:**
• Check your current enrollments
• Contact the Academic Office for assistance
• Verify unenrollment deadlines

Would you like me to help you with anything else?`;
        }
      } catch (error) {
        console.error('Unenrollment error:', error);
        return `❌ **Technical Error**

Sorry, there was a technical issue while trying to unenroll you from ${targetCourse.code}.

🔧 **Please try:**
• Refreshing the page and trying again
• Using the manual unenrollment in the Courses section
• Contacting technical support

Would you like me to help you with other courses?`;
      }
    } else {
      return `🔍 **Course Not Found for Unenrollment**

I couldn't find a course matching "${courseCode || 'your request'}" to unenroll from.

📚 **Your Current Enrollments:**
${user.enrolledCourses ? 'Loading your enrolled courses...' : 'No enrollments found'}

💡 **Try saying:** "Unenroll me from 22CS406" or "Drop CS101"

Which course would you like to unenroll from?`;
    }
  }
  
  // Check if user is asking to ENROLL in a specific course
  else if (courseCode || lowerMessage.includes('enroll me in') || lowerMessage.includes('register me for')) {
    let targetCourse = null;
    
    if (courseCode) {
      targetCourse = context.courses.find(c => 
        c.code.toLowerCase().includes(courseCode.toLowerCase())
      );
    } else {
      // Try to find course by name or partial match
      const courseKeywords = ['cs101', 'cs406', '22cs406', 'privacy', 'intrusion', 'detection'];
      for (const keyword of courseKeywords) {
        if (lowerMessage.includes(keyword)) {
          targetCourse = context.courses.find(c => 
            c.code.toLowerCase().includes(keyword) || 
            c.name.toLowerCase().includes(keyword)
          );
          if (targetCourse) break;
        }
      }
    }
    
    if (targetCourse) {
      try {
        // Perform actual enrollment
        const enrollmentResult = await performCourseEnrollment(user._id, targetCourse._id);
        
        if (enrollmentResult.success) {
          return `🎉 **Enrollment Successful!** 

✅ You have been successfully enrolled in:
📚 **${targetCourse.code} - ${targetCourse.name}**

📋 **Course Details:**
- **Department:** ${targetCourse.department}
- **Credits:** ${targetCourse.credits}
- **Faculty:** ${targetCourse.faculty || 'TBA'}
- **Description:** ${targetCourse.description || 'Course description available in syllabus'}

📅 **Next Steps:**
• Check your timetable for class schedule
• Download course materials from the materials section
• Contact faculty for any course-specific queries

🎓 **Need help with anything else?** Try asking about your timetable, course materials, or other available courses!`;
        } else {
          return `❌ **Enrollment Failed**

Sorry, I couldn't enroll you in ${targetCourse.code} - ${targetCourse.name}.

**Possible reasons:**
• Course may be full (${targetCourse.enrolledStudents || 0}/${targetCourse.maxStudents || 'N/A'} students)
• Prerequisites not met
• Registration period may be closed
• You may already be enrolled

💡 **What to do:**
• Contact the Academic Office for assistance
• Check your current enrollments
• Verify course prerequisites

Would you like me to help you find other available courses?`;
        }
      } catch (error) {
        console.error('Enrollment error:', error);
        return `❌ **Technical Error**

Sorry, there was a technical issue while trying to enroll you in ${targetCourse.code}.

🔧 **Please try:**
• Refreshing the page and trying again
• Using the manual enrollment in the Courses section
• Contacting technical support

Would you like me to show you other available courses instead?`;
      }
    } else {
      return `🔍 **Course Not Found**

I couldn't find a course matching "${courseCode || 'your request'}".

📚 **Available Courses:**
${context.courses.slice(0, 5).map(c => 
  `• **${c.code}** - ${c.name} (${c.department})`
).join('\n')}

💡 **Try saying:** "Enroll me in 22CS406" or "Register me for CS101"

Which course would you like to enroll in?`;
    }
  }
  
  // General enrollment help
  const availableCourses = context.courses.slice(0, 5).map(c => 
    `• **${c.code}** - ${c.name} (${c.department})`
  ).join('\n');
  
  return `🎓 **Course Enrollment Assistant**

I can help you enroll in courses! Here are available courses:

${availableCourses}

💡 **To enroll, say:**
• "Enroll me in 22CS406"
• "Register me for CS101"
• "I want to join [course code]"

📋 **I can also help with:**
• Course information and details
• Prerequisites and requirements
• Faculty information
• Class schedules

Which course would you like to enroll in?`;
}

// Perform actual course enrollment
async function performCourseEnrollment(userId, courseId) {
  try {
    // Check if user is already enrolled
    const user = await User.findById(userId);
    if (user.enrolledCourses && user.enrolledCourses.includes(courseId)) {
      return {
        success: false,
        message: 'Already enrolled in this course'
      };
    }

    // Check course capacity
    const course = await Course.findById(courseId);
    if (course.enrolledStudents && course.maxStudents && 
        course.enrolledStudents.length >= course.maxStudents) {
      return {
        success: false,
        message: 'Course is full'
      };
    }

    // Enroll user in course
    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId }
    });

    // Add user to course enrollment
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: userId }
    });

    return {
      success: true,
      message: 'Enrollment successful'
    };
  } catch (error) {
    console.error('Enrollment process error:', error);
    return {
      success: false,
      message: 'Technical error during enrollment'
    };
  }
}

// Perform actual course unenrollment
async function performCourseUnenrollment(userId, courseId) {
  try {
    // Check if user is actually enrolled
    const user = await User.findById(userId);
    if (!user.enrolledCourses || !user.enrolledCourses.includes(courseId)) {
      return {
        success: false,
        message: 'Not enrolled in this course'
      };
    }

    // Remove user from course enrollment
    await User.findByIdAndUpdate(userId, {
      $pull: { enrolledCourses: courseId }
    });

    // Remove user from course's enrolled students list
    await Course.findByIdAndUpdate(courseId, {
      $pull: { enrolledStudents: userId }
    });

    return {
      success: true,
      message: 'Unenrollment successful'
    };
  } catch (error) {
    console.error('Unenrollment process error:', error);
    return {
      success: false,
      message: 'Technical error during unenrollment'
    };
  }
}

// Handle faculty search queries
async function handleFacultySearch(message, context) {
  const facultyList = context.faculty.slice(0, 5).map(f => 
    `👨‍🏫 **${f.name}**\n   📧 ${f.email}\n   🏢 ${f.department}\n   📍 Office: ${f.office || 'N/A'}\n`
  ).join('\n');
  
  return `Here are our faculty members:\n\n${facultyList}\nWould you like more information about any specific faculty member?`;
}

// Handle event queries
async function handleEventQueries(message, user, context) {
  if (context.events.length === 0) {
    return "Currently, there are no upcoming events scheduled. Please check back later or contact the student activities office for more information.";
  }
  
  const eventList = context.events.map(e => 
    `🎉 **${e.title}**\n   📅 ${new Date(e.startDate).toLocaleDateString()}\n   📍 ${e.location}\n   👥 Organizer: ${e.organizer}\n`
  ).join('\n');
  
  return `Here are the upcoming events:\n\n${eventList}\nWould you like to register for any of these events?`;
}

// Handle navigation queries
async function handleNavigationQueries(message, context) {
  const lowerMessage = message.toLowerCase();
  
  // Extract specific location requests
  const locationKeywords = {
    'a block': 'A-Block',
    'a-block': 'A-Block', 
    'block a': 'A-Block',
    'h block': 'H-Block',
    'h-block': 'H-Block',
    'block h': 'H-Block',
    'n block': 'N-Block',
    'n-block': 'N-Block',
    'block n': 'N-Block',
    'u block': 'U-Block',
    'u-block': 'U-Block',
    'block u': 'U-Block',
    'pharmacy': 'Pharmacy Block',
    'library': 'Library',
    'cafeteria': 'Cafeteria',
    'canteen': 'Cafeteria',
    'main building': 'Main Building',
    'admin': 'Administrative Block',
    'office': 'Administrative Block'
  };

  // Check if user is asking for directions to a specific location
  let targetLocation = null;
  for (const [keyword, location] of Object.entries(locationKeywords)) {
    if (lowerMessage.includes(keyword)) {
      targetLocation = location;
      break;
    }
  }

  if (targetLocation) {
    return getDirectionsTo(targetLocation);
  }

  // If no specific location found, show available locations
  const locations = [
    { name: 'A-Block', description: 'Main academic block with classrooms and laboratories' },
    { name: 'H-Block', description: 'Academic block with specialized laboratories and classrooms' },
    { name: 'N-Block', description: 'Academic and administrative block' },
    { name: 'U-Block', description: 'University administrative offices' },
    { name: 'Pharmacy Block', description: 'Vignan Pharmacy College building with specialized pharmaceutical laboratories' },
    { name: 'Library', description: 'Central library with books, digital resources, and study areas' },
    { name: 'Cafeteria', description: 'Main dining area and food court' },
    { name: 'Administrative Block', description: 'Main administrative offices and student services' }
  ];

  const locationList = locations.map(l => 
    `📍 **${l.name}**\n   ℹ️ ${l.description}\n`
  ).join('\n');
  
  return `🗺️ **Campus Locations Available:**\n\n${locationList}\n💡 **Get Directions:** Say "directions to A-Block" or "navigate to library" for step-by-step directions!`;
}

// Get specific directions to a location
function getDirectionsTo(location) {
  const directions = {
    'A-Block': {
      icon: '🏢',
      steps: [
        '1. 🚪 Exit the main entrance of your current building',
        '2. 🚶‍♂️ Head towards the central courtyard',
        '3. ➡️ Turn right at the main pathway',
        '4. 🏢 A-Block will be the large building on your left',
        '5. 🚪 Main entrance is facing the courtyard'
      ],
      landmarks: ['Central courtyard', 'Main pathway', 'Student parking area'],
      time: '3-5 minutes walk',
      facilities: 'Classrooms, Computer Labs, Faculty Offices'
    },
    'H-Block': {
      icon: '🔬',
      steps: [
        '1. 🚪 Start from the main entrance',
        '2. 🚶‍♂️ Walk straight towards the academic complex',
        '3. ⬅️ Turn left at the first intersection',
        '4. 🔬 H-Block is the building with specialized labs',
        '5. 🚪 Enter through the main lab entrance'
      ],
      landmarks: ['Academic complex', 'Lab equipment visible through windows'],
      time: '4-6 minutes walk',
      facilities: 'Specialized Laboratories, Research Centers, Classrooms'
    },
    'N-Block': {
      icon: '🏛️',
      steps: [
        '1. 🚪 Exit towards the administrative area',
        '2. 🚶‍♂️ Follow the main road',
        '3. ➡️ Turn right at the administrative junction',
        '4. 🏛️ N-Block is the academic and admin building',
        '5. 🚪 Multiple entrances available'
      ],
      landmarks: ['Administrative junction', 'Flag pole area'],
      time: '5-7 minutes walk',
      facilities: 'Academic Offices, Administrative Services, Meeting Rooms'
    },
    'U-Block': {
      icon: '🏢',
      steps: [
        '1. 🚪 Head towards the university administrative area',
        '2. 🚶‍♂️ Walk along the main campus road',
        '3. ⬅️ Turn left at the university signboard',
        '4. 🏢 U-Block is the administrative building',
        '5. 🚪 Main reception entrance'
      ],
      landmarks: ['University signboard', 'Administrative parking'],
      time: '6-8 minutes walk',
      facilities: 'University Administration, Student Services, Records Office'
    },
    'Pharmacy Block': {
      icon: '💊',
      steps: [
        '1. 🚪 Exit towards the pharmacy college area',
        '2. 🚶‍♂️ Follow signs to Vignan Pharmacy College',
        '3. ➡️ Turn right at the pharmacy signboard',
        '4. 💊 Pharmacy Block with specialized labs',
        '5. 🚪 Main entrance with college signage'
      ],
      landmarks: ['Pharmacy college signboard', 'Specialized lab equipment'],
      time: '7-10 minutes walk',
      facilities: 'Pharmaceutical Laboratories, Research Centers, Classrooms'
    },
    'Library': {
      icon: '📚',
      steps: [
        '1. 🚪 Head towards the central campus area',
        '2. 🚶‍♂️ Walk to the main academic complex',
        '3. ⬆️ Look for the library signage',
        '4. 📚 Central Library building',
        '5. 🚪 Main entrance with book return drop'
      ],
      landmarks: ['Library signage', 'Book return drop box', 'Reading area windows'],
      time: '3-5 minutes walk',
      facilities: 'Books, Digital Resources, Study Rooms, Computer Access'
    },
    'Cafeteria': {
      icon: '🍽️',
      steps: [
        '1. 🚪 Exit towards the student common area',
        '2. 🚶‍♂️ Follow the aroma of food!',
        '3. ➡️ Turn towards the dining area',
        '4. 🍽️ Cafeteria with outdoor seating',
        '5. 🚪 Multiple entrances available'
      ],
      landmarks: ['Outdoor seating area', 'Food aroma', 'Student gathering area'],
      time: '2-4 minutes walk',
      facilities: 'Food Court, Dining Area, Vending Machines, Outdoor Seating'
    },
    'Administrative Block': {
      icon: '🏛️',
      steps: [
        '1. 🚪 Head towards the main administrative area',
        '2. 🚶‍♂️ Follow the main campus pathway',
        '3. ⬅️ Turn left at the admin signboard',
        '4. 🏛️ Administrative Block - main office building',
        '5. 🚪 Reception entrance with information desk'
      ],
      landmarks: ['Admin signboard', 'Information desk', 'Official notices board'],
      time: '4-6 minutes walk',
      facilities: 'Student Services, Admissions, Finance Office, Principal Office'
    }
  };

  const dir = directions[location];
  if (!dir) {
    return `❌ Sorry, I don't have specific directions to "${location}". Please ask for directions to: A-Block, H-Block, N-Block, U-Block, Pharmacy Block, Library, Cafeteria, or Administrative Block.`;
  }

  const stepsList = dir.steps.map(step => `   ${step}`).join('\n');
  const landmarksList = dir.landmarks.map(landmark => `• ${landmark}`).join('\n');

  return `🧭 **Directions to ${location}** ${dir.icon}

📍 **Step-by-Step Directions:**
${stepsList}

🗺️ **Key Landmarks:**
${landmarksList}

⏱️ **Estimated Time:** ${dir.time}
🏢 **Facilities Available:** ${dir.facilities}

💡 **Need help?** Look for campus signage or ask any student/staff member for assistance!

🔄 **Want directions to another location?** Just ask "directions to [location name]"`;
}

// Handle timetable queries
async function handleTimetableQueries(message, user, context) {
  return `I can help you with your timetable! Your current courses:\n\n${context.courses.slice(0, 3).map(c => 
    `📚 ${c.code} - ${c.name}\n   🕐 ${c.schedule?.time || 'Time TBA'}\n   📍 ${c.schedule?.room || 'Room TBA'}`
  ).join('\n\n')}\n\nWould you like to see your full schedule or add/drop courses?`;
}

// Handle study assistance queries
async function handleStudyAssistance(message, user, context) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('assignment')) {
    return `📝 **Assignment Help Available!**\n\n**I can help you with:**\n• Assignment content generation\n• Research and writing guidance\n• IEEE/APA formatting\n• Deadline management\n• Progress tracking\n\n**AI Features:**\n• Generate assignment outlines\n• Create content based on requirements\n• Format in academic standards\n• Provide research suggestions\n\nWhat specific assignment help do you need? Try saying "generate assignment content" or "help with my project".`;
  }
  
  if (lowerMessage.includes('study plan')) {
    return `📚 **AI Study Plan Generator!**\n\n**Personalized Study Plans:**\n• Custom schedules based on your courses\n• Adaptive learning strategies\n• Progress tracking and analytics\n• Exam preparation timelines\n\n**Smart Features:**\n• Analyzes your learning style\n• Optimizes study sessions\n• Tracks completion rates\n• Provides improvement suggestions\n\nWould you like me to create a study plan for you? Just tell me which subjects you're focusing on!`;
  }
  
  if (lowerMessage.includes('exam prep')) {
    return `🎯 **AI Exam Preparation Coach!**\n\n**Comprehensive Exam Support:**\n• Personalized study schedules\n• Topic-wise preparation plans\n• Practice question generation\n• Performance analytics\n\n**Preparation Features:**\n• Create study timetables\n• Track topic mastery\n• Generate practice tests\n• Provide study techniques\n\nWhich exam are you preparing for? I can create a detailed preparation plan for you!`;
  }
  
  return `📚 **Study Assistance Hub!**\n\n**Available Services:**\n• 📝 **Assignment Help** - Content generation and guidance\n• 📊 **Study Plans** - Personalized learning schedules\n• 🎯 **Exam Prep** - Comprehensive preparation strategies\n• 🔍 **Research Help** - Find relevant materials and resources\n\n**AI-Powered Features:**\n• Smart content generation\n• Adaptive learning plans\n• Progress tracking\n• Performance analytics\n\nWhat study assistance do you need today?`;
}

// Extract course code from message
function extractCourseCode(message) {
  const coursePattern = /\b(\d{2}[A-Z]{2}\d{3}|[A-Z]{2}\d{3})\b/i;
  const match = message.match(coursePattern);
  return match ? match[0] : null;
}

// Generate smart campus response for general queries
async function generateSmartCampusResponse(message, context) {
  const lowerMessage = message.toLowerCase();
  
  // Greeting responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! 👋 I'm your Campus Companion AI assistant. I can help you with courses, faculty information, events, campus navigation, and more. What would you like to know?";
  }
  
  // Help queries
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return "I'm your Campus Companion AI! 🤖 I can help you with:\n\n🎓 **Academic Services:**\n• Course enrollment and information\n• Faculty contacts and office hours\n• Timetable management\n\n🎉 **Campus Life:**\n• Upcoming events and registration\n• Campus navigation and locations\n• Student activities\n\n💡 **Smart Features:**\n• AI-powered study plans\n• Assignment help\n• Exam preparation\n\nJust ask me anything about your campus life!";
  }
  
  // Study and academic help
  if (lowerMessage.includes('study') || lowerMessage.includes('homework') || lowerMessage.includes('assignment')) {
    return "📚 I can help you with your studies! I offer:\n\n• **AI Study Plans** - Personalized learning schedules\n• **Assignment Help** - Content generation and guidance\n• **Exam Preparation** - Study strategies and materials\n• **Course Materials** - Find relevant resources\n\nWhat specific academic help do you need?";
  }
  
  // Navigation and location queries
  if (lowerMessage.includes('where') || lowerMessage.includes('location') || lowerMessage.includes('find') || lowerMessage.includes('navigate')) {
    return "🗺️ I can help you navigate the campus! I can assist with:\n\n• **Building Locations** - Find any campus building\n• **Room Numbers** - Locate specific classrooms\n• **Facilities** - Library, cafeteria, labs, etc.\n• **Directions** - Step-by-step navigation\n\nWhere would you like to go?";
  }
  
  // Course-related queries
  if (lowerMessage.includes('course') || lowerMessage.includes('class') || lowerMessage.includes('subject')) {
    const courseCount = context.courses?.length || 0;
    return `🎓 I can help you with course information! We have ${courseCount} courses available.\n\n**I can help you:**\n• Enroll in courses (e.g., "enroll me in CS101")\n• Find courses by department\n• Get course details and schedules\n• Check prerequisites\n\nWhat course information do you need?`;
  }
  
  // Faculty and professor queries
  if (lowerMessage.includes('faculty') || lowerMessage.includes('professor') || lowerMessage.includes('teacher') || lowerMessage.includes('instructor')) {
    const facultyCount = context.faculty?.length || 0;
    return `👨‍🏫 I can help you find faculty information! We have ${facultyCount} faculty members.\n\n**I can provide:**\n• Faculty contact information\n• Office hours and locations\n• Department affiliations\n• Course assignments\n\nWhich faculty member are you looking for?`;
  }
  
  // Event-related queries
  if (lowerMessage.includes('event') || lowerMessage.includes('activity') || lowerMessage.includes('program')) {
    const eventCount = context.events?.length || 0;
    return `🎉 I can help you with campus events! We have ${eventCount} upcoming events.\n\n**Event Services:**\n• View upcoming events\n• Register for activities\n• Get event details\n• Find events by category\n\nWhat events are you interested in?`;
  }
  
  // Timetable and schedule queries
  if (lowerMessage.includes('timetable') || lowerMessage.includes('schedule') || lowerMessage.includes('time')) {
    return "📅 I can help you with your schedule!\n\n**Schedule Services:**\n• View your current timetable\n• Add or drop classes\n• Check for conflicts\n• Get class timings\n\nWhat would you like to know about your schedule?";
  }
  
  // AI and smart features
  if (lowerMessage.includes('ai') || lowerMessage.includes('smart') || lowerMessage.includes('intelligent')) {
    return "🤖 I'm powered by advanced AI! Here are my smart features:\n\n**🎯 Goal Achievement System:**\n• Set and track academic goals\n• AI-generated action plans\n• Automated progress tracking\n\n**📝 Study Assistance:**\n• Personalized study plans\n• Assignment content generation\n• Exam preparation strategies\n\n**🔍 Smart Search:**\n• Intelligent material finder\n• Event recommendations\n• Course suggestions\n\nWhich AI feature interests you?";
  }
  
  // Campus navigation specific
  if (lowerMessage.includes('campus navigation') || lowerMessage.includes('navigate to')) {
    return "🧭 **Campus Navigation Active!**\n\nI can help you navigate to:\n• **Academic Buildings** (A, B, C blocks)\n• **Laboratories** (Computer, Physics, Chemistry)\n• **Administrative Offices**\n• **Library and Study Areas**\n• **Cafeteria and Recreation**\n• **Parking Areas**\n\nWhere would you like to go? Just say something like 'navigate to A block' or 'find the library'.";
  }
  
  // Specific campus queries
  if (lowerMessage.includes('library')) {
    return "📚 **Library Information:**\n\n• **Location:** Central Campus Building\n• **Hours:** 8:00 AM - 8:00 PM (Mon-Fri)\n• **Services:** Books, Digital Resources, Study Rooms\n• **Contact:** library@campus.edu\n\nWould you like directions to the library or information about specific resources?";
  }
  
  if (lowerMessage.includes('cafeteria') || lowerMessage.includes('food') || lowerMessage.includes('canteen')) {
    return "🍽️ **Cafeteria Information:**\n\n• **Location:** Ground Floor, Main Building\n• **Hours:** 7:00 AM - 7:00 PM\n• **Menu:** Breakfast, Lunch, Snacks, Beverages\n• **Payment:** Cash and Card accepted\n\nWould you like directions to the cafeteria or today's menu?";
  }
  
  // Exam and test queries
  if (lowerMessage.includes('exam') || lowerMessage.includes('test') || lowerMessage.includes('quiz')) {
    return "📝 **Exam Assistance:**\n\n**I can help you with:**\n• Exam schedules and dates\n• Study plan creation\n• Preparation strategies\n• Practice materials\n• Time management tips\n\nWhat exam support do you need?";
  }
  
  // Assignment and homework help
  if (lowerMessage.includes('assignment') || lowerMessage.includes('homework') || lowerMessage.includes('project')) {
    return "📋 **Assignment Help:**\n\n**Available Services:**\n• Assignment content generation\n• Research guidance\n• Formatting assistance (IEEE, APA)\n• Deadline management\n• Progress tracking\n\nWhat assignment help do you need?";
  }
  
  // Admission and enrollment
  if (lowerMessage.includes('admission') || lowerMessage.includes('enroll') || lowerMessage.includes('register')) {
    return "🎓 **Admission & Enrollment:**\n\n**I can help with:**\n• Course enrollment process\n• Admission requirements\n• Document submission\n• Fee information\n• Academic calendar\n\nWhat enrollment information do you need?";
  }
  
  // Technical support
  if (lowerMessage.includes('technical') || lowerMessage.includes('support') || lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
    return "🔧 **Technical Support:**\n\n**Common Issues:**\n• Login problems\n• Password reset\n• System access\n• File upload issues\n• Account problems\n\nDescribe your technical issue and I'll help you resolve it!";
  }
  
  // Specific question patterns
  if (lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('when') || lowerMessage.includes('where') || lowerMessage.includes('why')) {
    return "🤔 I'd be happy to help answer your question! I can provide information about:\n\n• **Academic matters** (courses, schedules, faculty)\n• **Campus services** (library, cafeteria, facilities)\n• **Student activities** (events, clubs, programs)\n• **Technical support** (system issues, account help)\n• **Navigation** (building locations, directions)\n\nCould you be more specific about what you'd like to know?";
  }
  
  // Fallback with suggestions based on context
  const suggestions = [];
  if (context.courses?.length > 0) suggestions.push("📚 Browse available courses");
  if (context.events?.length > 0) suggestions.push("🎉 Check upcoming events");
  if (context.faculty?.length > 0) suggestions.push("👨‍🏫 Find faculty information");
  
  const suggestionText = suggestions.length > 0 ? 
    `\n\n**Quick suggestions:**\n${suggestions.map(s => `• ${s}`).join('\n')}` : 
    '\n\n**Try asking:** "show me courses", "upcoming events", or "find faculty"';
  
  return `I'm here to help with your campus needs! 🎓 I can assist with courses, faculty information, events, campus navigation, AI study plans, and much more.${suggestionText}\n\nWhat would you like to know about?`;
}

// Actual course enrollment function (matches existing courses API)
async function performCourseEnrollment(userId, courseId) {
  try {
    console.log(`🎓 Attempting to enroll user ${userId} in course ${courseId}`);
    
    // Convert IDs to strings for comparison
    const userIdStr = userId.toString();
    const courseIdStr = courseId.toString();
    
    // Find the course
    const course = await Course.findById(courseIdStr);
    if (!course) {
      console.log(`❌ Course not found: ${courseIdStr}`);
      return { success: false, message: 'Course not found' };
    }
    
    console.log(`📚 Found course: ${course.code} - ${course.name}`);
    console.log(`👥 Current enrolled students:`, course.enrolledStudents?.map(id => id.toString()) || []);
    
    // Initialize enrolledStudents array if it doesn't exist
    if (!course.enrolledStudents) {
      course.enrolledStudents = [];
    }
    
    // Check if user is already enrolled (convert all IDs to strings for comparison)
    const isAlreadyEnrolled = course.enrolledStudents.some(id => id.toString() === userIdStr);
    
    if (isAlreadyEnrolled) {
      console.log(`❌ User ${userIdStr} is already enrolled in course ${course.code}`);
      return { success: false, message: 'Already enrolled in this course' };
    }
    
    // Check if course is full
    if (course.maxStudents && course.enrolledStudents.length >= course.maxStudents) {
      console.log(`❌ Course ${course.code} is full: ${course.enrolledStudents.length}/${course.maxStudents}`);
      return { success: false, message: 'Course is full' };
    }
    
    // Add user to course's enrolled students
    const originalCount = course.enrolledStudents.length;
    course.enrolledStudents.push(userId);
    
    // Save the course
    await course.save();
    
    const newCount = course.enrolledStudents.length;
    console.log(`📊 Enrollment count: ${originalCount} → ${newCount}`);
    console.log(`✅ Successfully enrolled user ${userIdStr} in course ${course.code}`);
    
    return { 
      success: true, 
      message: 'Successfully enrolled in course',
      course: course
    };
  } catch (error) {
    console.error('Course enrollment error:', error);
    console.error('Error stack:', error.stack);
    return { 
      success: false, 
      message: 'Technical error during enrollment',
      error: error.message 
    };
  }
}

// Actual course unenrollment function (matches existing courses API)
async function performCourseUnenrollment(userId, courseId) {
  try {
    console.log(`🎓 Attempting to unenroll user ${userId} from course ${courseId}`);
    
    // Convert IDs to strings for comparison
    const userIdStr = userId.toString();
    const courseIdStr = courseId.toString();
    
    // Find the course
    const course = await Course.findById(courseIdStr);
    if (!course) {
      console.log(`❌ Course not found: ${courseIdStr}`);
      return { success: false, message: 'Course not found' };
    }
    
    console.log(`📚 Found course: ${course.code} - ${course.name}`);
    console.log(`👥 Current enrolled students:`, course.enrolledStudents?.map(id => id.toString()) || []);
    
    // Initialize enrolledStudents array if it doesn't exist
    if (!course.enrolledStudents) {
      course.enrolledStudents = [];
    }
    
    // Check if user is enrolled (convert all IDs to strings for comparison)
    const isEnrolled = course.enrolledStudents.some(id => id.toString() === userIdStr);
    
    if (!isEnrolled) {
      console.log(`❌ User ${userIdStr} is not enrolled in course ${course.code}`);
      return { success: false, message: 'Not enrolled in this course' };
    }
    
    // Remove user from course's enrolled students
    const originalCount = course.enrolledStudents.length;
    course.enrolledStudents = course.enrolledStudents.filter(
      id => id.toString() !== userIdStr
    );
    
    const newCount = course.enrolledStudents.length;
    console.log(`📊 Enrollment count: ${originalCount} → ${newCount}`);
    
    // Save the course
    await course.save();
    
    console.log(`✅ Successfully unenrolled user ${userIdStr} from course ${course.code}`);
    
    return { 
      success: true, 
      message: 'Successfully unenrolled from course',
      course: course
    };
  } catch (error) {
    console.error('Course unenrollment error:', error);
    console.error('Error stack:', error.stack);
    return { 
      success: false, 
      message: 'Technical error during unenrollment',
      error: error.message 
    };
  }
}

module.exports = router;
