import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      if (state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Timetable APIs
export const timetableAPI = {
  get: () => api.get('/timetable'),
  create: (data) => api.post('/timetable', data),
  addEntry: (entry) => api.post('/timetable/entry', entry),
  deleteEntry: (entryId) => api.delete(`/timetable/entry/${entryId}`),
  getClashes: () => api.get('/timetable/clashes'),
};

// Course APIs
export const courseAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  getRecommendations: () => api.get('/courses/recommend/me'),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  unenroll: (id) => api.post(`/courses/${id}/unenroll`),
  getEnrolled: () => api.get('/courses/enrolled/me'),
};

// Material APIs
export const materialAPI = {
  getAll: (params) => api.get('/materials', { params }),
  getById: (id) => api.get(`/materials/${id}`),
  upload: (formData) => api.post('/materials/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  like: (id) => api.post(`/materials/${id}/like`),
  download: (id) => api.get(`/materials/${id}/download`),
  getSummary: (id) => api.get(`/materials/${id}/summary`),
  delete: (id) => api.delete(`/materials/${id}`),
};

// Faculty APIs
export const facultyAPI = {
  getAll: (params) => api.get('/faculty', { params }),
  getById: (id) => api.get(`/faculty/${id}`),
  getByDepartment: (dept) => api.get(`/faculty/department/${dept}`),
};

// Event APIs
export const eventAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  register: (id) => api.post(`/events/${id}/register`),
  unregister: (id) => api.post(`/events/${id}/unregister`),
  getRecommendations: () => api.get('/events/recommend/me'),
};

// Helpdesk APIs
export const helpdeskAPI = {
  getAll: (params) => api.get('/helpdesk', { params }),
  getById: (id) => api.get(`/helpdesk/${id}`),
  ask: (question) => api.post('/helpdesk', question),
  answer: (id, answer) => api.post(`/helpdesk/${id}/answer`, answer),
  upvoteQuestion: (id) => api.post(`/helpdesk/${id}/upvote`),
  upvoteAnswer: (questionId, answerId) => api.post(`/helpdesk/${questionId}/answer/${answerId}/upvote`),
  acceptAnswer: (questionId, answerId) => api.post(`/helpdesk/${questionId}/answer/${answerId}/accept`),
};

// Navigation APIs
export const navigationAPI = {
  getAll: (params) => api.get('/navigation', { params }),
  getById: (id) => api.get(`/navigation/${id}`),
  getNearby: (lat, lng, distance) => api.get(`/navigation/nearby/${lat}/${lng}`, { params: { distance } }),
};

// Chatbot APIs
export const chatbotAPI = {
  chat: (message) => api.post('/chatbot/intelligent-chat', { message }),
  fallbackChat: (message) => api.post('/chatbot/chat', { message }),
  solveMath: (problem) => api.post('/chatbot/solve-math', { problem }),
  voiceQuery: (query) => api.post('/chatbot/voice', { query }),
};

// Agentic AI APIs
export const agenticAIAPI = {
  // Core Agentic AI
  getAgentStatus: () => api.get('/agenticAI/agent-status'),
  understandGoals: (goal) => api.post('/agenticAI/understand-goals', { goal }),
  createPlan: (data) => api.post('/agenticAI/create-plan', data),
  executePlan: (taskId) => api.post('/agenticAI/execute-plan', { taskId }),
  getMyPlan: () => api.get('/agenticAI/my-plan'),
  getMyPlans: (params) => api.get('/agenticAI/my-plans', { params }),
  getPlanById: (planId) => api.get(`/agenticAI/plan/${planId}`),
  updateTaskStatus: (planId, phaseIndex, taskIndex, status) => 
    api.put(`/agenticAI/plan/${planId}/task/${phaseIndex}/${taskIndex}`, { status }),
  completeTask: (taskId) => api.post('/agenticAI/complete-task', { taskId }),
  getNotifications: (params) => api.get('/agenticAI/notifications', { params }),
  markNotificationRead: (notificationId) => api.put(`/agenticAI/notifications/${notificationId}/read`),
  getTests: (params) => api.get('/agenticAI/tests', { params }),
  getTestById: (testId) => api.get(`/agenticAI/tests/${testId}`),
  submitTest: (testId, answers) => api.post(`/agenticAI/tests/${testId}/submit`, { answers }),
  generateStudyPlan: (topics, timeline) => api.post('/agenticAI/study-plan', { topics, timeline }),
  getCareerAdvice: () => api.post('/agenticAI/career-advice'),
  getAutomationStatus: () => api.get('/agenticAI/automation-status'),
};

// Agentic Features APIs (Student)
export const agenticFeaturesAPI = {
  // Dashboard
  getDashboard: () => api.get('/agenticFeatures/dashboard'),
  
  // Assignments
  getAssignments: (params) => api.get('/agenticFeatures/assignments', { params }),
  createAssignment: (data) => api.post('/agenticFeatures/assignments/create', data),
  updateAssignment: (id, data) => api.put(`/agenticFeatures/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/agenticFeatures/assignments/${id}`),
  manageAssignments: () => api.get('/agenticFeatures/assignments/manage'),
  generateContent: (data) => api.post('/agenticFeatures/assignments/generate-content', data),
  convertToIEEE: (data) => api.post('/agenticFeatures/assignments/convert-ieee', data),
  
  // Exam Prep
  getExamPreps: (params) => api.get('/agenticFeatures/exam-prep', { params }),
  createExamPrep: (data) => api.post('/agenticFeatures/exam-prep/create', data),
  getExamPrepById: (id) => api.get(`/agenticFeatures/exam-prep/${id}`),
  updateExamProgress: (id, data) => api.put(`/agenticFeatures/exam-prep/${id}/progress`, data),
  
  // Materials
  findMaterials: (query, options) => api.post('/agenticFeatures/materials/find', { query, options }),
  
  // Events
  autoRegisterEvents: (query, preferences) => api.post('/agenticFeatures/events/auto-register', { query, preferences }),
  
  // Bookings
  getBookings: (params) => api.get('/agenticFeatures/bookings', { params }),
  
  // Preferences
  getPreferences: () => api.get('/agenticFeatures/preferences'),
  updatePreferences: (data) => api.put('/agenticFeatures/preferences', data),
};

// Admin Agentic Features APIs
export const adminAgenticAPI = {
  // Reports
  generateReport: (reportType, filters) => api.post('/adminAgenticFeatures/reports/generate', { reportType, filters }),
  
  // Helpdesk
  manageHelpdesk: (action, data) => api.post('/adminAgenticFeatures/helpdesk/manage', { action, data }),
  autoProcessTickets: () => api.post('/adminAgenticFeatures/helpdesk/auto-process'),
  generateResponse: (ticketId, question) => api.post('/adminAgenticFeatures/helpdesk/generate-response', { ticketId, question }),
  
  // Scheduling
  optimizeSchedule: (scheduleType, data) => api.post('/adminAgenticFeatures/scheduling/optimize', { scheduleType, data }),
  generateTimetable: (data) => api.post('/adminAgenticFeatures/scheduling/timetable', data),
  generateExamSchedule: (data) => api.post('/adminAgenticFeatures/scheduling/exam-schedule', data),
  
  // User Management
  manageUsers: (action, data) => api.post('/adminAgenticFeatures/users/manage', { action, data }),
  bulkCreateUsers: (users) => api.post('/adminAgenticFeatures/users/bulk-create', { users }),
  getInactiveUsers: (days) => api.get('/adminAgenticFeatures/users/inactive', { params: { days } }),
  detectAnomalies: () => api.get('/adminAgenticFeatures/users/anomalies'),
  
  // Communication
  draftAnnouncement: (data) => api.post('/adminAgenticFeatures/communication/draft', data),
  sendTargetedMessage: (message, filters) => api.post('/adminAgenticFeatures/communication/targeted', { message, filters }),
  createCampaign: (data) => api.post('/adminAgenticFeatures/communication/campaign', data),
};

export default api;
