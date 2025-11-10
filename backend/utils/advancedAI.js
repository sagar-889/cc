const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Advanced AI Service - ChatGPT-like capabilities
 * Handles: General queries, math problems, coding, explanations, problem-solving
 */

class AdvancedAIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.conversationHistory = new Map(); // Store conversation history per user
    this.initializeAI();
  }

  initializeAI() {
    if (process.env.GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use gemini-pro for text, gemini-pro-vision for images
        this.model = this.genAI.getGenerativeModel({
          model: 'gemini-pro',
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        });
        console.log('✅ Advanced AI initialized successfully');
      } catch (error) {
        console.error('❌ Advanced AI initialization error:', error.message);
        console.log('⚠️ AI features will be limited to fallback responses');
        this.model = null;
      }
    } else {
      console.log('⚠️ GEMINI_API_KEY not found. AI features will be limited.');
    }
  }

  /**
   * Main chat function - handles all types of queries
   */
  async chat(message, userId, context = {}) {
    if (!this.model) {
      console.log('⚠️ No AI model available, using enhanced fallback');
      return this.getEnhancedFallbackResponse(message);
    }

    try {
      // Get conversation history
      const history = this.getConversationHistory(userId);
      
      // Build comprehensive prompt
      const prompt = this.buildAdvancedPrompt(message, context, history);
      
      // Generate response with retry logic
      let retries = 2;
      let lastError;
      
      while (retries > 0) {
        try {
          const result = await this.model.generateContent(prompt);
          const response = await result.response;
          const responseText = response.text();
          
          // Store in conversation history
          this.addToHistory(userId, 'user', message);
          this.addToHistory(userId, 'assistant', responseText);
          
          console.log('✅ AI response generated successfully');
          return responseText;
        } catch (err) {
          lastError = err;
          retries--;
          if (retries > 0) {
            console.log(`⚠️ Retry attempt remaining: ${retries}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          }
        }
      }
      
      throw lastError;
    } catch (error) {
      console.error('Advanced AI chat error:', error.message || error);
      // Check if it's a rate limit error
      if (error.message && (error.message.includes('rate limit') || error.message.includes('429') || error.message.includes('quota'))) {
        console.log('⚠️ Rate limit hit, using enhanced fallback');
      }
      return this.getEnhancedFallbackResponse(message);
    }
  }

  /**
   * Enhanced fallback with better code generation
   */
  getEnhancedFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Code generation requests
    if (lowerMessage.includes('code') || lowerMessage.includes('program') || lowerMessage.includes('function')) {
      if (lowerMessage.includes('python') && (lowerMessage.includes('add') || lowerMessage.includes('sum') || lowerMessage.includes('two numbers'))) {
        return `Here's a Python function to add two numbers:

\`\`\`python
def add_numbers(a, b):
    """
    Add two numbers and return the result
    
    Args:
        a: First number
        b: Second number
    
    Returns:
        Sum of a and b
    """
    return a + b

# Example usage
num1 = 5
num2 = 3
result = add_numbers(num1, num2)
print(f"The sum of {num1} and {num2} is: {result}")
\`\`\`

This function takes two parameters and returns their sum. You can call it with any numbers!`;
      }
      
      if (lowerMessage.includes('reverse') && lowerMessage.includes('string')) {
        return `Here's how to reverse a string in Python:

\`\`\`python
def reverse_string(text):
    """
    Reverse a string
    
    Args:
        text: String to reverse
    
    Returns:
        Reversed string
    """
    return text[::-1]

# Example usage
original = "Hello World"
reversed_text = reverse_string(original)
print(f"Original: {original}")
print(f"Reversed: {reversed_text}")
\`\`\`

The \`[::-1]\` slice notation reverses the string efficiently!`;
      }
      
      if (lowerMessage.includes('javascript') || lowerMessage.includes('js')) {
        return `Here's a JavaScript example:

\`\`\`javascript
// Function to add two numbers
function addNumbers(a, b) {
    return a + b;
}

// Example usage
const num1 = 5;
const num2 = 3;
const result = addNumbers(num1, num2);
console.log(\`The sum is: \${result}\`);
\`\`\`

This is a simple JavaScript function that adds two numbers!`;
      }
      
      return `I can help you with code! Here's a basic template:

\`\`\`python
# Your code here
def your_function(param):
    # Add your logic
    return result
\`\`\`

Please specify:
1. What programming language? (Python, JavaScript, Java, etc.)
2. What should the code do?
3. Any specific requirements?

Then I can generate the exact code you need!`;
    }
    
    // Use the original fallback for other queries
    return this.getFallbackResponse(message);
  }

  /**
   * Build advanced prompt with context and capabilities
   */
  buildAdvancedPrompt(message, context, history) {
    let prompt = `You are an advanced AI assistant with ChatGPT-like capabilities. You can:

1. **Answer General Questions**: Provide accurate, helpful information on any topic
2. **Solve Math Problems**: Step-by-step solutions for algebra, calculus, statistics, etc.
3. **Help with Coding**: Debug code, explain concepts, write code in any language
4. **Explain Concepts**: Break down complex topics into simple explanations
5. **Problem Solving**: Analyze problems and provide logical solutions
6. **Academic Help**: Assist with homework, essays, research, and study strategies
7. **Creative Tasks**: Write, brainstorm, and generate ideas

**Your Personality**:
- Friendly, patient, and encouraging
- Clear and concise explanations
- Use examples when helpful
- Ask clarifying questions if needed
- Admit when you're unsure

`;

    // Add user context if available
    if (context.user) {
      prompt += `\n**Student Info**:
- Name: ${context.user.name || 'Student'}
- Department: ${context.user.department || 'N/A'}
- Year: ${context.user.year || 'N/A'}
`;
    }

    // Add campus-specific context
    if (context.type) {
      prompt += `\n**Context Type**: ${context.type}`;
      if (context.data) {
        prompt += `\n**Relevant Data**: ${JSON.stringify(context.data).substring(0, 500)}`;
      }
    }

    // Add recent conversation history (last 5 messages)
    if (history && history.length > 0) {
      prompt += `\n\n**Recent Conversation**:`;
      const recentHistory = history.slice(-5);
      recentHistory.forEach(msg => {
        prompt += `\n${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.content}`;
      });
    }

    // Add current query
    prompt += `\n\n**Current Query**: ${message}`;
    prompt += `\n\n**Your Response** (be helpful, accurate, and engaging):`;

    return prompt;
  }

  /**
   * Solve mathematical problems with step-by-step solutions
   */
  async solveMath(problem, userId) {
    if (!this.model) {
      return 'Math solving requires AI configuration. Please set up GEMINI_API_KEY.';
    }

    try {
      const prompt = `You are a mathematics tutor. Solve this problem with detailed step-by-step explanation:

**Problem**: ${problem}

**Instructions**:
1. Identify the type of problem
2. Show each step clearly
3. Explain the reasoning
4. Provide the final answer
5. Add tips or alternative methods if applicable

**Solution**:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const solution = response.text();
      
      this.addToHistory(userId, 'user', `Solve: ${problem}`);
      this.addToHistory(userId, 'assistant', solution);
      
      return solution;
    } catch (error) {
      console.error('Math solving error:', error);
      return 'Error solving math problem. Please try rephrasing your question.';
    }
  }

  /**
   * Help with coding - debug, explain, or write code
   */
  async helpWithCode(query, code, language, userId) {
    if (!this.model) {
      return 'Code assistance requires AI configuration.';
    }

    try {
      const prompt = `You are an expert programming tutor.

**Query**: ${query}
${code ? `**Code**:\n\`\`\`${language || 'javascript'}\n${code}\n\`\`\`` : ''}

**Instructions**:
1. Analyze the code/query
2. Identify issues or provide explanation
3. Show corrected code or examples
4. Explain best practices
5. Suggest improvements

**Response**:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const helpText = response.text();
      
      this.addToHistory(userId, 'user', query);
      this.addToHistory(userId, 'assistant', helpText);
      
      return helpText;
    } catch (error) {
      console.error('Code help error:', error);
      return 'Error providing code assistance. Please try again.';
    }
  }

  /**
   * Explain complex concepts in simple terms
   */
  async explainConcept(concept, level = 'beginner', userId) {
    if (!this.model) {
      return 'Concept explanation requires AI configuration.';
    }

    try {
      const prompt = `Explain the following concept to a ${level} level student:

**Concept**: ${concept}

**Requirements**:
1. Start with a simple definition
2. Use analogies and examples
3. Break down into key points
4. Provide real-world applications
5. Suggest resources for further learning

**Explanation**:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const explanation = response.text();
      
      this.addToHistory(userId, 'user', `Explain: ${concept}`);
      this.addToHistory(userId, 'assistant', explanation);
      
      return explanation;
    } catch (error) {
      console.error('Concept explanation error:', error);
      return 'Error explaining concept. Please try again.';
    }
  }

  /**
   * Generate study plan based on topics and timeline
   */
  async generateStudyPlan(topics, timeline, userContext, userId) {
    if (!this.model) {
      return this.getFallbackStudyPlan(topics, timeline, userContext);
    }

    try {
      const prompt = `Create a detailed study plan:

**Topics**: ${Array.isArray(topics) ? topics.join(', ') : topics}
**Timeline**: ${timeline}
**Student Level**: ${userContext.year || 'Undergraduate'}
**Department**: ${userContext.department || 'General'}

**Create a plan with**:
1. Daily/weekly schedule
2. Time allocation per topic
3. Study techniques for each topic
4. Practice exercises
5. Review sessions
6. Milestones and checkpoints

**Study Plan**:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Study plan error:', error.message || error);
      if (error.message && (error.message.includes('rate limit') || error.message.includes('429') || error.message.includes('quota'))) {
        console.log('⚠️ Rate limit hit, using fallback study plan');
      }
      return this.getFallbackStudyPlan(topics, timeline, userContext);
    }
  }

  /**
   * Analyze and summarize documents
   */
  async analyzeDocument(text, analysisType = 'summary', userId) {
    if (!this.model) {
      return 'Document analysis requires AI configuration.';
    }

    try {
      let prompt = '';
      
      switch (analysisType) {
        case 'summary':
          prompt = `Summarize this document concisely:\n\n${text.substring(0, 4000)}`;
          break;
        case 'keypoints':
          prompt = `Extract key points from this document:\n\n${text.substring(0, 4000)}`;
          break;
        case 'questions':
          prompt = `Generate study questions based on this document:\n\n${text.substring(0, 4000)}`;
          break;
        default:
          prompt = `Analyze this document:\n\n${text.substring(0, 4000)}`;
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Document analysis error:', error);
      return 'Error analyzing document. Please try again.';
    }
  }

  /**
   * Brainstorm and generate ideas
   */
  async brainstorm(topic, count = 5, userId) {
    if (!this.model) {
      return 'Brainstorming requires AI configuration.';
    }

    try {
      const prompt = `Brainstorm ${count} creative and practical ideas for: ${topic}

For each idea, provide:
1. Brief description
2. Why it's valuable
3. How to implement it

**Ideas**:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Brainstorming error:', error);
      return 'Error generating ideas. Please try again.';
    }
  }

  /**
   * Answer questions with sources and explanations
   */
  async answerQuestion(question, context, userId) {
    if (!this.model) {
      return this.getFallbackResponse(question);
    }

    try {
      const prompt = `Answer this question comprehensively:

**Question**: ${question}
${context ? `**Context**: ${JSON.stringify(context)}` : ''}

**Provide**:
1. Direct answer
2. Detailed explanation
3. Examples if applicable
4. Related concepts
5. Further reading suggestions

**Answer**:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const answer = response.text();
      
      this.addToHistory(userId, 'user', question);
      this.addToHistory(userId, 'assistant', answer);
      
      return answer;
    } catch (error) {
      console.error('Question answering error:', error);
      return 'Error answering question. Please try again.';
    }
  }

  /**
   * Conversation history management
   */
  getConversationHistory(userId) {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    return this.conversationHistory.get(userId);
  }

  addToHistory(userId, role, content) {
    const history = this.getConversationHistory(userId);
    history.push({ role, content, timestamp: new Date() });
    
    // Keep only last 20 messages to avoid token limits
    if (history.length > 20) {
      history.shift();
    }
  }

  clearHistory(userId) {
    this.conversationHistory.delete(userId);
  }

  /**
   * Fallback responses when AI is not available
   */
  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Career advice fallback
    if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('internship')) {
      return this.getFallbackCareerAdvice();
    }

    // Exam prep fallback
    if (lowerMessage.includes('exam') || lowerMessage.includes('test') || lowerMessage.includes('preparation')) {
      return this.getFallbackExamPrep();
    }

    // Learning path fallback
    if (lowerMessage.includes('learning path') || lowerMessage.includes('roadmap') || lowerMessage.includes('skill')) {
      return this.getFallbackLearningPath();
    }

    // Timetable queries
    if (lowerMessage.includes('timetable') || lowerMessage.includes('schedule') || lowerMessage.includes('class')) {
      return 'You can view and manage your timetable in the **Timetable** section. Add your classes, check for clashes, and get AI-powered schedule recommendations!';
    }

    // Course queries
    if (lowerMessage.includes('course') || lowerMessage.includes('subject')) {
      return 'Browse available courses in the **Courses** section. You can enroll in courses, view details, and get personalized recommendations based on your interests!';
    }

    // Faculty queries
    if (lowerMessage.includes('faculty') || lowerMessage.includes('professor') || lowerMessage.includes('teacher')) {
      return 'Check out the **Faculty Directory** to find faculty members, their contact information, office hours, and areas of specialization. You can also request appointments!';
    }

    // Materials queries
    if (lowerMessage.includes('material') || lowerMessage.includes('notes') || lowerMessage.includes('study')) {
      return 'Find study materials, notes, and resources in the **Materials** section. You can download materials, like helpful resources, and even upload your own notes to help others!';
    }

    // Events queries
    if (lowerMessage.includes('event') || lowerMessage.includes('fest') || lowerMessage.includes('workshop')) {
      return 'Discover upcoming events, workshops, and fests in the **Events** section. Register for events, get recommendations, and never miss out on campus activities!';
    }

    // Navigation queries
    if (lowerMessage.includes('where') || lowerMessage.includes('location') || lowerMessage.includes('find') || lowerMessage.includes('navigation')) {
      return 'Use the **Campus Navigation** feature to find buildings, labs, and facilities on campus. Get directions and explore the campus map!';
    }

    // Helpdesk queries
    if (lowerMessage.includes('help') || lowerMessage.includes('question') || lowerMessage.includes('ask')) {
      return 'Visit the **Peer Helpdesk** to ask questions and get answers from students and faculty. You can also browse existing questions and upvote helpful answers!';
    }

    // Math queries
    if (lowerMessage.includes('math') || lowerMessage.includes('solve') || lowerMessage.includes('calculate')) {
      return 'I can help with math problems! Try asking me specific math questions like "Solve x² + 5x + 6 = 0" or "What is the derivative of x³?"';
    }

    // Coding queries
    if (lowerMessage.includes('code') || lowerMessage.includes('program') || lowerMessage.includes('debug')) {
      return 'I can assist with coding! Ask me about programming concepts, debugging tips, or specific coding problems. For example: "How do I reverse a string in Python?"';
    }

    // Explanation queries
    if (lowerMessage.includes('explain') || lowerMessage.includes('what is') || lowerMessage.includes('how does')) {
      return 'I can explain concepts! Ask me about any topic you\'d like to understand better. For example: "Explain machine learning" or "What is recursion?"';
    }

    // Greeting
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'Hello! 👋 I\'m your CampusCompanion AI assistant. I can help you with:\n\n• Timetables and schedules\n• Course information\n• Faculty directory\n• Study materials\n• Campus events\n• Navigation\n• Math problems\n• Coding help\n• Concept explanations\n\nWhat would you like to know?';
    }

    // Default helpful response
    return 'I\'m here to help! I can assist you with:\n\n📚 **Academic**: Timetables, courses, materials, faculty\n🎯 **Campus Life**: Events, navigation, helpdesk\n🤖 **AI Features**: Math solving, coding help, explanations\n\nWhat would you like to know about?';
  }

  getFallbackCareerAdvice() {
    return `**Career Guidance & Development Plan**

**1. Career Paths to Explore**:
- Software Development (Full-stack, Backend, Frontend)
- Data Science & Analytics
- Cloud Computing & DevOps
- Cybersecurity
- AI/ML Engineering
- Product Management
- Research & Academia

**2. Essential Skills to Develop**:

**Technical Skills**:
✓ Programming languages (Python, Java, JavaScript)
✓ Data structures and algorithms
✓ Database management (SQL, NoSQL)
✓ Version control (Git)
✓ Cloud platforms (AWS, Azure, GCP)
✓ Web development frameworks

**Soft Skills**:
✓ Communication and presentation
✓ Problem-solving and critical thinking
✓ Teamwork and collaboration
✓ Time management
✓ Leadership and initiative

**3. Internship Opportunities**:
- Apply to tech companies (startups and MNCs)
- Look for summer internships (May-July)
- Consider remote internships for flexibility
- Use platforms: LinkedIn, Internshala, AngelList
- Network with alumni and attend career fairs

**4. Industry Trends**:
- AI and Machine Learning integration
- Cloud-native development
- Remote work culture
- Sustainability in tech
- Web3 and blockchain
- Low-code/no-code platforms

**5. Recommended Certifications**:
- AWS Certified Solutions Architect
- Google Cloud Professional
- Microsoft Azure Fundamentals
- CompTIA Security+
- Certified Kubernetes Administrator
- Professional Scrum Master

**6. Networking Strategies**:
- Join professional communities (GitHub, Stack Overflow)
- Attend tech meetups and conferences
- Connect with professionals on LinkedIn
- Participate in hackathons
- Contribute to open-source projects
- Build a strong online portfolio

**Action Steps**:
1. Create/update your LinkedIn profile
2. Build 2-3 solid projects for your portfolio
3. Start applying for internships 3-4 months in advance
4. Practice coding on platforms like LeetCode
5. Attend at least one tech event per month
6. Reach out to 5 professionals in your field

**Remember**: Your career journey is unique. Focus on continuous learning and building real-world experience!`;
  }

  getFallbackExamPrep() {
    return `**Comprehensive Exam Preparation Strategy**

**Phase 1: Planning (Week 1)**
- Gather all study materials and syllabus
- Identify important topics and weightage
- Create a realistic study schedule
- Organize notes and resources

**Phase 2: Learning (Weeks 2-4)**

**Daily Schedule**:
- Morning (9 AM - 12 PM): Study new topics
- Afternoon (2 PM - 5 PM): Practice problems
- Evening (7 PM - 9 PM): Review and revision

**Study Techniques**:
✓ Active Recall: Test yourself regularly
✓ Spaced Repetition: Review at increasing intervals
✓ Pomodoro Technique: 25 min study, 5 min break
✓ Feynman Technique: Explain concepts simply
✓ Mind Mapping: Visualize connections

**Phase 3: Practice (Week 5)**
- Solve previous year papers
- Take timed mock tests
- Identify weak areas
- Focus on problem-solving speed
- Practice writing answers

**Phase 4: Revision (Week 6)**
- Review all topics systematically
- Focus on formulas and key concepts
- Revise weak areas multiple times
- Quick revision notes
- Stay calm and confident

**Topic-wise Strategy**:

**Theory Subjects**:
- Read and understand concepts
- Create summary notes
- Use mnemonics for memorization
- Practice explaining to others

**Problem-solving Subjects**:
- Understand formulas and derivations
- Practice 20-30 problems per topic
- Learn shortcut methods
- Time yourself while solving

**Time Management Tips**:
- Allocate time based on marks weightage
- Spend more time on high-scoring topics
- Don't get stuck on difficult questions
- Review answers if time permits

**Mock Test Schedule**:
- Week 5: 2-3 full-length mock tests
- Week 6: 1 mock test + topic-wise tests
- Analyze mistakes after each test
- Improve speed and accuracy

**Exam Day Strategy**:
1. Read all questions first (5 min)
2. Attempt easy questions first
3. Manage time per section
4. Leave difficult questions for last
5. Review answers (10 min)

**Health & Wellness**:
- Sleep 7-8 hours daily
- Exercise for 30 minutes
- Eat nutritious meals
- Stay hydrated
- Take short breaks
- Avoid last-minute cramming

**Stress Management**:
- Practice deep breathing
- Stay positive and confident
- Avoid comparing with others
- Take regular breaks
- Talk to friends/family

**Resources**:
- Textbooks and reference books
- Online tutorials and videos
- Previous year papers
- Study groups
- Teacher consultations

**Remember**: Consistent effort beats last-minute cramming. Stay focused, stay healthy, and believe in yourself!`;
  }

  getFallbackLearningPath() {
    return `**Personalized Learning Path & Roadmap**

**Phase 1: Foundation (Months 1-3)**

**Short-term Goals**:
✓ Master core concepts in your field
✓ Build strong programming fundamentals
✓ Complete 2-3 beginner projects
✓ Establish daily learning habits

**Focus Areas**:
- Data structures and algorithms
- Programming language proficiency
- Problem-solving skills
- Basic web development
- Version control (Git)

**Resources**:
- Online courses (Coursera, Udemy, edX)
- YouTube tutorials
- Documentation and books
- Coding practice platforms

**Projects**:
1. Personal portfolio website
2. Simple CRUD application
3. Command-line tool

**Phase 2: Intermediate (Months 4-6)**

**Medium-term Goals**:
✓ Specialize in 2-3 technologies
✓ Build 3-4 intermediate projects
✓ Contribute to open source
✓ Start building professional network

**Focus Areas**:
- Advanced programming concepts
- Database management
- API development
- Frontend/Backend frameworks
- Testing and debugging

**Skill Development**:
- System design basics
- Cloud computing fundamentals
- DevOps practices
- Agile methodologies

**Projects**:
1. Full-stack web application
2. Mobile app or desktop application
3. API integration project
4. Open-source contribution

**Phase 3: Advanced (Months 7-12)**

**Long-term Goals**:
✓ Master advanced technologies
✓ Build production-ready applications
✓ Gain industry experience (internship)
✓ Develop leadership skills

**Focus Areas**:
- Advanced system design
- Performance optimization
- Security best practices
- Scalability and architecture
- Specialized domain knowledge

**Professional Development**:
- Technical writing and blogging
- Public speaking and presentations
- Mentoring others
- Building personal brand

**Projects**:
1. Large-scale application
2. Microservices architecture
3. Real-world problem solution
4. Capstone project

**Certification Paths**:

**Cloud Computing**:
- AWS Certified Developer
- Google Cloud Associate
- Azure Fundamentals

**Development**:
- Full-stack certifications
- Specialized framework certifications
- Security certifications

**Data & AI**:
- Data Science certifications
- Machine Learning specializations
- Big Data certifications

**Learning Resources**:

**Online Platforms**:
- Coursera, edX, Udacity
- Pluralsight, LinkedIn Learning
- freeCodeCamp, The Odin Project

**Practice Platforms**:
- LeetCode, HackerRank
- CodeChef, Codeforces
- Project Euler

**Communities**:
- GitHub, Stack Overflow
- Reddit (r/programming, r/learnprogramming)
- Discord servers
- Local meetups

**Milestones & Checkpoints**:

**Month 3**: Complete foundation, 3 projects
**Month 6**: Intermediate skills, open-source contribution
**Month 9**: Advanced concepts, internship application
**Month 12**: Specialization, job-ready portfolio

**Success Metrics**:
- Projects completed
- Skills acquired
- Certifications earned
- Network connections
- Interview performance

**Daily Learning Routine**:
- 2 hours: Structured learning
- 1 hour: Coding practice
- 1 hour: Project work
- 30 min: Reading/research

**Weekly Goals**:
- Complete 1 course module
- Solve 10-15 coding problems
- Work on project progress
- Write 1 blog post/documentation

**Tips for Success**:
1. Stay consistent with daily practice
2. Build projects, not just tutorials
3. Document your learning journey
4. Network with professionals
5. Don't fear failure, learn from it
6. Focus on depth, not just breadth
7. Keep updating your skills

**Remember**: Learning is a continuous journey. Stay curious, stay motivated, and keep building!`;
  }

  getFallbackStudyPlan(topics, timeline, userContext) {
    const topicsStr = Array.isArray(topics) ? topics.join(', ') : topics;
    const dept = userContext?.department || 'your department';
    const year = userContext?.year || 'your year';
    
    return `**Personalized Study Plan**

**Student Profile**: ${year} year ${dept} student
**Topics to Cover**: ${topicsStr}
**Timeline**: ${timeline || '1 week'}

**Weekly Study Schedule**:

**Monday - Wednesday**: Core Concepts
- Morning (9 AM - 12 PM): Attend lectures and take detailed notes
- Afternoon (2 PM - 5 PM): Practice problems and exercises
- Evening (7 PM - 9 PM): Review notes and create summaries

**Thursday - Friday**: Application & Practice
- Morning (9 AM - 12 PM): Lab work, projects, and hands-on practice
- Afternoon (2 PM - 5 PM): Group study sessions
- Evening (7 PM - 9 PM): Concept reinforcement and doubt clearing

**Weekend**:
- Saturday: Practice tests, mock exams, and problem-solving
- Sunday: Light review, prepare for next week, and relaxation

**Study Techniques**:
✓ Pomodoro Technique (25 min focus, 5 min break)
✓ Active recall and spaced repetition
✓ Mind mapping for complex topics
✓ Practice with past papers and sample questions
✓ Teach concepts to others (Feynman technique)

**Topic-wise Breakdown**:
- Allocate 2-3 hours per major topic
- Start with fundamentals before advanced concepts
- Include regular practice sessions
- Schedule review sessions every 3 days

**Milestones**:
- Day 3: Complete basic concepts
- Day 5: Finish practice problems
- Day 7: Final review and self-assessment

**Tips**: 
- Stay consistent with your schedule
- Take regular breaks to avoid burnout
- Get 7-8 hours of sleep
- Stay hydrated and eat healthy
- Don't hesitate to ask for help when needed

**Note**: This is a general study plan. Adjust based on your personal learning pace and preferences!`;
  }
}

module.exports = new AdvancedAIService();
