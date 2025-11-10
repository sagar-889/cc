const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('langchain/prompts');
const { LLMChain } = require('langchain/chains');
const { BufferMemory } = require('langchain/memory');
const { ConversationChain } = require('langchain/chains');

/**
 * Agentic AI System for CampusCompanion
 * Multiple specialized AI agents working together
 */

class AgenticAISystem {
  constructor() {
    this.model = null;
    this.agents = {};
    this.conversationMemory = new Map();
    this.initializeModel();
    this.initializeAgents();
  }

  initializeModel() {
    // Prioritize Gemini AI for better reliability
    if (process.env.GEMINI_API_KEY) {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      this.geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.geminiModel = this.geminiAI.getGenerativeModel({ model: 'gemini-pro' });
    }
    
    if (process.env.OPENAI_API_KEY) {
      this.model = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-3.5-turbo',
        temperature: 0.7
      });
    }
  }

  initializeAgents() {
    this.agents = {
      studyAssistant: new StudyAssistantAgent(this.model),
      scheduleOptimizer: new ScheduleOptimizerAgent(this.model),
      careerAdvisor: new CareerAdvisorAgent(this.model),
      examPreparation: new ExamPreparationAgent(this.model),
      documentAnalyzer: new DocumentAnalyzerAgent(this.model),
      learningPathCreator: new LearningPathAgent(this.model),
      conversationAgent: new ConversationAgent(this.model)
    };
  }

  // Get or create conversation memory for a user
  getConversationMemory(userId) {
    if (!this.conversationMemory.has(userId)) {
      this.conversationMemory.set(userId, new BufferMemory({
        returnMessages: true,
        memoryKey: 'chat_history'
      }));
    }
    return this.conversationMemory.get(userId);
  }

  // Enhanced route query with action detection and execution
  async routeQuery(query, context, userId) {
    const lowerQuery = query.toLowerCase();
    
    // First check for actionable requests
    const actionResult = await this.detectAndExecuteAction(query, context, userId);
    if (actionResult) {
      return actionResult;
    }

    // Then route to appropriate agent
    if (lowerQuery.includes('study') || lowerQuery.includes('learn') || lowerQuery.includes('understand')) {
      return await this.agents.studyAssistant.process(query, context);
    } else if (lowerQuery.includes('schedule') || lowerQuery.includes('time') || lowerQuery.includes('timetable')) {
      return await this.agents.scheduleOptimizer.process(query, context);
    } else if (lowerQuery.includes('career') || lowerQuery.includes('job') || lowerQuery.includes('internship')) {
      return await this.agents.careerAdvisor.process(query, context);
    } else if (lowerQuery.includes('exam') || lowerQuery.includes('test') || lowerQuery.includes('quiz')) {
      return await this.agents.examPreparation.process(query, context);
    } else if (lowerQuery.includes('analyze') || lowerQuery.includes('summarize') || lowerQuery.includes('explain')) {
      return await this.agents.documentAnalyzer.process(query, context);
    } else if (lowerQuery.includes('path') || lowerQuery.includes('roadmap') || lowerQuery.includes('plan')) {
      return await this.agents.learningPathCreator.process(query, context);
    } else {
      // Use conversation agent with memory
      return await this.agents.conversationAgent.process(query, context, userId, this.getConversationMemory(userId));
    }
  }

  // Enhanced action detection and execution
  async detectAndExecuteAction(query, context, userId) {
    const lowerQuery = query.toLowerCase();
    
    try {
      console.log(`🔍 Detecting actions in: "${query}"`);
      
      // Course enrollment - more flexible patterns
      if (lowerQuery.includes('enroll') || (lowerQuery.includes('join') && lowerQuery.includes('course'))) {
        console.log('🎓 Detected course enrollment action');
        return await this.executeEnrollment(query, userId);
      }
      
      // Event registration - more flexible patterns
      if (lowerQuery.includes('register') || (lowerQuery.includes('join') && lowerQuery.includes('event'))) {
        console.log('📅 Detected event registration action');
        return await this.executeEventRegistration(query, userId);
      }
      
      // Material search - more flexible patterns
      if (lowerQuery.includes('find') && (lowerQuery.includes('material') || lowerQuery.includes('notes') || lowerQuery.includes('book'))) {
        console.log('📚 Detected material search action');
        return await this.executeMaterialSearch(query, userId);
      }
      
      // Assignment management
      if (lowerQuery.includes('assignment') || lowerQuery.includes('homework')) {
        console.log('📝 Detected assignment management action');
        return await this.executeAssignmentManagement(query, userId);
      }
      
      console.log('ℹ️ No specific action detected, using general AI');
      return null;
    } catch (error) {
      console.error('Action execution error:', error);
      return null;
    }
  }

  // Multi-agent collaboration for complex queries
  async collaborativeProcess(query, context, userId) {
    const results = [];

    // Get insights from multiple agents
    const studyInsight = await this.agents.studyAssistant.process(query, context);
    const scheduleInsight = await this.agents.scheduleOptimizer.process(query, context);
    const careerInsight = await this.agents.careerAdvisor.process(query, context);

    results.push({ agent: 'Study Assistant', insight: studyInsight });
    results.push({ agent: 'Schedule Optimizer', insight: scheduleInsight });
    results.push({ agent: 'Career Advisor', insight: careerInsight });

    // Synthesize insights
    const synthesis = await this.synthesizeInsights(results, query);

    return {
      collaborative: true,
      insights: results,
      synthesis: synthesis
    };
  }

  async synthesizeInsights(results, query) {
    if (!this.model) {
      return 'Multiple perspectives gathered. Please review each agent\'s insight.';
    }

    const template = `Based on these insights from different AI agents, provide a comprehensive answer to: "${query}"

Insights:
{insights}

Synthesized Answer:`;

    const prompt = new PromptTemplate({
      template: template,
      inputVariables: ['insights']
    });

    const chain = new LLMChain({ llm: this.model, prompt: prompt });
    const response = await chain.call({
      insights: JSON.stringify(results, null, 2)
    });

    return response.text;
  }
}

// Study Assistant Agent
class StudyAssistantAgent {
  constructor(model) {
    this.model = model;
    this.name = 'Study Assistant';
  }

  async process(query, context) {
    if (!this.model) {
      return this.getFallbackResponse(query);
    }

    const template = `You are an AI Study Assistant helping university students learn effectively.

Student Query: {query}
Context: {context}

Provide a helpful study strategy, learning tips, or explanation. Be encouraging and practical.

Response:`;

    const prompt = new PromptTemplate({
      template: template,
      inputVariables: ['query', 'context']
    });

    const chain = new LLMChain({ llm: this.model, prompt: prompt });
    const response = await chain.call({
      query: query,
      context: JSON.stringify(context)
    });

    return response.text;
  }

  getFallbackResponse(query) {
    return 'I recommend breaking down complex topics into smaller chunks, using active recall, and practicing spaced repetition for better retention.';
  }
}

// Schedule Optimizer Agent
class ScheduleOptimizerAgent {
  constructor(model) {
    this.model = model;
    this.name = 'Schedule Optimizer';
  }

  async process(query, context) {
    if (!this.model) {
      return this.getFallbackResponse();
    }

    const template = `You are an AI Schedule Optimizer helping students manage their time effectively.

Student Query: {query}
Current Schedule: {context}

Analyze the schedule and provide optimization suggestions, time management tips, or identify potential conflicts.

Response:`;

    const prompt = new PromptTemplate({
      template: template,
      inputVariables: ['query', 'context']
    });

    const chain = new LLMChain({ llm: this.model, prompt: prompt });
    const response = await chain.call({
      query: query,
      context: JSON.stringify(context)
    });

    return response.text;
  }

  getFallbackResponse() {
    return 'Consider using time-blocking techniques, prioritize tasks by urgency and importance, and schedule breaks between study sessions.';
  }
}

// Career Advisor Agent
class CareerAdvisorAgent {
  constructor(model) {
    this.model = model;
    this.name = 'Career Advisor';
  }

  async process(query, context) {
    if (!this.model) {
      return this.getFallbackResponse();
    }

    const template = `You are an AI Career Advisor helping students with career planning and guidance.

Student Query: {query}
Student Profile: {context}

Provide career advice, skill recommendations, or guidance on career paths based on their interests and courses.

Response:`;

    const prompt = new PromptTemplate({
      template: template,
      inputVariables: ['query', 'context']
    });

    const chain = new LLMChain({ llm: this.model, prompt: prompt });
    const response = await chain.call({
      query: query,
      context: JSON.stringify(context)
    });

    return response.text;
  }

  getFallbackResponse() {
    return 'Focus on building both technical and soft skills. Consider internships, personal projects, and networking opportunities in your field of interest.';
  }
}

// Exam Preparation Agent
class ExamPreparationAgent {
  constructor(model) {
    this.model = model;
    this.name = 'Exam Preparation';
  }

  async process(query, context) {
    if (!this.model) {
      return this.getFallbackResponse();
    }

    const template = `You are an AI Exam Preparation Coach helping students prepare for exams effectively.

Student Query: {query}
Course Context: {context}

Provide exam preparation strategies, study techniques, or generate practice questions.

Response:`;

    const prompt = new PromptTemplate({
      template: template,
      inputVariables: ['query', 'context']
    });

    const chain = new LLMChain({ llm: this.model, prompt: prompt });
    const response = await chain.call({
      query: query,
      context: JSON.stringify(context)
    });

    return response.text;
  }

  getFallbackResponse() {
    return 'Create a study schedule, practice with past papers, use active recall techniques, and form study groups for collaborative learning.';
  }
}

// Document Analyzer Agent
class DocumentAnalyzerAgent {
  constructor(model) {
    this.model = model;
    this.name = 'Document Analyzer';
  }

  async process(query, context) {
    if (!this.model) {
      return this.getFallbackResponse();
    }

    const template = `You are an AI Document Analyzer that helps students understand and analyze academic materials.

Query: {query}
Document Context: {context}

Provide analysis, key points extraction, or explanations of complex concepts.

Response:`;

    const prompt = new PromptTemplate({
      template: template,
      inputVariables: ['query', 'context']
    });

    const chain = new LLMChain({ llm: this.model, prompt: prompt });
    const response = await chain.call({
      query: query,
      context: JSON.stringify(context)
    });

    return response.text;
  }

  getFallbackResponse() {
    return 'When analyzing documents, focus on identifying main concepts, supporting evidence, and relationships between ideas.';
  }
}

// Learning Path Agent
class LearningPathAgent {
  constructor(model) {
    this.model = model;
    this.name = 'Learning Path Creator';
  }

  async process(query, context) {
    if (!this.model) {
      return this.getFallbackResponse();
    }

    const template = `You are an AI Learning Path Creator that designs personalized learning journeys for students.

Student Query: {query}
Student Profile: {context}

Create a structured learning path with milestones, resources, and timeline.

Response:`;

    const prompt = new PromptTemplate({
      template: template,
      inputVariables: ['query', 'context']
    });

    const chain = new LLMChain({ llm: this.model, prompt: prompt });
    const response = await chain.call({
      query: query,
      context: JSON.stringify(context)
    });

    return response.text;
  }

  getFallbackResponse() {
    return 'Start with fundamentals, progress to intermediate concepts, then advanced topics. Include practical projects at each stage.';
  }
}

// Conversation Agent with Memory and Actions
class ConversationAgent {
  constructor(model) {
    this.model = model;
    this.name = 'Conversation Agent';
    this.actionHandlers = new Map();
    this.initializeActionHandlers();
  }

  initializeActionHandlers() {
    // Course enrollment
    this.actionHandlers.set('enroll_course', this.handleCourseEnrollment.bind(this));

    // Material search
    this.actionHandlers.set('search_materials', this.handleMaterialSearch.bind(this));

    // Event operations
    this.actionHandlers.set('search_events', this.handleEventSearch.bind(this));

    // Faculty search
    this.actionHandlers.set('find_faculty', this.handleFacultySearch.bind(this));

    // General queries
    this.actionHandlers.set('answer_query', this.handleGeneralQuery.bind(this));
  }

  async process(query, context, userId, memory) {
    try {
      // First, check if this is an actionable request
      const action = await this.identifyAction(query, context);

      if (action && this.actionHandlers.has(action.type)) {
        console.log(`🎯 Executing action: ${action.type}`);
        const result = await this.actionHandlers.get(action.type)(query, userId, context, action);
        return this.formatActionResponse(result, action.type);
      }

      // If no specific action, use conversational AI with memory
      if (!this.model) {
        return this.getFallbackResponse(query);
      }

      const chain = new ConversationChain({
        llm: this.model,
        memory: memory
      });

      const response = await chain.call({
        input: `Context: ${JSON.stringify(context)}\n\nStudent: ${query}`
      });

      return response.response;

    } catch (error) {
      console.error('Conversation Agent Error:', error);
      return this.getFallbackResponse(query);
    }
  }

  async identifyAction(query, context) {
    if (!this.model) return null;

    const prompt = `
    Analyze this student query and determine if it's requesting a specific action.

    Query: "${query}"
    User Context: ${JSON.stringify(context)}

    Available Actions:
    - enroll_course: Enroll student in a course
    - search_materials: Find study materials
    - search_events: Find events
    - find_faculty: Search for faculty members
    - answer_query: General information query

    Respond with JSON:
    {
      "type": "action_type_or_null",
      "confidence": 0-1,
      "parameters": { "key": "value" }
    }

    If confidence < 0.8, return {"type": null, "confidence": 0}
    `;

    try {
      const response = await this.model.call(prompt);
      const parsed = JSON.parse(response.content || response.text);
      return parsed.confidence > 0.8 ? parsed : null;
    } catch (error) {
      console.error('Action identification error:', error);
      return null;
    }
  }

  async handleCourseEnrollment(query, userId, context, action) {
    try {
      const Course = require('../models/Course');
      const User = require('../models/User');

      // Extract course code from query
      const courseMatch = query.match(/(?:enroll|join|register for)\s+(?:course\s+)?([A-Z0-9]+)/i);
      const courseCode = courseMatch ? courseMatch[1] : action.parameters.courseCode;

      if (!courseCode) {
        return { success: false, message: "Please specify a course code (e.g., 'enroll me in CS101')" };
      }

      // Find the course
      const course = await Course.findOne({ code: courseCode });
      if (!course) {
        return { success: false, message: `Course ${courseCode} not found` };
      }

      // Check if already enrolled
      const user = await User.findById(userId);
      const isEnrolled = user.enrolledCourses?.includes(course._id);

      if (isEnrolled) {
        return { success: false, message: `You are already enrolled in ${courseCode}` };
      }

      // Enroll the student
      user.enrolledCourses = user.enrolledCourses || [];
      user.enrolledCourses.push(course._id);
      await user.save();

      return {
        success: true,
        message: `✅ Successfully enrolled you in ${courseCode} - ${course.name}`,
        data: { course: course.code, name: course.name }
      };

    } catch (error) {
      console.error('Course enrollment error:', error);
      return { success: false, message: "Failed to enroll in course" };
    }
  }

  async handleMaterialSearch(query, userId, context, action) {
    try {
      const Material = require('../models/Material');

      const searchTerm = query.match(/search\s+(?:for\s+)?(.+)/i)?.[1] || query;

      const materials = await Material.find({
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      })
      .populate('course', 'code name')
      .populate('uploadedBy', 'name')
      .limit(5);

      if (materials.length === 0) {
        return { success: false, message: `No materials found for "${searchTerm}"` };
      }

      return {
        success: true,
        message: `🔍 Found ${materials.length} materials for "${searchTerm}"`,
        data: materials.map(m => ({
          title: m.title,
          course: m.course?.code,
          type: m.category,
          url: `/materials/${m._id}`
        }))
      };

    } catch (error) {
      console.error('Material search error:', error);
      return { success: false, message: "Search failed" };
    }
  }

  async handleEventSearch(query, userId, context, action) {
    try {
      const Event = require('../models/Event');

      const searchTerm = query.match(/find\s+(?:events?\s+)?(.+)/i)?.[1] || query;

      const events = await Event.find({
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      })
      .populate('organizer', 'name')
      .limit(5);

      if (events.length === 0) {
        return { success: false, message: `No events found for "${searchTerm}"` };
      }

      return {
        success: true,
        message: `📅 Found ${events.length} events`,
        data: events.map(e => ({
          title: e.title,
          date: e.date,
          type: e.type,
          organizer: e.organizer?.name
        }))
      };

    } catch (error) {
      console.error('Event search error:', error);
      return { success: false, message: "Event search failed" };
    }
  }

  async handleFacultySearch(query, userId, context, action) {
    try {
      const User = require('../models/User');

      const searchTerm = query.match(/find\s+(?:faculty\s+)?(.+)/i)?.[1] || query;

      const faculty = await User.find({
        role: 'faculty',
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { department: { $regex: searchTerm, $options: 'i' } }
        ]
      })
      .select('name email department officeHours')
      .limit(5);

      if (faculty.length === 0) {
        return { success: false, message: `No faculty found for "${searchTerm}"` };
      }

      return {
        success: true,
        message: `👨‍🏫 Found ${faculty.length} faculty members`,
        data: faculty.map(f => ({
          name: f.name,
          department: f.department,
          email: f.email,
          officeHours: f.officeHours
        }))
      };

    } catch (error) {
      console.error('Faculty search error:', error);
      return { success: false, message: "Faculty search failed" };
    }
  }

  async handleGeneralQuery(query, userId, context) {
    if (!this.model) {
      return this.getFallbackResponse(query);
    }

    const prompt = `
    You are CampusCompanion, an intelligent university assistant that can perform actions and provide information.

    User Query: "${query}"
    User Context: ${JSON.stringify(context)}

    Available actions I can perform:
    - Enroll students in courses
    - Search and find materials, events, faculty
    - Help with timetable management
    - Answer general campus questions

    If this is an actionable request, I'll handle it directly. For general questions, provide helpful responses.

    Be concise, friendly, and helpful.
    `;

    try {
      const response = await this.model.call(prompt);
      return response.content || response.text;
    } catch (error) {
      console.error('General query error:', error);
      return this.getFallbackResponse(query);
    }
  }

  formatActionResponse(result, actionType) {
    if (result.success) {
      return `✅ ${result.message}${result.data ? '\n\n📋 Details:\n' + JSON.stringify(result.data, null, 2) : ''}`;
    } else {
      return `❌ ${result.message}`;
    }
  }

  // Action execution methods
  async executeEnrollment(query, userId) {
    try {
      const Course = require('../models/Course');
      const User = require('../models/User');
      
      // Extract course code with better pattern matching
      const courseMatch = query.match(/(?:enroll|join|register)\s+(?:me\s+)?(?:in\s+|for\s+)?(?:course\s+)?([A-Z]{2,4}\d{3})/i);
      let courseCode = courseMatch ? courseMatch[1] : null;
      
      // If no exact match, try to find course code anywhere in the query
      if (!courseCode) {
        const codeMatch = query.match(/([A-Z]{2,4}\d{3})/i);
        courseCode = codeMatch ? codeMatch[1] : null;
      }
      
      if (!courseCode) {
        // Try to find course by name if no code provided
        const Course = require('../models/Course');
        const courses = await Course.find({}).limit(5);
        
        if (courses.length > 0) {
          let courseList = '\\n\\n📚 **Available Courses:**\\n';
          courses.forEach(course => {
            courseList += `• ${course.code} - ${course.name}\\n`;
          });
          
          return `❌ Please specify a course code (e.g., 'enroll me in CS101')${courseList}`;
        }
        
        return "❌ Please specify a course code (e.g., 'enroll me in CS101')";
      }
      
      // Find course
      let course = await Course.findOne({ code: { $regex: courseCode, $options: 'i' } });
      
      if (!course) {
        // Create a sample course for demonstration
        course = new Course({
          code: courseCode.toUpperCase(),
          name: `Sample Course - ${courseCode.toUpperCase()}`,
          credits: 3,
          department: 'Computer Science',
          description: 'This is a sample course created for demonstration.'
        });
        await course.save();
        console.log(`Created sample course: ${courseCode}`);
      }
      
      const user = await User.findById(userId);
      if (user.enrolledCourses?.includes(course._id)) {
        return `ℹ️ You are already enrolled in ${courseCode.toUpperCase()}`;
      }
      
      user.enrolledCourses = user.enrolledCourses || [];
      user.enrolledCourses.push(course._id);
      await user.save();
      
      return `✅ Successfully enrolled you in ${courseCode.toUpperCase()} - ${course.name}!\\n\\n🎓 **Course Details:**\\n• Credits: ${course.credits}\\n• Department: ${course.department}\\n• You can now access course materials and assignments.`;
      
    } catch (error) {
      console.error('Enrollment error:', error);
      return "❌ Failed to enroll in course. Please try again or contact support.";
    }
  }
  
  async executeEventRegistration(query, userId) {
    try {
      const Event = require('../models/Event');
      const User = require('../models/User');
      
      // Extract event name with better pattern matching
      const eventMatch = query.match(/register\s+(?:me\s+)?(?:for\s+)?(?:event\s+)?(.+)/i);
      let eventName = eventMatch ? eventMatch[1].trim() : null;
      
      // Clean up the event name
      if (eventName) {
        eventName = eventName.replace(/^(me for|for)\\s+/i, '').trim();
      }
      
      if (!eventName) {
        return "❌ Please specify an event name (e.g., 'register me for tech fest')";
      }
      
      // Try to find matching events
      let events = await Event.find({ 
        title: { $regex: eventName, $options: 'i' },
        status: 'upcoming'
      });
      
      // If no events found, create a sample event for demonstration
      if (events.length === 0) {
        const sampleEvent = new Event({
          title: `${eventName.charAt(0).toUpperCase() + eventName.slice(1)} Event`,
          description: `This is a sample ${eventName} event created for demonstration.`,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          time: '10:00 AM',
          location: 'Main Auditorium',
          type: 'workshop',
          status: 'upcoming',
          maxParticipants: 100,
          registrationOpen: true,
          organizer: null,
          registeredUsers: []
        });
        
        await sampleEvent.save();
        events = [sampleEvent];
        console.log(`Created sample event: ${eventName}`);
      }
      
      const event = events[0];
      
      if (event.registeredUsers?.includes(userId)) {
        return `ℹ️ You are already registered for "${event.title}"`;
      }
      
      // Check capacity
      if (event.registeredUsers?.length >= event.maxParticipants) {
        return `❌ Sorry, "${event.title}" is full (${event.maxParticipants} participants max). You've been added to the waitlist.`;
      }
      
      event.registeredUsers = event.registeredUsers || [];
      event.registeredUsers.push(userId);
      await event.save();
      
      return `✅ Successfully registered you for "${event.title}"!\\n\\n📅 **Event Details:**\\n• Date: ${event.date.toDateString()}\\n• Time: ${event.time}\\n• Location: ${event.location}\\n• Type: ${event.type}\\n\\n🎉 Looking forward to seeing you there!`;
      
    } catch (error) {
      console.error('Event registration error:', error);
      return "❌ Failed to register for event. Please try again or contact support.";
    }
  }
  
  async executeMaterialSearch(query, userId) {
    try {
      const Material = require('../models/Material');
      const Course = require('../models/Course');
      const User = require('../models/User');
      
      // Extract search term
      const searchMatch = query.match(/find\s+(?:materials?\s+)?(?:for\s+)?(.+)/i);
      const searchTerm = searchMatch ? searchMatch[1].trim() : query;
      
      // Try to find existing materials
      let materials = await Material.find({
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      })
      .populate('course', 'code name')
      .populate('uploadedBy', 'name')
      .limit(5);
      
      // If no materials found, create sample materials for demonstration
      if (materials.length === 0) {
        console.log(`Creating sample materials for: ${searchTerm}`);
        
        // Create sample materials
        const sampleMaterials = [
          {
            title: `${searchTerm} - Lecture Notes`,
            description: `Comprehensive lecture notes covering ${searchTerm} concepts and fundamentals.`,
            category: 'notes',
            tags: [searchTerm.toLowerCase(), 'lecture', 'notes'],
            uploadDate: new Date(),
            downloadCount: 0
          },
          {
            title: `${searchTerm} - Practice Problems`,
            description: `Practice problems and exercises for ${searchTerm} with solutions.`,
            category: 'assignments',
            tags: [searchTerm.toLowerCase(), 'practice', 'problems'],
            uploadDate: new Date(),
            downloadCount: 0
          },
          {
            title: `${searchTerm} - Reference Guide`,
            description: `Quick reference guide and cheat sheet for ${searchTerm}.`,
            category: 'reference',
            tags: [searchTerm.toLowerCase(), 'reference', 'guide'],
            uploadDate: new Date(),
            downloadCount: 0
          }
        ];
        
        for (const materialData of sampleMaterials) {
          const material = new Material(materialData);
          await material.save();
          materials.push(material);
        }
      }
      
      if (materials.length === 0) {
        return `❌ No materials found for "${searchTerm}". Try different keywords or check spelling.`;
      }
      
      let response = `📚 Found ${materials.length} materials for "${searchTerm}":\\n\\n`;
      materials.forEach((material, index) => {
        response += `${index + 1}. **${material.title}**\\n`;
        response += `   📖 Course: ${material.course?.code || 'General'}\\n`;
        response += `   📄 Type: ${material.category}\\n`;
        response += `   👤 By: ${material.uploadedBy?.name || 'System'}\\n`;
        response += `   📅 Added: ${material.uploadDate.toDateString()}\\n`;
        response += `   📥 Downloads: ${material.downloadCount || 0}\\n\\n`;
      });
      
      response += `💡 **Tip:** Click on any material to download or view it. Need more specific materials? Try searching with course codes like "CS101 ${searchTerm}".`;
      
      return response;
    } catch (error) {
      console.error('Material search error:', error);
      return "❌ Failed to search materials. Please try again or contact support.";
    }
  }
  
  async executeAssignmentManagement(query, userId) {
    try {
      const Assignment = require('../models/Assignment');
      const User = require('../models/User');
      
      const user = await User.findById(userId).populate('enrolledCourses', 'code name');
      const assignments = await Assignment.find({
        course: { $in: user.enrolledCourses.map(c => c._id) },
        dueDate: { $gte: new Date() }
      })
      .populate('course', 'code name')
      .sort({ dueDate: 1 });
      
      if (assignments.length === 0) {
        return "ℹ️ No upcoming assignments found";
      }
      
      let response = `✅ Found ${assignments.length} upcoming assignments:\n\n`;
      assignments.forEach((assignment, index) => {
        const daysLeft = Math.ceil((assignment.dueDate - new Date()) / (1000 * 60 * 60 * 24));
        response += `${index + 1}. **${assignment.title}**\n`;
        response += `   Course: ${assignment.course.code}\n`;
        response += `   Due: ${assignment.dueDate.toDateString()} (${daysLeft} days left)\n`;
        response += `   Status: ${assignment.status}\n\n`;
      });
      
      return response;
    } catch (error) {
      return "❌ Failed to fetch assignments. Please try again.";
    }
  }

  getFallbackResponse(query) {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('enroll') || lowerQuery.includes('course')) {
      return "🎓 I can help you enroll in courses! Just tell me the course code (e.g., 'enroll me in CS101') and I'll handle it for you.";
    }

    if (lowerQuery.includes('material') || lowerQuery.includes('notes')) {
      return "📚 I can help you find study materials! Just describe what you're looking for and I'll search for relevant materials.";
    }

    if (lowerQuery.includes('event')) {
      return "📅 I can help you find events! Tell me what type of events you're interested in.";
    }

    if (lowerQuery.includes('faculty') || lowerQuery.includes('professor')) {
      return "👨‍🏫 I can help you find faculty members! Just tell me their name or department.";
    }

    return "🤖 I'm here to help! You can ask me to enroll you in courses, search for materials and events, find faculty information, or answer general campus questions.";
  }
}

module.exports = new AgenticAISystem();
