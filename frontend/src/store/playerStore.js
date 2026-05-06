/**
 * Player Store - Zustand store para gamificação e progressão
 *
 * Estado:
 * - score, level, badges, empathy, rank
 *
 * Actions:
 * - updateScore, addBadge, levelUp, updateEmpathy, loadProfile
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API } from "@/services/api";

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      // === STATE ===

      userId: null,

      // Pontuação e progresso
      score: 0,
      level: 1,
      experience: 0,
      experienceForNextLevel: 1000,

      // Empatia
      empathyScore: 50,
      empathyLevel: "iniciante", // iniciante, intermediário, avançado, especialista

      // Badges
      badges: [],
      totalBadges: 0,

      // Ranking
      rank: null,
      totalPlayers: 0,

      // Histórico
      scenariosCompleted: [],
      gamesPlayed: 0,

      // Loading
      isLoading: false,
      error: null,

      // === ACTIONS ===

      /**
       * Carregar perfil de gamificação
       * @param {string} userId
       */
      loadProfile: async (userId) => {
        set({ isLoading: true, error: null });

        try {
          const response = await API.gamification.getProfile(userId);

          set({
            userId,
            score: response.data?.score || 0,
            level: response.data?.level || 1,
            experience: response.data?.experience || 0,
            empathyScore: response.data?.empathy || 50,
            badges: response.data?.badges || [],
            totalBadges: response.data?.totalBadges || 0,
            isLoading: false,
          });

          return response;
        } catch (error) {
          const errorMsg =
            error.response?.data?.error || "Erro ao carregar perfil";
          set({ error: errorMsg, isLoading: false });
        }
      },

      /**
       * Atualizar pontuação
       * @param {number} points - Pontos a adicionar (pode ser negativo)
       * @param {string} source - Origem da pontuação (puzzle, decision, etc)
       */
      updateScore: (points, source = "activity") => {
        set((state) => {
          const newScore = state.score + points;
          const newExperience = state.experience + Math.abs(points);

          // Verificar level up
          let newLevel = state.level;
          let newExp = newExperience;
          let newExpNeeded = state.experienceForNextLevel;

          while (newExp >= newExpNeeded) {
            newLevel += 1;
            newExp -= newExpNeeded;
            newExpNeeded = Math.floor(newExpNeeded * 1.5); // Crescimento exponencial
          }

          return {
            score: Math.max(0, newScore),
            experience: newExp,
            level: newLevel,
            experienceForNextLevel: newExpNeeded,
          };
        });
      },

      /**
       * Atualizar empatia
       * @param {number} delta - Mudança no score de empatia (-100 a +100)
       */
      updateEmpathy: (delta) => {
        set((state) => {
          const newEmpathy = Math.max(
            0,
            Math.min(100, state.empathyScore + delta),
          );

          // Determinar nível de empatia
          let level = "iniciante";
          if (newEmpathy >= 75) level = "especialista";
          else if (newEmpathy >= 60) level = "avançado";
          else if (newEmpathy >= 40) level = "intermediário";

          return {
            empathyScore: newEmpathy,
            empathyLevel: level,
          };
        });
      },

      /**
       * Desbloquear badge
       * @param {Object} badge - {id, name, description, icon, unlockTime}
       */
      addBadge: (badge) => {
        set((state) => {
          // Verificar se já tem o badge
          const alreadyHas = state.badges.some((b) => b.id === badge.id);

          if (alreadyHas) {
            return state;
          }

          return {
            badges: [
              ...state.badges,
              {
                ...badge,
                unlockTime: new Date().toISOString(),
              },
            ],
            totalBadges: state.totalBadges + 1,
          };
        });
      },

      /**
       * Level up
       */
      levelUp: () => {
        set((state) => {
          const newLevel = state.level + 1;
          const baseExp = Math.floor(state.experienceForNextLevel * 1.5);

          return {
            level: newLevel,
            experience: 0,
            experienceForNextLevel: baseExp,
          };
        });
      },

      /**
       * Registar cenário completado
       * @param {Object} completion - {scenarioId, finalType, empathy, score}
       */
      completeScenario: (completion) => {
        set((state) => {
          return {
            scenariosCompleted: [
              ...state.scenariosCompleted,
              {
                ...completion,
                completionTime: new Date().toISOString(),
              },
            ],
            gamesPlayed: state.gamesPlayed + 1,
          };
        });
      },

      /**
       * Atualizar ranking
       * @param {number} rank
       * @param {number} total
       */
      updateRank: (rank, total) => {
        set({
          rank,
          totalPlayers: total,
        });
      },

      /**
       * Carregar leaderboard
       * @param {Object} options - {limit, period}
       */
      loadLeaderboard: async (options = {}) => {
        set({ isLoading: true, error: null });

        try {
          const response = await API.gamification.getLeaderboard(options);

          if (response.data?.userRank) {
            set({
              rank: response.data.userRank.rank,
              totalPlayers: response.data.userRank.totalPlayers,
            });
          }

          set({ isLoading: false });
          return response;
        } catch (error) {
          const errorMsg =
            error.response?.data?.error || "Erro ao carregar leaderboard";
          set({ error: errorMsg, isLoading: false });
        }
      },

      /**
       * Resetar progresso (cuidado!)
       */
      resetProgress: () => {
        set({
          userId: null,
          score: 0,
          level: 1,
          experience: 0,
          experienceForNextLevel: 1000,
          empathyScore: 50,
          empathyLevel: "iniciante",
          badges: [],
          totalBadges: 0,
          rank: null,
          totalPlayers: 0,
          scenariosCompleted: [],
          gamesPlayed: 0,
        });
      },

      /**
       * Definir erro
       */
      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: "player-store",
      partialize: (state) => ({
        userId: state.userId,
        score: state.score,
        level: state.level,
        experience: state.experience,
        empathyScore: state.empathyScore,
        empathyLevel: state.empathyLevel,
        badges: state.badges,
        totalBadges: state.totalBadges,
        scenariosCompleted: state.scenariosCompleted,
        gamesPlayed: state.gamesPlayed,
      }),
    },
  ),
);

export default usePlayerStore;
