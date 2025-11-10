const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const advancedAI = require('../utils/advancedAI');
const agenticAI = require('../utils/agenticAI');
const User = require('../models/User');
const axios = require('axios');

// Voice chat session storage (in production, use Redis)
const voiceSessions = new Map();

// Start voice chat session
router.post('/start', auth, async (req, res) => {
  try {
    const sessionId = `voice_${req.userId}_${Date.now()}`;
    
    voiceSessions.set(sessionId, {
      userId: req.userId,
      startTime: new Date(),
      messages: [],
      context: {}
    });

    res.json({
      success: true,
      sessionId,
      message: 'Voice chat session started'
    });
  } catch (error) {
    console.error('Start voice chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start voice chat session'
    });
  }
});

// Process voice message
router.post('/message', auth, async (req, res) => {
  try {
    const { sessionId, transcript, audioData, query } = req.body;
    const message = transcript || query;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Transcript or query is required',
        error: 'EMPTY_MESSAGE'
      });
    }

    console.log('Processing voice message:', message);
    console.log('Session ID:', sessionId);

    // If no session ID, create one
    let session;
    if (!sessionId) {
      const newSessionId = `voice_${req.userId}_${Date.now()}`;
      session = {
        userId: req.userId,
        startTime: new Date(),
        messages: [],
        context: {}
      };
      voiceSessions.set(newSessionId, session);
      
      // Add user message
      session.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Get user info for context
      try {
        const user = await User.findById(req.userId).select('name email department year');
        if (user) {
          session.context.user = user;
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }

      // Enhanced AI processing with campus data
      let aiResponse;
      try {
        // Get campus context for better responses
        const campusContext = await getCampusContext(message);
        console.log('Campus context loaded:', Object.keys(campusContext));
        
        // Try advanced AI first
        if (advancedAI && typeof advancedAI.chat === 'function') {
          console.log('Using advanced AI for response');
          aiResponse = await advancedAI.chat(
            message,
            req.userId.toString(),
            { ...session.context, ...campusContext }
          );
        } else {
          console.log('Using smart response fallback');
          // Fallback to smart campus responses
          aiResponse = await generateSmartResponse(message, campusContext);
        }
        
        console.log('AI Response generated:', aiResponse ? aiResponse.substring(0, 100) : 'No response');
      } catch (error) {
        console.error('AI chat error:', error);
        // Smart fallback based on message content
        aiResponse = await generateSmartResponse(message, {});
      }

      // Ensure we have a valid response
      if (!aiResponse || aiResponse.trim() === '') {
        aiResponse = "I'm here to help! Could you please rephrase your question?";
      }

      // Add AI response to session
      session.messages.push({
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      });

      // Generate speech (if OpenAI TTS is available)
      let audioResponse = null;
      if (process.env.OPENAI_API_KEY) {
        try {
          audioResponse = await generateSpeech(aiResponse);
        } catch (error) {
          console.error('TTS error:', error);
        }
      }

      return res.json({
        success: true,
        response: aiResponse,
        audioResponse: audioResponse,
        sessionId: newSessionId,
        transcript: message
      });
    }

    // Existing session
    session = voiceSessions.get(sessionId);
    if (!session || session.userId.toString() !== req.userId.toString()) {
      // Session expired or invalid, create new one
      console.log('Session invalid, creating new session');
      const newSessionId = `voice_${req.userId}_${Date.now()}`;
      session = {
        userId: req.userId,
        startTime: new Date(),
        messages: [],
        context: {}
      };
      voiceSessions.set(newSessionId, session);
    }

    // Add user message to session
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Enhanced AI processing with campus data
    let aiResponse;
    try {
      // Get campus context for better responses
      const campusContext = await getCampusContext(message);
      console.log('Campus context loaded:', Object.keys(campusContext));
      
      // Try advanced AI first
      if (advancedAI && typeof advancedAI.chat === 'function') {
        console.log('Using advanced AI for response');
        aiResponse = await advancedAI.chat(
          message,
          req.userId.toString(),
          { ...session.context, ...campusContext }
        );
      } else {
        console.log('Using smart response fallback');
        // Fallback to smart campus responses
        aiResponse = await generateSmartResponse(message, campusContext);
      }
      
      console.log('AI Response generated:', aiResponse ? aiResponse.substring(0, 100) : 'No response');
    } catch (error) {
      console.error('AI chat error:', error);
      // Smart fallback based on message content
      aiResponse = await generateSmartResponse(message, {});
    }

    // Ensure we have a valid response
    if (!aiResponse || aiResponse.trim() === '') {
      aiResponse = "I'm here to help! Could you please rephrase your question?";
    }

    // Add AI response to session
    session.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    // Generate speech (if OpenAI TTS is available)
    let audioResponse = null;
    if (process.env.OPENAI_API_KEY) {
      try {
        audioResponse = await generateSpeech(aiResponse);
      } catch (error) {
        console.error('TTS error:', error);
      }
    }

    res.json({
      success: true,
      response: aiResponse,
      audioResponse: audioResponse,
      sessionId: sessionId,
      transcript: message
    });
  } catch (error) {
    console.error('Voice message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process voice message',
      error: error.message
    });
  }
});

// Get voice chat history
router.get('/history/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = voiceSessions.get(sessionId);

    if (!session || session.userId.toString() !== req.userId.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      messages: session.messages,
      startTime: session.startTime
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat history'
    });
  }
});

// End voice chat session
router.post('/end', auth, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = voiceSessions.get(sessionId);

    if (!session || session.userId.toString() !== req.userId.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Store session summary (optional)
    const summary = {
      sessionId,
      userId: session.userId,
      startTime: session.startTime,
      endTime: new Date(),
      messageCount: session.messages.length
    };

    voiceSessions.delete(sessionId);

    res.json({
      success: true,
      message: 'Voice chat session ended',
      summary
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end session'
    });
  }
});

// Text-to-Speech helper function
async function generateSpeech(text) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      {
        model: 'tts-1',
        input: text,
        voice: 'alloy'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    return Buffer.from(response.data).toString('base64');
  } catch (error) {
    console.error('TTS generation error:', error);
    return null;
  }
}

// Test voice command endpoint (for debugging)
router.post('/test', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    console.log('Test voice command:', message);

    // Simple echo response for testing
    const response = {
      success: true,
      message: 'Voice command received successfully',
      echo: message,
      timestamp: new Date().toISOString(),
      userId: req.userId,
      response: `You said: "${message}". Voice commands are working!`
    };

    res.json(response);
  } catch (error) {
    console.error('Test voice command error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

// Multi-agent collaborative response
router.post('/collaborate', auth, async (req, res) => {
  try {
    const { query, context } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }

    const result = await agenticAI.collaborativeProcess(
      query,
      context || {},
      req.userId.toString()
    );

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Collaborative process error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process collaborative query'
    });
  }
});

// Get campus context for better responses
async function getCampusContext(message) {
  const context = {};
  const lowerMessage = message.toLowerCase();
  
  try {
    // Load relevant data based on message content
    if (lowerMessage.includes('course') || lowerMessage.includes('enroll') || lowerMessage.includes('cs')) {
      const Course = require('../models/Course');
      context.courses = await Course.find({}).limit(5);
    }
    
    if (lowerMessage.includes('faculty') || lowerMessage.includes('professor') || lowerMessage.includes('teacher')) {
      const Faculty = require('../models/Faculty');
      context.faculty = await Faculty.find({}).limit(5);
    }
    
    if (lowerMessage.includes('event') || lowerMessage.includes('activity')) {
      const Event = require('../models/Event');
      context.events = await Event.find({ startDate: { $gte: new Date() } }).limit(3);
    }
    
    if (lowerMessage.includes('location') || lowerMessage.includes('building') || lowerMessage.includes('room')) {
      const Navigation = require('../models/Navigation');
      context.navigation = await Navigation.find({}).limit(5);
    }
  } catch (error) {
    console.error('Context loading error:', error);
  }
  
  return context;
}

// Generate smart responses based on message content
async function generateSmartResponse(message, context) {
  const lowerMessage = message.toLowerCase();
  
  // Greeting responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm your Campus Companion AI assistant. I can help you with courses, faculty information, events, campus navigation, and more. What would you like to know?";
  }
  
  // Course-related queries
  if (lowerMessage.includes('course') || lowerMessage.includes('enroll') || lowerMessage.includes('cs')) {
    if (context.courses && context.courses.length > 0) {
      const courseList = context.courses.slice(0, 3).map(c => 
        `${c.code} - ${c.name} (${c.department})`
      ).join(', ');
      return `I can help you with course information! Here are some available courses: ${courseList}. Would you like details about any specific course?`;
    }
    return "I can help you with course enrollment and information. Please specify which course you're interested in, or ask me to show available courses.";
  }
  
  // Faculty queries
  if (lowerMessage.includes('faculty') || lowerMessage.includes('professor') || lowerMessage.includes('teacher')) {
    if (context.faculty && context.faculty.length > 0) {
      const facultyList = context.faculty.slice(0, 3).map(f => 
        `${f.name} from ${f.department}`
      ).join(', ');
      return `Here are some of our faculty members: ${facultyList}. Would you like contact information for any specific faculty member?`;
    }
    return "I can help you find faculty information. Please specify which department or faculty member you're looking for.";
  }
  
  // Event queries
  if (lowerMessage.includes('event') || lowerMessage.includes('activity')) {
    if (context.events && context.events.length > 0) {
      const eventList = context.events.map(e => 
        `${e.title} on ${new Date(e.startDate).toLocaleDateString()}`
      ).join(', ');
      return `Here are upcoming events: ${eventList}. Would you like to register for any of these events?`;
    }
    return "I can help you with campus events and activities. Currently, there are no upcoming events scheduled, but please check back later.";
  }
  
  // Navigation queries
  if (lowerMessage.includes('location') || lowerMessage.includes('building') || lowerMessage.includes('room') || lowerMessage.includes('find')) {
    if (context.navigation && context.navigation.length > 0) {
      const locationList = context.navigation.slice(0, 3).map(n => 
        `${n.name} at ${n.location}`
      ).join(', ');
      return `I can help you navigate the campus! Here are some key locations: ${locationList}. Which location are you looking for?`;
    }
    return "I can help you find locations on campus. Please specify which building, room, or facility you're looking for.";
  }
  
  // Feelings/emotional support
  if (lowerMessage.includes('lonely') || lowerMessage.includes('sad') || lowerMessage.includes('friend') || lowerMessage.includes('feeling')) {
    return "I understand college can sometimes feel overwhelming. While I'm here to help with academic matters, I encourage you to connect with campus counseling services, join student clubs, or participate in campus events to meet new people. Is there anything specific about your studies or campus life I can help you with?";
  }
  
  // Help queries
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return "I'm your Campus Companion AI! I can help you with: course enrollment and information, faculty contacts, upcoming events, campus navigation, timetable management, and general campus questions. Just ask me anything about your campus life!";
  }
  
  // Default response
  return "I'm here to help you with your campus needs! I can assist with courses, faculty information, events, campus navigation, and more. What would you like to know about?";
}

module.exports = router;
