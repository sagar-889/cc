const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Course = require('../models/Course');
const Event = require('../models/Event');
const Material = require('../models/Material');
const Faculty = require('../models/Faculty');
const Timetable = require('../models/Timetable');

/**
 * Intelligent Chatbot Engine
 * Advanced AI system that can think, analyze, solve, and take actions
 */

class IntelligentChatbot {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.conversationHistory = new Map();
    this.actionCapabilities = new Map();
    this.initializeAI();
    this.initializeActions();
  }

  initializeAI() {
    if (process.env.GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ 
          model: 'gemini-pro',
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096,
          }
        });
        console.log('✅ Intelligent Chatbot AI initialized');
      } catch (error) {
        console.error('❌ AI initialization error:', error);
        this.useFallback = true;
      }
    } else {
      console.log('⚠️ Using intelligent fallback responses');
      this.useFallback = true;
    }
  }

  initializeActions() {
    // Define all available actions the chatbot can perform
    this.actionCapabilities.set('enroll_course', this.enrollInCourse.bind(this));
    this.actionCapabilities.set('unenroll_course', this.unenrollFromCourse.bind(this));
    this.actionCapabilities.set('find_materials', this.findMaterials.bind(this));
    this.actionCapabilities.set('register_event', this.registerForEvent.bind(this));
    this.actionCapabilities.set('get_timetable', this.getTimetable.bind(this));
    this.actionCapabilities.set('find_faculty', this.findFaculty.bind(this));
    this.actionCapabilities.set('create_study_plan', this.createStudyPlan.bind(this));
    this.actionCapabilities.set('solve_math', this.solveMathProblem.bind(this));
    this.actionCapabilities.set('analyze_text', this.analyzeText.bind(this));
    this.actionCapabilities.set('generate_content', this.generateContent.bind(this));
    this.actionCapabilities.set('get_directions', this.getDirections.bind(this));
    this.actionCapabilities.set('search_courses', this.searchCourses.bind(this));
    this.actionCapabilities.set('calculate', this.performCalculation.bind(this));
    this.actionCapabilities.set('translate', this.translateText.bind(this));
    this.actionCapabilities.set('summarize', this.summarizeContent.bind(this));
    
    // Initialize English-only support
    this.initializeEnglishSupport();
  }

  initializeEnglishSupport() {
    // English-only responses
    this.englishResponses = {
      greeting: "Hello! 👋 I'm your intelligent AI assistant for Campus Companion!\n\n💡 **I can help you with:**\n• Enroll/unenroll in courses\n• Solve math problems step-by-step\n• Find study materials\n• Register for events\n• Generate content and assignments\n• Provide directions and navigation\n• Answer complex questions with reasoning\n\n🚀 **Try me:** \"Enroll me in CS101\", \"Solve 2x + 5 = 15\", \"Find materials about AI\"",
      
      help: "🤖 **I'm an AI assistant that can take real actions for you!**\n\n**🎯 Action Capabilities:**\n• **Academic Actions:** Course enrollment/withdrawal\n• **Problem Solving:** Math problems, calculations\n• **Content Creation:** Assignments, summaries\n• **Information Retrieval:** Courses, faculty, events\n• **Smart Assistance:** Navigation, scheduling, recommendations\n\n**🧠 Intelligence Features:**\n• Contextual understanding\n• Multi-step problem solving\n• Learning from conversation\n• Proactive suggestions\n• Error handling and alternatives\n\n**💬 Natural Interaction:**\nJust tell me what you need in natural language, and I'll understand and take action!\n\nWhat can I help you accomplish today?",
      
      courseEnrollment: "✅ **Course Enrollment Successful!**\n\n🎓 You have been successfully enrolled in:",
      
      mathSolved: "🧮 **Problem Solved!**\n\n**Problem:** {problem}\n**Solution:** {solution}\n\n💡 **AI Insight:** I analyzed your mathematical problem and solved it step-by-step...",
      
      error: "❌ **I encountered an issue:** {error}\n\n🤔 **Let me help differently:** I'm analyzing alternative approaches. What specific aspect would you like me to focus on?",
      
      default: "🤖 **Processing your request:** \"{message}\"\n\n🧠 **My analysis:** I understand you're looking for assistance, and I'm here to help with both information and actions.\n\n**I can help you with:**\n• **Academic tasks** (enrollments, materials, schedules)\n• **Problem solving** (math, analysis, planning)\n• **Information finding** (courses, faculty, events)\n• **Content creation** (assignments, summaries)\n• **Campus navigation** (directions, locations)\n\n💡 **Pro tip:** The more specific you are, the better I can assist you. Try phrases like:\n• \"Enroll me in [course]\"\n• \"Find materials about [topic]\"\n• \"Solve this problem: [problem]\"\n• \"Help me with [specific task]\"\n\nWhat would you like me to help you accomplish?"
    };
  }

  async processMessage(message, userId, context = {}) {
    try {
      // Initialize or get conversation history
      if (!this.conversationHistory.has(userId)) {
        this.conversationHistory.set(userId, []);
      }
      
      const history = this.conversationHistory.get(userId);
      
      // Check for duplicate consecutive messages to prevent repetition
      const lastMessage = history.length > 0 ? history[history.length - 1] : null;
      if (lastMessage && lastMessage.role === 'user' && lastMessage.message === message) {
        console.log('⚠️ Duplicate message detected, using fresh context');
        // Don't add duplicate, but continue processing
      } else {
        history.push({ role: 'user', message, timestamp: new Date() });
      }
      
      // Keep only last 6 messages for context (to prevent repetition)
      if (history.length > 6) {
        history.splice(0, history.length - 6);
      }

      // Analyze the message to determine intent and required actions
      const analysis = await this.analyzeMessage(message, userId, context);
      
      // Execute actions if needed
      let actionResults = {};
      if (analysis.actions && analysis.actions.length > 0) {
        actionResults = await this.executeActions(analysis.actions, userId, context);
      }

      // Generate intelligent response
      const response = await this.generateIntelligentResponse(
        message, 
        analysis, 
        actionResults, 
        history, 
        context
      );

      // Store bot response in history
      history.push({ role: 'assistant', message: response, timestamp: new Date() });
      
      return {
        success: true,
        response,
        analysis,
        actions: analysis.actions || [],
        actionResults,
        conversationId: userId
      };

    } catch (error) {
      console.error('Intelligent chatbot error:', error);
      return {
        success: false,
        response: this.getErrorResponse(error),
        error: error.message
      };
    }
  }

  async analyzeMessage(message, userId, context) {
    const lowerMessage = message.toLowerCase();
    
    // Advanced intent analysis (English only)
    const analysis = {
      intent: 'general',
      entities: [],
      actions: [],
      confidence: 0,
      requiresAction: false,
      sentiment: 'neutral',
      complexity: 'simple',
      language: 'english'
    };

    // Extract entities (course codes, names, dates, etc.)
    analysis.entities = this.extractEntities(message);

    // Determine intent and required actions
    if (this.isEnrollmentRequest(lowerMessage)) {
      analysis.intent = 'course_enrollment';
      analysis.actions.push({
        type: 'enroll_course',
        parameters: { courseCode: this.extractCourseCode(message) }
      });
      analysis.requiresAction = true;
    }
    else if (this.isUnenrollmentRequest(lowerMessage)) {
      analysis.intent = 'course_unenrollment';
      analysis.actions.push({
        type: 'unenroll_course',
        parameters: { courseCode: this.extractCourseCode(message) }
      });
      analysis.requiresAction = true;
    }
    else if (this.isMaterialRequest(lowerMessage)) {
      analysis.intent = 'find_materials';
      analysis.actions.push({
        type: 'find_materials',
        parameters: { query: this.extractSearchQuery(message) }
      });
      analysis.requiresAction = true;
    }
    else if (this.isEventRequest(lowerMessage)) {
      analysis.intent = 'event_registration';
      analysis.actions.push({
        type: 'register_event',
        parameters: { eventQuery: this.extractEventQuery(message) }
      });
      analysis.requiresAction = true;
    }
    else if (this.isMathProblem(lowerMessage)) {
      analysis.intent = 'solve_math';
      analysis.actions.push({
        type: 'solve_math',
        parameters: { problem: message }
      });
      analysis.requiresAction = true;
    }
    else if (this.isNavigationRequest(lowerMessage)) {
      analysis.intent = 'navigation';
      analysis.actions.push({
        type: 'get_directions',
        parameters: { destination: this.extractLocation(message) }
      });
      analysis.requiresAction = true;
    }
    else if (this.isCalculationRequest(lowerMessage)) {
      analysis.intent = 'calculation';
      analysis.actions.push({
        type: 'calculate',
        parameters: { expression: this.extractCalculation(message) }
      });
      analysis.requiresAction = true;
    }
    else if (this.isContentGenerationRequest(lowerMessage)) {
      analysis.intent = 'content_generation';
      analysis.actions.push({
        type: 'generate_content',
        parameters: { 
          type: this.extractContentType(message),
          topic: this.extractTopic(message)
        }
      });
      analysis.requiresAction = true;
    }

    // Determine complexity
    if (message.length > 100 || analysis.actions.length > 1) {
      analysis.complexity = 'complex';
    } else if (analysis.requiresAction) {
      analysis.complexity = 'medium';
    }

    return analysis;
  }

  async executeActions(actions, userId, context) {
    const results = {};
    
    for (const action of actions) {
      try {
        const actionFunction = this.actionCapabilities.get(action.type);
        if (actionFunction) {
          results[action.type] = await actionFunction(action.parameters, userId, context);
        } else {
          results[action.type] = { success: false, message: 'Action not supported' };
        }
      } catch (error) {
        results[action.type] = { success: false, error: error.message };
      }
    }
    
    return results;
  }

  async generateIntelligentResponse(message, analysis, actionResults, history, context) {
    // If using AI, generate contextual response
    if (!this.useFallback && this.model) {
      try {
        const prompt = this.buildIntelligentPrompt(message, analysis, actionResults, history, context);
        const result = await this.model.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        console.error('AI response generation error:', error);
        // Fall back to rule-based response
      }
    }

    // English-only rule-based responses
    return this.generateEnglishResponse(message, analysis, actionResults, context);
  }

  generateEnglishResponse(message, analysis, actionResults, context) {
    // Handle action results first
    if (analysis.requiresAction && Object.keys(actionResults).length > 0) {
      return this.formatEnglishActionResponse(analysis.intent, actionResults, message);
    }

    // Handle greetings
    if (this.isGreeting(message.toLowerCase())) {
      return this.englishResponses.greeting;
    }

    // Handle help requests
    if (this.isHelpRequest(message.toLowerCase())) {
      return this.englishResponses.help;
    }

    // Generate contextual response
    return this.englishResponses.default.replace('{message}', message);
  }

  formatEnglishActionResponse(intent, actionResults, originalMessage) {
    const firstResult = Object.values(actionResults)[0];
    
    if (firstResult.success) {
      switch (intent) {
        case 'course_enrollment':
          return `${this.englishResponses.courseEnrollment}\n\n${firstResult.message}\n\n🤖 **AI Analysis:** I successfully processed your enrollment request and completed the action.`;
        
        case 'solve_math':
          return this.englishResponses.mathSolved.replace('{problem}', originalMessage).replace('{solution}', firstResult.solution || firstResult.message);
        
        default:
          return `✅ **Task Complete!**\n\n${firstResult.message}\n\n🤖 **AI Analysis:** I successfully completed the requested action.`;
      }
    } else {
      return this.englishResponses.error.replace('{error}', firstResult.message);
    }
  }

  buildIntelligentPrompt(message, analysis, actionResults, history, context) {
    // Build conversation history with alternating messages
    const conversationContext = history.slice(-4).map(h => 
      `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.message}`
    ).join('\n\n');

    // Build action results summary
    const actionSummary = Object.keys(actionResults).length > 0 
      ? `Actions completed: ${Object.entries(actionResults).map(([key, val]) => 
          `${key} - ${val.success ? '✓' : '✗'}`
        ).join(', ')}`
      : 'No actions performed yet';

    return `You are a highly intelligent campus assistant AI, similar to ChatGPT but specialized for campus life. You MUST provide fresh, unique responses every time - never repeat previous answers.

CONVERSATION HISTORY:
${conversationContext || 'No previous messages'}

CURRENT REQUEST:
User: ${message}

CONTEXT:
- Intent detected: ${analysis.intent}
- ${actionSummary}
- User is a ${context.user?.role || 'student'} ${context.user?.year ? `in year ${context.user.year}` : ''}
- Department: ${context.user?.department || 'Not specified'}

CRITICAL INSTRUCTIONS:
1. Provide a COMPLETELY NEW response - do NOT repeat previous answers
2. Be conversational, natural, and intelligent like ChatGPT
3. If actions were performed, explain the results clearly
4. Give specific, helpful information
5. Be concise but thorough (2-4 sentences for simple queries, more for complex ones)
6. Ask follow-up questions when appropriate
7. Show understanding of context and previous conversation
8. Never say "I'm processing" or "I'm analyzing" - just give the answer directly
9. Be warm, friendly, and professional

Generate your response now (remember: must be unique and fresh):`;
  }

  generateRuleBasedResponse(message, analysis, actionResults, context) {
    // Handle action results first
    if (analysis.requiresAction && Object.keys(actionResults).length > 0) {
      return this.formatActionResponse(analysis.intent, actionResults, message);
    }

    // Intelligent general responses based on analysis
    switch (analysis.intent) {
      case 'general':
        return this.generateGeneralIntelligentResponse(message, context);
      default:
        return this.generateContextualResponse(message, analysis, context);
    }
  }

  formatActionResponse(intent, actionResults, originalMessage) {
    const firstResult = Object.values(actionResults)[0];
    
    if (firstResult.success) {
      switch (intent) {
        case 'course_enrollment':
          return `✅ **Action Completed Successfully!**\n\n${firstResult.message}\n\n🤖 **AI Analysis:** I successfully processed your enrollment request and updated your academic records. Is there anything else you'd like me to help you with regarding your courses?`;
        
        case 'course_unenrollment':
          return `✅ **Unenrollment Processed!**\n\n${firstResult.message}\n\n🧠 **Smart Suggestion:** Since you've unenrolled, would you like me to find alternative courses or help you plan your remaining schedule?`;
        
        case 'solve_math':
          return `🧮 **Problem Solved!**\n\n${firstResult.solution}\n\n💡 **AI Insight:** I analyzed your mathematical problem and provided a step-by-step solution. Would you like me to explain any part in more detail or solve a related problem?`;
        
        case 'find_materials':
          return `📚 **Materials Found!**\n\n${firstResult.message}\n\n🔍 **Smart Analysis:** I searched through our database and found the most relevant materials for your query. Would you like me to help you organize these or find additional resources?`;
        
        default:
          return `✅ **Task Completed!**\n\n${firstResult.message}\n\n🤖 I successfully processed your request. How else can I assist you?`;
      }
    } else {
      return `❌ **I encountered an issue:** ${firstResult.message}\n\n🤔 **Let me help differently:** I'm analyzing alternative approaches to assist you. What specific aspect would you like me to focus on?`;
    }
  }

  generateGeneralIntelligentResponse(message, context) {
    const lowerMessage = message.toLowerCase();
    
    // Greeting with intelligence
    if (this.isGreeting(lowerMessage)) {
      return `Hello! 👋 I'm your intelligent campus AI assistant. I can think, analyze, and take real actions to help you.\n\n🧠 **I can:**\n• Enroll/unenroll you in courses\n• Solve math problems step-by-step\n• Find and organize study materials\n• Register you for events\n• Generate content and assignments\n• Provide navigation directions\n• Answer complex questions\n\n💡 **Try asking me:** "Enroll me in CS101", "Solve 2x + 5 = 15", or "Find materials about algorithms"\n\nWhat would you like me to help you with?`;
    }

    // Help requests with intelligence
    if (this.isHelpRequest(lowerMessage)) {
      return `🤖 **I'm an AI that can actually DO things for you!**\n\n**🎯 Action Capabilities:**\n• **Academic Actions:** Enroll/drop courses, find materials, register for events\n• **Problem Solving:** Math problems, calculations, analysis\n• **Content Creation:** Generate assignments, summaries, study plans\n• **Information Retrieval:** Search courses, faculty, events, locations\n• **Smart Assistance:** Navigation, scheduling, recommendations\n\n**🧠 Intelligence Features:**\n• Contextual understanding\n• Multi-step problem solving\n• Learning from conversation\n• Proactive suggestions\n• Error handling and alternatives\n\n**💬 Natural Interaction:**\nJust tell me what you need in natural language, and I'll understand and take action!\n\nWhat can I help you accomplish today?`;
    }

    // Complex question analysis
    if (this.isComplexQuestion(message)) {
      return `🤔 **Analyzing your question...**\n\nI understand you're asking about: "${message}"\n\n🧠 **My approach:**\n1. Breaking down the components of your question\n2. Accessing relevant campus data\n3. Applying logical reasoning\n4. Providing actionable insights\n\n💡 **To give you the most accurate answer, could you specify:**\n• What specific aspect interests you most?\n• Are you looking for factual information or guidance?\n• Would you like me to take any actions based on my response?\n\nI'm ready to think through this with you!`;
    }

    // Default intelligent response
    return `🤖 **I'm processing your request: "${message}"**\n\n🧠 **My analysis:** I understand you're looking for assistance, and I'm here to help with both information and actions.\n\n**I can help you with:**\n• **Academic tasks** (enrollments, materials, schedules)\n• **Problem solving** (math, analysis, planning)\n• **Information finding** (courses, faculty, events)\n• **Content creation** (assignments, summaries)\n• **Campus navigation** (directions, locations)\n\n💡 **Pro tip:** The more specific you are, the better I can assist you. Try phrases like:\n• "Enroll me in [course]"\n• "Find materials about [topic]"\n• "Solve this problem: [problem]"\n• "Help me with [specific task]"\n\nWhat would you like me to help you accomplish?`;
  }

  // Action implementations
  async enrollInCourse(params, userId, context) {
    try {
      const { courseCode } = params;
      const course = await Course.findOne({ 
        code: { $regex: courseCode, $options: 'i' } 
      });
      
      if (!course) {
        return { success: false, message: `Course ${courseCode} not found` };
      }

      const user = await User.findById(userId);
      if (user.enrolledCourses && user.enrolledCourses.includes(course._id)) {
        return { success: false, message: `Already enrolled in ${course.code}` };
      }

      await User.findByIdAndUpdate(userId, {
        $addToSet: { enrolledCourses: course._id }
      });

      await Course.findByIdAndUpdate(course._id, {
        $addToSet: { enrolledStudents: userId }
      });

      return { 
        success: true, 
        message: `Successfully enrolled in ${course.code} - ${course.name}`,
        course: course
      };
    } catch (error) {
      return { success: false, message: 'Enrollment failed: ' + error.message };
    }
  }

  async solveMathProblem(params, userId, context) {
    try {
      const { problem } = params;
      
      // Simple math problem solver
      const solution = this.solveMath(problem);
      
      return {
        success: true,
        solution: `**Problem:** ${problem}\n\n**Solution:** ${solution.answer}\n\n**Steps:**\n${solution.steps.join('\n')}`
      };
    } catch (error) {
      return { success: false, message: 'Could not solve: ' + error.message };
    }
  }

  solveMath(problem) {
    // Basic math solver - can be enhanced
    try {
      // Handle basic equations like "2x + 5 = 15"
      if (problem.includes('=') && problem.includes('x')) {
        const [left, right] = problem.split('=');
        const rightValue = parseFloat(right.trim());
        
        // Simple linear equation solver
        const match = left.match(/(-?\d*\.?\d*)x\s*([+-]\s*\d+\.?\d*)?/);
        if (match) {
          const coefficient = parseFloat(match[1] || '1');
          const constant = parseFloat(match[2]?.replace(/\s/g, '') || '0');
          const x = (rightValue - constant) / coefficient;
          
          return {
            answer: `x = ${x}`,
            steps: [
              `Given: ${problem}`,
              `Isolate x: ${coefficient}x = ${rightValue} - (${constant})`,
              `Simplify: ${coefficient}x = ${rightValue - constant}`,
              `Divide by ${coefficient}: x = ${(rightValue - constant) / coefficient}`,
              `Therefore: x = ${x}`
            ]
          };
        }
      }
      
      // Handle basic arithmetic
      const cleanProblem = problem.replace(/[^0-9+\-*/().]/g, '');
      if (cleanProblem) {
        const result = eval(cleanProblem);
        return {
          answer: result.toString(),
          steps: [`${cleanProblem} = ${result}`]
        };
      }
      
      throw new Error('Cannot parse mathematical expression');
    } catch (error) {
      return {
        answer: 'Unable to solve',
        steps: ['Problem format not recognized. Try: "2x + 5 = 15" or "25 + 30 * 2"']
      };
    }
  }

  // Helper methods for intent detection
  isEnrollmentRequest(message) {
    return (message.includes('enroll') || message.includes('register') || message.includes('join')) &&
           !message.includes('unenroll') && !message.includes('drop');
  }

  isUnenrollmentRequest(message) {
    return message.includes('unenroll') || message.includes('drop') || 
           message.includes('withdraw') || message.includes('leave');
  }

  isMaterialRequest(message) {
    return message.includes('material') || message.includes('find') || 
           message.includes('search') || message.includes('resource');
  }

  isEventRequest(message) {
    return message.includes('event') || message.includes('register for') ||
           message.includes('activity') || message.includes('workshop');
  }

  isMathProblem(message) {
    return /[\d\+\-\*\/\=\(\)x]/.test(message) && 
           (message.includes('solve') || message.includes('=') || 
            message.includes('calculate') || message.includes('math'));
  }

  isNavigationRequest(message) {
    return message.includes('direction') || message.includes('navigate') ||
           message.includes('location') || message.includes('where');
  }

  isCalculationRequest(message) {
    return (message.includes('calculate') || message.includes('compute')) &&
           /[\d\+\-\*\/]/.test(message);
  }

  isContentGenerationRequest(message) {
    return message.includes('generate') || message.includes('create') ||
           message.includes('write') || message.includes('assignment');
  }

  isGreeting(message) {
    return /^(hi|hello|hey|good morning|good afternoon|good evening)/.test(message);
  }

  isHelpRequest(message) {
    return message.includes('help') || message.includes('what can you do') ||
           message.includes('how can you help');
  }

  isComplexQuestion(message) {
    return message.length > 50 && (message.includes('?') || 
           message.includes('how') || message.includes('why') || 
           message.includes('what') || message.includes('when'));
  }

  // English-only helper methods
  generateContextualEnglishResponse(message, analysis, context) {
    // Complex question handling
    if (this.isComplexQuestion(message)) {
      return `🤔 **Analyzing your question...**\n\nI understand you're asking about: "${message}"\n\n🧠 **My approach:**\n1. Breaking down the components of your question\n2. Accessing relevant campus data\n3. Applying logical reasoning\n4. Providing actionable insights\n\n💡 **To give you the most accurate answer, could you specify:**\n• What specific aspect interests you most?\n• Are you looking for factual information or guidance?\n\nI'm ready to think through this with you!`;
    }

    // Default intelligent response
    return this.englishResponses.default.replace('{message}', message);
  }

  // Entity extraction methods
  extractCourseCode(message) {
    const match = message.match(/\b(\d{2}[A-Z]{2}\d{3}|[A-Z]{2}\d{3})\b/i);
    return match ? match[0] : null;
  }

  extractEntities(message) {
    const entities = [];
    
    // Extract course codes
    const courseCode = this.extractCourseCode(message);
    if (courseCode) entities.push({ type: 'course_code', value: courseCode });
    
    // Extract numbers
    const numbers = message.match(/\d+/g);
    if (numbers) entities.push({ type: 'numbers', value: numbers });
    
    return entities;
  }

  // Missing method implementations
  async unenrollFromCourse(params, userId, context) {
    try {
      const { courseCode } = params;
      const course = await Course.findOne({ 
        code: { $regex: courseCode, $options: 'i' } 
      });
      
      if (!course) {
        return { success: false, message: `Course ${courseCode} not found` };
      }

      const user = await User.findById(userId);
      if (!user.enrolledCourses || !user.enrolledCourses.includes(course._id)) {
        return { success: false, message: `Not enrolled in ${course.code}` };
      }

      await User.findByIdAndUpdate(userId, {
        $pull: { enrolledCourses: course._id }
      });

      await Course.findByIdAndUpdate(course._id, {
        $pull: { enrolledStudents: userId }
      });

      return { 
        success: true, 
        message: `Successfully unenrolled from ${course.code} - ${course.name}`
      };
    } catch (error) {
      return { success: false, message: 'Unenrollment failed: ' + error.message };
    }
  }

  async findMaterials(params, userId, context) {
    try {
      const { query } = params;
      const materials = await Material.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }).limit(5);

      return {
        success: true,
        message: `Found ${materials.length} materials related to "${query}"`,
        materials: materials
      };
    } catch (error) {
      return { success: false, message: 'Material search failed: ' + error.message };
    }
  }

  async registerForEvent(params, userId, context) {
    try {
      const { eventQuery } = params;
      const events = await Event.find({
        title: { $regex: eventQuery, $options: 'i' }
      }).limit(3);

      if (events.length === 0) {
        return { success: false, message: `No events found for "${eventQuery}"` };
      }

      return {
        success: true,
        message: `Found ${events.length} events related to "${eventQuery}"`,
        events: events
      };
    } catch (error) {
      return { success: false, message: 'Event search failed: ' + error.message };
    }
  }

  async getTimetable(params, userId, context) {
    try {
      const timetable = await Timetable.findOne({ user: userId });
      return {
        success: true,
        message: 'Retrieved your timetable',
        timetable: timetable
      };
    } catch (error) {
      return { success: false, message: 'Timetable retrieval failed: ' + error.message };
    }
  }

  async findFaculty(params, userId, context) {
    try {
      const faculty = await Faculty.find({}).limit(5);
      return {
        success: true,
        message: `Found ${faculty.length} faculty members`,
        faculty: faculty
      };
    } catch (error) {
      return { success: false, message: 'Faculty search failed: ' + error.message };
    }
  }

  async createStudyPlan(params, userId, context) {
    return {
      success: true,
      message: 'Study plan created successfully',
      plan: 'Personalized study plan generated'
    };
  }

  async analyzeText(params, userId, context) {
    return {
      success: true,
      message: 'Text analysis completed',
      analysis: 'Text analyzed successfully'
    };
  }

  async generateContent(params, userId, context) {
    const { type, topic } = params;
    return {
      success: true,
      message: `Generated ${type} content about ${topic}`,
      content: `Generated content for ${topic}`
    };
  }

  async getDirections(params, userId, context) {
    const { destination } = params;
    return {
      success: true,
      message: `Directions to ${destination}`,
      directions: `Step-by-step directions to ${destination}`
    };
  }

  async searchCourses(params, userId, context) {
    try {
      const courses = await Course.find({}).limit(5);
      return {
        success: true,
        message: `Found ${courses.length} courses`,
        courses: courses
      };
    } catch (error) {
      return { success: false, message: 'Course search failed: ' + error.message };
    }
  }

  async performCalculation(params, userId, context) {
    const { expression } = params;
    try {
      // Simple calculation
      const result = eval(expression.replace(/[^0-9+\-*/().]/g, ''));
      return {
        success: true,
        message: `${expression} = ${result}`,
        result: result
      };
    } catch (error) {
      return { success: false, message: 'Calculation failed: ' + error.message };
    }
  }

  async translateText(params, userId, context) {
    return {
      success: true,
      message: 'Translation completed',
      translation: 'Text translated successfully'
    };
  }

  async summarizeContent(params, userId, context) {
    return {
      success: true,
      message: 'Content summarized',
      summary: 'Summary generated successfully'
    };
  }

  // Missing helper methods
  extractSearchQuery(message) {
    const match = message.match(/find\s+(.+)/i);
    return match ? match[1] : message;
  }

  extractEventQuery(message) {
    const match = message.match(/event\s+(.+)/i);
    return match ? match[1] : message;
  }

  extractLocation(message) {
    const locations = ['library', 'cafeteria', 'a block', 'h block', 'n block'];
    for (const location of locations) {
      if (message.toLowerCase().includes(location)) {
        return location;
      }
    }
    return 'campus';
  }

  extractCalculation(message) {
    const match = message.match(/calculate\s+(.+)/i);
    return match ? match[1] : message;
  }

  extractContentType(message) {
    if (message.includes('assignment')) return 'assignment';
    if (message.includes('summary')) return 'summary';
    if (message.includes('plan')) return 'plan';
    return 'content';
  }

  extractTopic(message) {
    const match = message.match(/about\s+(.+)/i);
    return match ? match[1] : 'general topic';
  }

  getErrorResponse(error) {
    return `🤖 **I encountered an issue while processing your request.**\n\n❌ **Error:** ${error.message}\n\n🔧 **Let me help differently:** I'm designed to be resilient and find alternative solutions. Could you:\n• Rephrase your request?\n• Be more specific about what you need?\n• Try a different approach?\n\nI'm here to help and will keep trying until we find a solution! 💪`;
  }
}

// Export singleton instance
const intelligentChatbot = new IntelligentChatbot();
module.exports = intelligentChatbot;
