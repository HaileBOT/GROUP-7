import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

console.log('API URL:', API_BASE_URL);

// Create axios instance
export const apiService = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiService.interceptors.request.use(
  (config) => {
    // Token will be added by individual components using getIdToken()
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiService.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service methods
export const authAPI = {
  register: (userData) => apiService.post('/auth/register', userData),
  getMe: (token) => apiService.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  verify2FA: (code, token) => apiService.post('/auth/verify-2fa', { code }, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

export const userAPI = {
  getUser: (id, token) => apiService.get(`/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  updateUser: (id, userData, token) => apiService.put(`/users/${id}`, userData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  uploadPhoto: (id, formData, token) => apiService.post(`/users/${id}/photo`, formData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  }),
  deletePhoto: (id, token) => apiService.delete(`/users/${id}/photo`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getMentors: (params = {}) => apiService.get('/users', { params }),
  applyMentor: (applicationData, token) => apiService.post('/users/mentors/apply', applicationData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

export const studentAPI = {
  getAllStudents: (params = {}, token) => apiService.get('/students', {
    params,
    headers: { Authorization: `Bearer ${token}` }
  }),
};

export const courseAPI = {
  getCourses: () => apiService.get('/courses'),
  createCourse: (courseData, token) => apiService.post('/courses', courseData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  updateCourse: (id, courseData, token) => apiService.put(`/courses/${id}`, courseData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  deleteCourse: (id, token) => apiService.delete(`/courses/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

export const questionAPI = {
  createQuestion: (questionData, token) => apiService.post('/questions', questionData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getQuestions: (params = {}) => apiService.get('/questions', { params }),
  getQuestion: (id) => apiService.get(`/questions/${id}`),
  getQuestionsForMentor: (mentorId, params = {}) => apiService.get(`/questions/for-mentor/${mentorId}`, { params }),
  answerQuestion: (id, answerData, token) => apiService.post(`/questions/${id}/answer`, answerData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  updateQuestion: (id, questionData, token) => apiService.put(`/questions/${id}`, questionData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  deleteQuestion: (id, token) => apiService.delete(`/questions/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

export const sessionAPI = {
  requestSession: (sessionData, token) => apiService.post('/sessions/request', sessionData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  acceptSession: (id, sessionData, token) => apiService.post(`/sessions/${id}/accept`, sessionData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  endSession: (id, sessionData, token) => apiService.post(`/sessions/${id}/end`, sessionData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getActiveSessions: (token) => apiService.get('/sessions/active', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getPendingSessions: (token) => apiService.get('/sessions/pending', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getSessionLogs: (params, token) => apiService.get('/sessions/logs', {
    params,
    headers: { Authorization: `Bearer ${token}` }
  }),
};

export const chatAPI = {
  sendMessage: (messageData, token) => apiService.post('/chat/messages', messageData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getMessages: (sessionId, params, token) => apiService.get(`/chat/messages/${sessionId}`, {
    params,
    headers: { Authorization: `Bearer ${token}` }
  }),
  markMessagesRead: (sessionId, token) => apiService.post(`/chat/messages/${sessionId}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

export const ratingAPI = {
  submitRating: (ratingData, token) => apiService.post('/ratings', ratingData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getMentorRatings: (mentorId, params = {}) => apiService.get(`/ratings/${mentorId}`, { params }),
  getMentorStats: (mentorId) => apiService.get(`/ratings/${mentorId}/stats`),
};

export const matchingAPI = {
  findMentors: (tags, courseId, token) => apiService.post('/matching/mentors', { tags, courseId }, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getAllMentors: (params = {}) => apiService.get('/matching/mentors/all', { params }),
  getMentorDetails: (mentorId) => apiService.get(`/matching/mentors/${mentorId}`),
  updateMentorProfile: (profileData, token) => apiService.put('/matching/mentors/profile', profileData, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

export const adminAPI = {
  getStats: (token) => apiService.get('/admin/stats', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  approveMentor: (id, approved, token) => apiService.post(`/admin/mentors/${id}/approve`, { approved }, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getPendingMentors: (token) => apiService.get('/admin/mentors/pending', {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

export const notificationAPI = {
  getNotifications: (token) => apiService.get('/notifications', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  markAsRead: (id, token) => apiService.put(`/notifications/${id}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};