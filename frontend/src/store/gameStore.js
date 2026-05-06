/**
 * Game Store - Zustand store para gerenciar estado do jogo
 *
 * Estado:
 * - currentScene, gameState, inventory, decisions
 *
 * Actions:
 * - startSession, makeDecision, solvePuzzle, collectClue, finishSession
 *
 * Persistência: fallback em localStorage
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API } from "@/services/api";

export const useGameStore = create(
  persist(
    (set, get) => ({
      // === STATE ===

      // Sessão atual
      sessionId: null,
      scenarioId: null,
      userId: null,

      // Narrativa
      currentScene: null,
      gameState: {
        choices_made: [],
        puzzles_solved: [],
        discovered_clues: [],
        completion_time: 0,
        game_active: true,
        total_empathy: 0,
        current_scene: null,
      },

      // Inventário
      inventory: [],

      // Decisões tomadas
      decisions: [],

      // Tempo de sessão
      sessionStartTime: null,

      // UI States
      isLoading: false,
      error: null,
      currentPuzzle: null,

      // === ACTIONS ===

      /**
       * Iniciar nova sessão de jogo
       * @param {string} scenarioId
       * @param {string} userId
       */
      startSession: async (scenarioId, userId) => {
        set({ isLoading: true, error: null });

        try {
          const response = await API.game.startSession(scenarioId, userId);

          set({
            sessionId: response.session.sessionId,
            scenarioId,
            userId,
            currentScene: response.session.narrative.initialScene,
            gameState: response.session.state || {
              choices_made: [],
              puzzles_solved: [],
              discovered_clues: [],
              completion_time: 0,
              game_active: true,
              total_empathy: 0,
              current_scene: response.session.narrative.initialScene,
            },
            inventory: [],
            decisions: [],
            sessionStartTime: Date.now(),
            isLoading: false,
          });

          return response;
        } catch (error) {
          const errorMsg =
            error.response?.data?.error || "Erro ao iniciar sessão";
          set({ error: errorMsg, isLoading: false });
          throw error;
        }
      },

      /**
       * Fazer uma decisão no jogo
       * @param {string} nodeId
       * @param {string} choiceId
       */
      makeDecision: async (nodeId, choiceId) => {
        const { sessionId, scenarioId } = get();

        if (!sessionId || !nodeId) {
          set({ error: "Sessão ou nó não definido" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await API.narratives.progress(
            scenarioId,
            nodeId,
            choiceId,
            sessionId,
          );

          // Atualizar estado
          const currentState = get().gameState;
          set({
            currentScene: response.data.nextNode.id,
            gameState: {
              ...currentState,
              current_scene: response.data.nextNode.id,
              choices_made: [
                ...currentState.choices_made,
                {
                  nodeId,
                  choiceId,
                  timestamp: new Date().toISOString(),
                  empathyScore: response.data.metrics?.empathyGained || 0,
                },
              ],
              total_empathy:
                (currentState.total_empathy || 0) +
                (response.data.metrics?.empathyGained || 0),
            },
            decisions: [
              ...get().decisions,
              {
                nodeId,
                choiceId,
                nextNodeId: response.data.nextNode.id,
                timestamp: new Date().toISOString(),
              },
            ],
            isLoading: false,
          });

          return response;
        } catch (error) {
          const errorMsg =
            error.response?.data?.error || "Erro ao fazer decisão";
          set({ error: errorMsg, isLoading: false });
          throw error;
        }
      },

      /**
       * Resolver puzzle
       * @param {string} puzzleId
       * @param {*} answer
       */
      solvePuzzle: async (puzzleId, answer) => {
        const { sessionId } = get();

        if (!sessionId) {
          set({ error: "Sessão não definida" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await API.game.solvePuzzle(
            sessionId,
            puzzleId,
            answer,
          );

          if (response.success) {
            const currentState = get().gameState;
            set({
              gameState: {
                ...currentState,
                puzzles_solved: [
                  ...currentState.puzzles_solved,
                  {
                    puzzleId,
                    timestamp: new Date().toISOString(),
                    score: response.data?.score || 0,
                  },
                ],
              },
              currentPuzzle: null,
              isLoading: false,
            });
          }

          return response;
        } catch (error) {
          const errorMsg =
            error.response?.data?.error || "Erro ao resolver puzzle";
          set({ error: errorMsg, isLoading: false });
          throw error;
        }
      },

      /**
       * Coletar pista/clue
       * @param {Object} clue - {id, name, description, type}
       */
      collectClue: (clue) => {
        set((state) => {
          const currentState = state.gameState;

          return {
            inventory: [...state.inventory, clue],
            gameState: {
              ...currentState,
              discovered_clues: [
                ...currentState.discovered_clues,
                {
                  clueId: clue.id,
                  timestamp: new Date().toISOString(),
                },
              ],
            },
          };
        });
      },

      /**
       * Terminar sessão de jogo
       * @returns {Promise<{summary, metrics}>}
       */
      finishSession: async () => {
        const { sessionId } = get();

        if (!sessionId) {
          set({ error: "Sessão não definida" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await API.game.finishSession(sessionId);

          const sessionDuration = get().sessionStartTime
            ? Date.now() - get().sessionStartTime
            : 0;

          set({
            gameState: {
              ...get().gameState,
              game_active: false,
              completion_time: sessionDuration,
            },
            isLoading: false,
          });

          return response;
        } catch (error) {
          const errorMsg =
            error.response?.data?.error || "Erro ao terminar sessão";
          set({ error: errorMsg, isLoading: false });
          throw error;
        }
      },

      /**
       * Resetar jogo
       */
      resetSession: () => {
        set({
          sessionId: null,
          scenarioId: null,
          userId: null,
          currentScene: null,
          gameState: {
            choices_made: [],
            puzzles_solved: [],
            discovered_clues: [],
            completion_time: 0,
            game_active: true,
            total_empathy: 0,
            current_scene: null,
          },
          inventory: [],
          decisions: [],
          sessionStartTime: null,
          isLoading: false,
          error: null,
          currentPuzzle: null,
        });
      },

      /**
       * Atualizar estado do jogo (manual)
       */
      setGameState: (updates) => {
        set((state) => ({
          gameState: {
            ...state.gameState,
            ...updates,
          },
        }));
      },

      /**
       * Definir puzzle atual
       */
      setCurrentPuzzle: (puzzle) => {
        set({ currentPuzzle: puzzle });
      },

      /**
       * Definir erro
       */
      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: "game-store", // localStorage key
      partialize: (state) => ({
        // Persistir apenas certos campos
        sessionId: state.sessionId,
        scenarioId: state.scenarioId,
        userId: state.userId,
        currentScene: state.currentScene,
        gameState: state.gameState,
        inventory: state.inventory,
        decisions: state.decisions,
        sessionStartTime: state.sessionStartTime,
      }),
    },
  ),
);

export default useGameStore;
