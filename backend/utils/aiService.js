const { ChatOpenAI } = require('@langchain/openai');
const { PromptTemplate } = require('langchain/prompts');
const { LLMChain } = require('langchain/chains');

class AIService {
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

  async generateResponse(prompt, context = {}) {
    if (!this.model) {
      return this.getFallbackResponse(prompt);
    }

    try {
      const template = `You are CampusCompanion, an AI assistant for university students. 
      You help with campus queries, timetables, courses, faculty information, and general student support.
      
      Context: {context}
      
      Student Query: {query}
      
      Provide a helpful, concise, and friendly response:`;

      const promptTemplate = new PromptTemplate({
        template: template,
        inputVariables: ['context', 'query']
      });

      const chain = new LLMChain({
        llm: this.model,
        prompt: promptTemplate
      });

      const response = await chain.call({
        context: JSON.stringify(context),
        query: prompt
      });

      return response.text;
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  getFallbackResponse(query) {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('timetable') || lowerQuery.includes('schedule')) {
      return 'You can view your timetable in the Timetable section. If you need to add or modify classes, use the timetable management feature.';
    }

    if (lowerQuery.includes('course') || lowerQuery.includes('class')) {
      return 'Check out the Courses section to browse available courses, view details, and get recommendations based on your interests.';
    }

    if (lowerQuery.includes('faculty') || lowerQuery.includes('professor') || lowerQuery.includes('teacher')) {
      return 'Visit the Faculty Directory to find contact information, office hours, and book appointments with faculty members.';
    }

    if (lowerQuery.includes('material') || lowerQuery.includes('notes') || lowerQuery.includes('study')) {
      return 'The Materials section has study materials, notes, and resources uploaded by students and faculty. You can also upload your own materials.';
    }

    if (lowerQuery.includes('event') || lowerQuery.includes('fest') || lowerQuery.includes('club')) {
      return 'Check the Events section for upcoming workshops, fests, hackathons, and club activities. You can register for events directly.';
    }

    if (lowerQuery.includes('navigation') || lowerQuery.includes('where') || lowerQuery.includes('location')) {
      return 'Use the Campus Navigation feature to find buildings, labs, and facilities on campus with interactive maps and directions.';
    }

    if (lowerQuery.includes('help') || lowerQuery.includes('question')) {
      return 'You can ask questions in the Peer Helpdesk where students and faculty can help answer your queries. You can also browse existing questions.';
    }

    return 'I\'m here to help! You can ask me about timetables, courses, faculty, study materials, campus navigation, events, or general campus queries. How can I assist you today?';
  }

  async summarizeText(text) {
    if (!this.model) {
      return text.substring(0, 200) + '...';
    }

    try {
      const template = `Summarize the following text in 2-3 concise sentences:
      
      {text}
      
      Summary:`;

      const promptTemplate = new PromptTemplate({
        template: template,
        inputVariables: ['text']
      });

      const chain = new LLMChain({
        llm: this.model,
        prompt: promptTemplate
      });

      const response = await chain.call({ text });
      return response.text;
    } catch (error) {
      console.error('Summarization Error:', error);
      return text.substring(0, 200) + '...';
    }
  }

  async generateStudyPlan(courses, preferences) {
    if (!this.model) {
      return 'Study plan generation requires AI configuration. Please set up OpenAI API key.';
    }

    try {
      const template = `Create a personalized weekly study plan for a student with the following courses and preferences:
      
      Courses: {courses}
      Preferences: {preferences}
      
      Generate a structured study plan with daily recommendations:`;

      const promptTemplate = new PromptTemplate({
        template: template,
        inputVariables: ['courses', 'preferences']
      });

      const chain = new LLMChain({
        llm: this.model,
        prompt: promptTemplate
      });

      const response = await chain.call({
        courses: JSON.stringify(courses),
        preferences: JSON.stringify(preferences)
      });

      return response.text;
    } catch (error) {
      console.error('Study Plan Error:', error);
      return 'Unable to generate study plan at this time.';
    }
  }

  async recommendCourses(userProfile, availableCourses) {
    if (!this.model) {
      return availableCourses.slice(0, 5);
    }

    try {
      const template = `Based on the student profile and available courses, recommend the top 5 most suitable courses:
      
      Student Profile: {profile}
      Available Courses: {courses}
      
      Provide course codes and brief reasons for each recommendation:`;

      const promptTemplate = new PromptTemplate({
        template: template,
        inputVariables: ['profile', 'courses']
      });

      const chain = new LLMChain({
        llm: this.model,
        prompt: promptTemplate
      });

      const response = await chain.call({
        profile: JSON.stringify(userProfile),
        courses: JSON.stringify(availableCourses.map(c => ({ code: c.code, name: c.name, tags: c.tags })))
      });

      return response.text;
    } catch (error) {
      console.error('Course Recommendation Error:', error);
      return availableCourses.slice(0, 5);
    }
  }
}

module.exports = new AIService();
