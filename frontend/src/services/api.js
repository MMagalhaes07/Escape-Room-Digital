/**
 * API Service - Centralizado para todas as chamadas HTTP
 *
 * Módulos:
 * - auth — login, register, profile
 * - game — session, decision, puzzle, clue, finish
 * - narratives — getScene, progress, getStart
 * - metrics — stats, exportCSV, analytics
 * - gamification — profile, leaderboard, badges
 * - teacher — dashboard, student, report
 * - hints — getAvailable, unlock
 * - puzzles — getById, solve, validate
 */

import apiClient from "@/lib/apiClient";

/**
 * API.auth - Autenticação e perfil
 */
const auth = {
  /**
   * Login de utilizador
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{user, token}>}
   */
  async login(email, password) {
    const { data } = await apiClient.post("/users/login", { email, password });
    return data;
  },

  /**
   * Registar novo utilizador
   * @param {Object} userData - {name, email, password, role, grade, school}
   * @returns {Promise<{user, token}>}
   */
  async register(userData) {
    const { data } = await apiClient.post("/users/register", userData);
    return data;
  },

  /**
   * Obter perfil do utilizador
   * @param {string} userId
   * @returns {Promise<User>}
   */
  async getProfile(userId) {
    const { data } = await apiClient.get(`/users/${userId}`);
    return data;
  },

  /**
   * Atualizar perfil
   * @param {string} userId
   * @param {Object} updates
   * @returns {Promise<User>}
   */
  async updateProfile(userId, updates) {
    const { data } = await apiClient.put(`/users/${userId}`, updates);
    return data;
  },
};

/**
 * API.game - Gerenciamento de sessões de jogo
 */
const game = {
  /**
   * Iniciar nova sessão de jogo
   * @param {string} scenarioId
   * @param {string} userId
   * @returns {Promise<{sessionId, initialScene, state}>}
   */
  async startSession(scenarioId, userId) {
    const { data } = await apiClient.post("/game/session", {
      scenario: scenarioId,
      userId,
    });
    return data;
  },

  /**
   * Fazer uma decisão no jogo
   * @param {string} sessionId
   * @param {string} nodeId
   * @param {string} choiceId
   * @returns {Promise<{nextScene, state, metrics}>}
   */
  async makeDecision(sessionId, nodeId, choiceId) {
    const { data } = await apiClient.post("/game/decision", {
      sessionId,
      nodeId,
      choiceId,
    });
    return data;
  },

  /**
   * Resolver um puzzle
   * @param {string} sessionId
   * @param {string} puzzleId
   * @param {*} answer
   * @returns {Promise<{success, feedback, nextScene}>}
   */
  async solvePuzzle(sessionId, puzzleId, answer) {
    const { data } = await apiClient.post("/game/puzzle/solve", {
      sessionId,
      puzzleId,
      answer,
    });
    return data;
  },

  /**
   * Obter pista para puzzle
   * @param {string} sessionId
   * @param {string} puzzleId
   * @returns {Promise<{hint, remaining}>}
   */
  async getClue(sessionId, puzzleId) {
    const { data } = await apiClient.post("/game/clue", {
      sessionId,
      puzzleId,
    });
    return data;
  },

  /**
   * Terminar sessão de jogo
   * @param {string} sessionId
   * @returns {Promise<{summary, finalScene, metrics}>}
   */
  async finishSession(sessionId) {
    const { data } = await apiClient.post(`/game/session/${sessionId}/finish`);
    return data;
  },

  /**
   * Obter estado atual da sessão
   * @param {string} sessionId
   * @returns {Promise<GameSession>}
   */
  async getSessionState(sessionId) {
    const { data } = await apiClient.get(`/game/session/${sessionId}`);
    return data;
  },
};

/**
 * API.narratives - Acesso a narrativas Twine
 */
const narratives = {
  /**
   * Obter cena/nó específico
   * @param {string} scenarioId
   * @param {string} nodeId
   * @param {string} sessionId (opcional)
   * @returns {Promise<{node, choices}>}
   */
  async getScene(scenarioId, nodeId, sessionId = null) {
    const params = sessionId ? { sessionId } : {};
    const { data } = await apiClient.get(
      `/narratives/${scenarioId}/${nodeId}`,
      { params },
    );
    return data;
  },

  /**
   * Obter nó inicial de cenário
   * @param {string} scenarioId
   * @param {string} sessionId (opcional)
   * @returns {Promise<{node, choices}>}
   */
  async getStart(scenarioId, sessionId = null) {
    const params = sessionId ? { sessionId } : {};
    const { data } = await apiClient.get(`/narratives/${scenarioId}/start`, {
      params,
    });
    return data;
  },

  /**
   * Progredir para próximo nó
   * @param {string} scenarioId
   * @param {string} currentNodeId
   * @param {string} choiceId
   * @param {string} sessionId
   * @returns {Promise<{nextNode, choices, metrics}>}
   */
  async progress(scenarioId, currentNodeId, choiceId, sessionId) {
    const { data } = await apiClient.post(
      `/narratives/${scenarioId}/progress`,
      {
        sessionId,
        currentNodeId,
        choiceId,
      },
    );
    return data;
  },

  /**
   * Listar todos os nós de um cenário
   * @param {string} scenarioId
   * @returns {Promise<{scenarioId, title, nodes}>}
   */
  async listScenes(scenarioId) {
    const { data } = await apiClient.get(`/narratives/${scenarioId}`);
    return data;
  },
};

/**
 * API.metrics - Estatísticas e métricas de jogo
 */
const metrics = {
  /**
   * Obter estatísticas de uma sessão
   * @param {string} sessionId
   * @returns {Promise<{empathy, score, time, puzzles}>}
   */
  async getStats(sessionId) {
    const { data } = await apiClient.get(`/metrics/session/${sessionId}`);
    return data;
  },

  /**
   * Exportar sessão como CSV
   * @param {string} sessionId
   * @returns {Promise<Blob>} CSV file
   */
  async exportCSV(sessionId) {
    const { data } = await apiClient.get(
      `/metrics/session/${sessionId}/export`,
      {
        responseType: "blob",
      },
    );
    return data;
  },

  /**
   * Obter análise pedagógica
   * @param {string} userId
   * @returns {Promise<{empathyTrend, progressionData, recommendedScenarios}>}
   */
  async getAnalytics(userId) {
    const { data } = await apiClient.get(`/metrics/user/${userId}/analytics`);
    return data;
  },

  /**
   * Listar sessões de um utilizador
   * @param {string} userId
   * @param {Object} options - {page, limit}
   * @returns {Promise<{sessions, total}>}
   */
  async getUserSessions(userId, options = {}) {
    const { data } = await apiClient.get(`/metrics/user/${userId}/sessions`, {
      params: options,
    });
    return data;
  },
};

/**
 * API.gamification - Pontos, badges, leaderboard
 */
const gamification = {
  /**
   * Obter perfil de gamificação
   * @param {string} userId
   * @returns {Promise<{score, level, badges, empathy}>}
   */
  async getProfile(userId) {
    const { data } = await apiClient.get(`/gamification/profile/${userId}`);
    return data;
  },

  /**
   * Obter leaderboard
   * @param {Object} options - {limit, period: 'all'|'week'|'month'}
   * @returns {Promise<{rankings, userRank}>}
   */
  async getLeaderboard(options = { limit: 100, period: "all" }) {
    const { data } = await apiClient.get("/gamification/leaderboard", {
      params: options,
    });
    return data;
  },

  /**
   * Obter badges do utilizador
   * @param {string} userId
   * @returns {Promise<Badge[]>}
   */
  async getBadges(userId) {
    const { data } = await apiClient.get(`/gamification/user/${userId}/badges`);
    return data;
  },

  /**
   * Desbloquear badge (admin only)
   * @param {string} userId
   * @param {string} badgeId
   * @returns {Promise<{badge, unlocked}>}
   */
  async unlockBadge(userId, badgeId) {
    const { data } = await apiClient.post(`/gamification/badge/unlock`, {
      userId,
      badgeId,
    });
    return data;
  },
};

/**
 * API.teacher - Dashboard e relatórios de professor
 */
const teacher = {
  /**
   * Obter dashboard do professor
   * @param {string} teacherId
   * @returns {Promise<{students, sessions, metrics}>}
   */
  async getDashboard(teacherId) {
    const { data } = await apiClient.get(`/teachers/${teacherId}/dashboard`);
    return data;
  },

  /**
   * Listar alunos gerenciados
   * @param {string} teacherId
   * @returns {Promise<Student[]>}
   */
  async listStudents(teacherId) {
    const { data } = await apiClient.get(`/teachers/${teacherId}/students`);
    return data;
  },

  /**
   * Obter relatório de aluno
   * @param {string} teacherId
   * @param {string} studentId
   * @returns {Promise<{profile, sessions, progress, recommendations}>}
   */
  async getStudentReport(teacherId, studentId) {
    const { data } = await apiClient.get(
      `/teachers/${teacherId}/students/${studentId}`,
    );
    return data;
  },

  /**
   * Exportar relatório de turma
   * @param {string} teacherId
   * @returns {Promise<Blob>} CSV
   */
  async exportClassReport(teacherId) {
    const { data } = await apiClient.get(
      `/teachers/${teacherId}/report/export`,
      { responseType: "blob" },
    );
    return data;
  },
};

/**
 * API.hints - Sistema de pistas
 */
const hints = {
  /**
   * Obter pistas disponíveis
   * @param {string} sessionId
   * @param {string} puzzleId
   * @returns {Promise<{hints, remaining}>}
   */
  async getAvailable(sessionId, puzzleId) {
    const { data } = await apiClient.get(`/hints/puzzle/${puzzleId}`, {
      params: { sessionId },
    });
    return data;
  },

  /**
   * Desbloquear pista
   * @param {string} sessionId
   * @param {string} puzzleId
   * @param {number} hintIndex
   * @returns {Promise<{hint, remaining}>}
   */
  async unlock(sessionId, puzzleId, hintIndex) {
    const { data } = await apiClient.post(`/hints/unlock`, {
      sessionId,
      puzzleId,
      hintIndex,
    });
    return data;
  },
};

/**
 * API.puzzles - Gerenciar puzzles
 */
const puzzles = {
  /**
   * Obter puzzle por ID
   * @param {string} puzzleId
   * @returns {Promise<Puzzle>}
   */
  async getById(puzzleId) {
    const { data } = await apiClient.get(`/puzzles/${puzzleId}`);
    return data;
  },

  /**
   * Resolver puzzle
   * @param {string} sessionId
   * @param {string} puzzleId
   * @param {*} answer
   * @returns {Promise<{success, feedback, score}>}
   */
  async solve(sessionId, puzzleId, answer) {
    const { data } = await apiClient.post(`/puzzles/${puzzleId}/solve`, {
      sessionId,
      answer,
    });
    return data;
  },

  /**
   * Validar resposta de puzzle
   * @param {string} puzzleId
   * @param {*} answer
   * @returns {Promise<{valid, feedback}>}
   */
  async validate(puzzleId, answer) {
    const { data } = await apiClient.post(`/puzzles/${puzzleId}/validate`, {
      answer,
    });
    return data;
  },

  /**
   * Listar todos os puzzles (admin)
   * @returns {Promise<Puzzle[]>}
   */
  async listAll() {
    const { data } = await apiClient.get("/puzzles");
    return data;
  },
};

/**
 * API exportado - acesso agregado
 */
export const API = {
  auth,
  game,
  narratives,
  metrics,
  gamification,
  teacher,
  hints,
  puzzles,
};

// Também exportar como default para compatibilidade
export default API;
