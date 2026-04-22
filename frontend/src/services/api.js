/**
 * API Client Service
 * Camada de comunicação com o backend
 */
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Adicionar token JWT aos headers
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const API = {
  // ===== AUTENTICAÇÃO =====
  auth: {
    register: (data) => client.post('/users/register', data),
    login: (data) => client.post('/users/login', data),
    getProfile: (userId) => client.get(`/users/${userId}`),
    updateProfile: (userId, data) => client.put(`/users/${userId}`, data),
  },

  // ===== JOGO =====
  game: {
    startSession: (userId, scenario) =>
      client.post('/game/session', { userId, scenario }),
    recordDecision: (sessionId, userId, sceneId, choiceId) =>
      client.post('/game/decision', { sessionId, userId, sceneId, choiceId }),
    completePuzzle: (sessionId, userId, puzzleId, solution) =>
      client.post('/game/puzzle', { sessionId, userId, puzzleId, solution }),
    discoverClue: (sessionId, userId, clueId) =>
      client.post('/game/clue', { sessionId, userId, clueId }),
    finishSession: (sessionId, userId, finalChoice) =>
      client.post('/game/finish', { sessionId, userId, finalChoice }),
  },

  // ===== MÉTRICAS =====
  metrics: {
    getUserStats: (userId) => client.get(`/metrics/user/${userId}`),
    exportCSV: (userId, scenario) =>
      client.get('/metrics/export', { params: { userId, scenario }, responseType: 'blob' }),
    getAnalytics: (scenario, dateFrom) =>
      client.get('/metrics/analytics', { params: { scenario, dateFrom } }),
  },

  // ===== GAMIFICAÇÃO =====
  gamification: {
    getUserProfile: (userId) => client.get(`/gamification/user/${userId}`),
    getLeaderboard: (limit = 10) =>
      client.get('/gamification/leaderboard', { params: { limit } }),
    getGradeLeaderboard: (grade, limit = 10) =>
      client.get(`/gamification/leaderboard/${grade}`, { params: { limit } }),
    getAvailableBadges: () => client.get('/gamification/badges'),
  },

  // ===== PROFESSOR =====
  teacher: {
    getDashboard: (school) => client.get('/teachers/dashboard', { params: { school } }),
    getStudentProfile: (studentId) => client.get(`/teachers/student/${studentId}`),
    getClassReport: (grade, school) =>
      client.get('/teachers/class-report', { params: { grade, school } }),
    exportClassReport: (grade, school) =>
      client.get('/teachers/export', { params: { grade, school }, responseType: 'blob' }),
  },
};

export default client;
