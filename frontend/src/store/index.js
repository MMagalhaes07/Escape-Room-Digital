/**
 * Global State Store
 * Gerencia estado da aplicação com Zustand
 */
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('auth_token') || null,
  isAuthenticated: !!localStorage.getItem('auth_token'),

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
    set({ token, isAuthenticated: !!token });
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export const useGameStore = create((set) => ({
  // Estado da sessão atual
  currentSession: null,
  gameState: {
    currentScene: null,
    inventory: [],
    choices_made: [],
    puzzles_solved: [],
    discovered_clues: [],
  },
  scenarioNarrative: null,

  // Métodos
  startSession: (session, narrative) =>
    set({
      currentSession: session,
      scenarioNarrative: narrative || session?.narrative || null,
      gameState: {
        ...(session?.state || {}),
        sessionId: session?.sessionId || session?.id,
        startTime: Date.now(),
        current_scene:
          session?.state?.current_scene ||
          (narrative || session?.narrative)?.initialScene ||
          null,
        inventory: session?.state?.inventory || session?.inventory || [],
        choices_made: session?.state?.choices_made || [],
        puzzles_solved: session?.state?.puzzles_solved || [],
        discovered_clues: session?.state?.discovered_clues || [],
        scores: session?.scores || session?.state?.scores || {},
      },
    }),

  updateGameState: (newState) =>
    set((state) => ({
      gameState: { ...state.gameState, ...newState },
    })),

  endSession: () =>
    set({
      currentSession: null,
      gameState: {
        currentScene: null,
        inventory: [],
        choices_made: [],
        puzzles_solved: [],
        discovered_clues: [],
      },
    }),
}));

export const usePlayerStore = create((set) => ({
  // Perfil do jogador
  profile: null,
  gamification: null,
  stats: null,

  setProfile: (profile) => set({ profile }),
  setGamification: (gamification) => set({ gamification }),
  setStats: (stats) => set({ stats }),

  // Atualizar pontos localmente (antes de sincronizar com servidor)
  addPoints: (points) =>
    set((state) => ({
      gamification: state.gamification
        ? { ...state.gamification, points: state.gamification.points + points }
        : null,
    })),

  awardBadge: (badge) =>
    set((state) => ({
      gamification: state.gamification
        ? {
            ...state.gamification,
            badges: [...(state.gamification.badges || []), badge],
          }
        : null,
    })),
}));

export const useUIStore = create((set) => ({
  // Estado da UI
  isLoading: false,
  notification: null,
  modal: null,

  setLoading: (isLoading) => set({ isLoading }),

  showNotification: (message, type = 'info', duration = 3000) => {
    set({ notification: { message, type, id: Date.now() } });
    if (duration > 0) {
      setTimeout(() => set({ notification: null }), duration);
    }
  },

  closeNotification: () => set({ notification: null }),

  openModal: (type, data) => set({ modal: { type, data } }),
  closeModal: () => set({ modal: null }),
}));
