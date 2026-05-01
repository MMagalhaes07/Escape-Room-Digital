/**
 * API Client Service
 * Camada de comunicação com o backend
 */
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const API = {
  auth: {
    register: (data) => client.post("/users/register", data),
    login: (data) => client.post("/users/login", data),
    getProfile: (userId) => client.get(`/users/${userId}`),
    updateProfile: (userId, data) => client.put(`/users/${userId}`, data),
  },
  game: {
    startSession: (userId, scenario) =>
      client.post("/game/session", { userId, scenario }),
    recordDecision: (sessionId, userId, sceneId, choiceText) =>
      client.post("/game/decision", { sessionId, userId, sceneId, choiceText }),
    completePuzzle: (sessionId, userId, puzzleId, solution) =>
      client.post("/game/puzzle", { sessionId, userId, puzzleId, solution }),
    discoverClue: (sessionId, userId, clueId) =>
      client.post("/game/clue", { sessionId, userId, clueId }),
    finishSession: (sessionId, userId, finalSceneId) =>
      client.post("/game/finish", { sessionId, userId, finalSceneId }),
  },
  puzzles: {
    get: (puzzleId) => client.get(`/puzzles/${puzzleId}`),
    getByScenario: (scenarioId) =>
      client.get(`/puzzles/scenario/${scenarioId}`),
    solve: ({ sessionId, puzzleId, answer, timeSpent = 0 }) =>
      client.post("/puzzles/solve", { sessionId, puzzleId, answer, timeSpent }),
    checkSolved: (puzzleId, sessionId) =>
      client.get(`/puzzles/${puzzleId}/solved`, { params: { sessionId } }),
    getSuggestion: (puzzleId, sessionId) =>
      client.get(`/puzzles/${puzzleId}/suggestion`, { params: { sessionId } }),
    getSessionAnswers: (sessionId) =>
      client.get(`/puzzles/session/${sessionId}/answers`),
  },
  hints: {
    getAvailable: (puzzleId, sessionId) =>
      client.get("/hints", { params: { puzzleId, sessionId } }),
    get: (hintId) => client.get(`/hints/${hintId}`),
    markViewed: (hintId, sessionId) =>
      client.post(`/hints/${hintId}/view`, { sessionId }),
    getUnviewed: (sessionId) =>
      client.get("/hints/unviewed", { params: { sessionId } }),
    recommend: (puzzleId, sessionId) =>
      client.get("/hints/recommend", { params: { puzzleId, sessionId } }),
    getStats: (sessionId) =>
      client.get("/hints/stats", { params: { sessionId } }),
    getSuggestion: (sessionId, puzzleId) =>
      client.get("/hints/suggestion", { params: { sessionId, puzzleId } }),
    getPlayer: (sessionId) =>
      client.get("/hints/player", { params: { sessionId } }),
  },
  metrics: {
    getUserStats: (userId) => client.get(`/metrics/user/${userId}`),
    exportCSV: (userId, scenario) =>
      client.get("/metrics/export", {
        params: { userId, scenario },
        responseType: "blob",
      }),
    getAnalytics: (scenario, dateFrom) =>
      client.get("/metrics/analytics", { params: { scenario, dateFrom } }),
  },
  gamification: {
    getUserProfile: (userId) => client.get(`/gamification/user/${userId}`),
    getLeaderboard: (limit = 10) =>
      client.get("/gamification/leaderboard", { params: { limit } }),
    getGradeLeaderboard: (grade, limit = 10) =>
      client.get(`/gamification/leaderboard/grade/${grade}`, {
        params: { limit },
      }),
    getAvailableBadges: () => client.get("/gamification/badges"),
  },
  teacher: {
    getDashboard: (school) =>
      client.get("/teachers/dashboard", { params: { school } }),
    getStudentProfile: (studentId) =>
      client.get(`/teachers/student/${studentId}`),
    getClassReport: (grade, school) =>
      client.get("/teachers/class-report", { params: { grade, school } }),
    exportClassReport: (grade, school) =>
      client.get("/teachers/export", {
        params: { grade, school },
        responseType: "blob",
      }),
  },
};

export default client;
