const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Gemini AI Service for CampusCompanion
 * Alternative to OpenAI - Free and powerful!
 */

class GeminiAIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initializeGemini();
  }

  initializeGemini() {
    if (process.env.GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        console.log('✅ Gemini AI initialized successfully');
      } catch (error) {
        console.error('❌ Gemini AI initialization error:', error);
      }
    } else {
      console.log('⚠️ GEMINI_API_KEY not found. Using fallback responses.');
    }
  }

  async chat(message, context = {}) {
    if (!this.model) {
      return this.getFallbackResponse(message);
    }

    try {
      const prompt = this.buildPrompt(message, context);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini chat error:', error);
      return this.getFallbackResponse(message);
    }
  }

  buildPrompt(message, context) {
    let prompt = `You are CampusCompanion, an AI assistant for university students. 
You help with academic queries, timetables, courses, study tips, and campus information.

`;

    if (context.user) {
      prompt += `Student Info:
- Name: ${context.user.name}
- Department: ${context.user.department}
- Year: ${context.user.year}
- Semester: ${context.user.semester}

`;
    }

    if (context.courses && context.courses.length > 0) {
      prompt += `Enrolled Courses: ${context.courses.map(c => c.name).join(', ')}\n\n`;
    }

    if (context.timetable && context.timetable.length > 0) {
      prompt += `Today's Classes: ${context.timetable.map(t => t.courseName).join(', ')}\n\n`;
    }

    prompt += `Student Query: ${message}\n\nProvide a helpful, friendly, and concise response:`;

    return prompt;
  }

  async generateStudyPlan(userContext) {
    if (!this.model) {
      return this.getFallbackStudyPlan();
    }

    try {
      const prompt = `You are an AI study planner for university students.

Student Profile:
- Department: ${userContext.department || 'Computer Science'}
- Year: ${userContext.year || 3}
- Semester: ${userContext.semester || 5}
${userContext.courses ? `- Enrolled Courses: ${userContext.courses.map(c => c.name).join(', ')}` : ''}

Create a detailed weekly study plan with:
1. Daily study schedule (Monday to Sunday)
2. Time allocation for each subject
3. Break times
4. Study techniques to use
5. Weekly goals

Make it practical, balanced, and achievable.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Study plan generation error:', error);
      return this.getFallbackStudyPlan();
    }
  }

  async summarizeDocument(text, maxLength = 500) {
    if (!this.model) {
      return 'Document summarization requires Gemini API key. Please configure GEMINI_API_KEY in your environment.';
    }

    try {
      const prompt = `Summarize the following academic document in ${maxLength} words or less. 
Focus on key concepts, main ideas, and important points:

${text.substring(0, 5000)}

Provide a clear, concise summary:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Document summarization error:', error);
      return 'Error summarizing document. Please try again.';
    }
  }

  async getCourseRecommendations(userProfile, availableCourses) {
    if (!this.model) {
      return availableCourses.slice(0, 3);
    }

    try {
      const prompt = `You are a course advisor for university students.

Student Profile:
- Department: ${userProfile.department}
- Year: ${userProfile.year}
- Interests: ${userProfile.interests || 'General'}

Available Courses:
${availableCourses.map(c => `- ${c.name} (${c.code}): ${c.description}`).join('\n')}

Recommend the top 3 courses for this student and explain why each course would be beneficial.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Course recommendation error:', error);
      return availableCourses.slice(0, 3);
    }
  }

  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('course') || lowerMessage.includes('class')) {
      return 'I can help you find courses! Check the Courses page to browse available courses, see details, and enroll.';
    }

    if (lowerMessage.includes('timetable') || lowerMessage.includes('schedule')) {
      return 'You can manage your timetable in the Timetable section. Add classes, check for conflicts, and view your weekly schedule.';
    }

    if (lowerMessage.includes('material') || lowerMessage.includes('notes')) {
      return 'Study materials are available in the Materials section. You can upload, download, and share notes with your peers.';
    }

    if (lowerMessage.includes('faculty') || lowerMessage.includes('professor')) {
      return 'Visit the Faculty Directory to find contact information, office hours, and details about professors.';
    }

    if (lowerMessage.includes('event') || lowerMessage.includes('club')) {
      return 'Check out the Events page to see upcoming campus events, workshops, and club activities. You can register directly!';
    }

    if (lowerMessage.includes('navigation') || lowerMessage.includes('map') || lowerMessage.includes('location')) {
      return 'Use the Campus Navigation feature to find buildings, labs, and facilities on campus with our interactive map.';
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('question')) {
      return 'You can ask questions in the Peer Helpdesk where students help each other. Or explore different sections of CampusCompanion for specific features.';
    }

    return 'I\'m here to help! You can ask me about courses, timetables, study materials, faculty, events, campus navigation, or any academic questions.';
  }

  getFallbackStudyPlan() {
    return `Weekly Study Plan

Monday - Wednesday:
- Morning (9 AM - 12 PM): Focus on core subjects
- Afternoon (2 PM - 5 PM): Practice problems and assignments
- Evening (7 PM - 9 PM): Review and revision

Thursday - Friday:
- Morning (9 AM - 12 PM): Project work and lab assignments
- Afternoon (2 PM - 5 PM): Group study sessions
- Evening (7 PM - 9 PM): Light reading and concept review

Weekend:
- Saturday: Catch up on pending work, practice tests
- Sunday: Relaxation, hobby time, light review

Study Techniques:
1. Pomodoro Technique (25 min study, 5 min break)
2. Active recall and spaced repetition
3. Mind mapping for complex topics
4. Practice with past papers

Remember: Take regular breaks, stay hydrated, and get 7-8 hours of sleep!`;
  }
}

module.exports = new GeminiAIService();
