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

export default api;
