/**
 * UTILITY: HintEngine
 *
 * Motor inteligente para desbloquear pistas progressivamente
 * Baseado em condições contextuais: progresso, empatia, tentativas, tempo
 */

import HintModel, { PlayerHintModel } from "../models/HintModel.js";
import { PuzzleAnswerModel } from "../models/HintModel.js";

export class HintEngine {
  /**
   * Determinar pistas a desbloquear baseado em contexto do jogador
   * @param {Object} playerContext - Contexto do jogador
   * @returns {Promise<Array>} Array de hint IDs a desbloquear
   */
  static async determineHintsToUnlock(playerContext) {
    const {
      playerId,
      puzzleId,
      sessionId,
      attemptCount = 1,
      timeSpent = 0,
      empathyScore = 0,
      puzzlesSolved = 0,
      scenarioPhase = "early",
      previousAnswersCorrect = 0,
    } = playerContext;

    try {
      // 1. Obter todas as pistas para este puzzle
      const allHints = await HintModel.getByPuzzle(puzzleId);

      // 2. Obter pistas já desbloqueadas
      const unlockedHints = await PlayerHintModel.getByPuzzle(
        playerId,
        puzzleId,
      );
      const unlockedHintIds = unlockedHints.map((h) => h.hint_id);

      // 3. Filtrar pistas não-desbloqueadas
      const lockedHints = allHints.filter(
        (hint) => !unlockedHintIds.includes(hint.id),
      );

      // 4. Verificar condições para cada pista
      const hintsToUnlock = [];
      for (const hint of lockedHints) {
        const shouldUnlock = this.checkUnlockConditions(hint, {
          attemptCount,
          timeSpent,
          empathyScore,
          puzzlesSolved,
          scenarioPhase,
          previousAnswersCorrect,
        });

        if (shouldUnlock) {
          hintsToUnlock.push(hint);
        }
      }

      return hintsToUnlock;
    } catch (error) {
      console.error("HintEngine.determineHintsToUnlock error:", error);
      throw error;
    }
  }

  /**
   * Verificar se condições para desbloquear pista são atingidas
   * @private
   */
  static checkUnlockConditions(hint, playerContext) {
    const conditions = hint.unlock_conditions;

    // Se sem condições especificadas, desbloquear sempre
    if (!conditions || Object.keys(conditions).length === 0) {
      return true;
    }

    // Verificar cada condição (AND logic)
    // Conditions podem ser: attemptThreshold, timeThreshold, empathyThreshold, etc

    // ATTEMPT-BASED: "Após N tentativas"
    if (conditions.attempt_threshold !== undefined) {
      if (playerContext.attemptCount < conditions.attempt_threshold) {
        return false;
      }
    }

    // TIME-BASED: "Após N segundos"
    if (conditions.time_threshold !== undefined) {
      if (playerContext.timeSpent < conditions.time_threshold) {
        return false;
      }
    }

    // EMPATHY-BASED: "Quando empatia >= threshold"
    if (conditions.empathy_threshold !== undefined) {
      if (playerContext.empathyScore < conditions.empathy_threshold) {
        return false;
      }
    }

    // PROGRESS-BASED: "Após resolver N puzzles"
    if (conditions.puzzles_solved_threshold !== undefined) {
      if (playerContext.puzzlesSolved < conditions.puzzles_solved_threshold) {
        return false;
      }
    }

    // PHASE-BASED: "Na fase X"
    if (conditions.required_phase !== undefined) {
      const phaseOrder = { early: 1, mid: 2, late: 3 };
      const currentPhaseValue = phaseOrder[playerContext.scenarioPhase] || 1;
      const requiredPhaseValue = phaseOrder[conditions.required_phase] || 1;
      if (currentPhaseValue < requiredPhaseValue) {
        return false;
      }
    }

    // SUCCESS-BASED: "Após resolver outros puzzles corretamente"
    if (conditions.required_previous_success !== undefined) {
      if (
        playerContext.previousAnswersCorrect <
        conditions.required_previous_success
      ) {
        return false;
      }
    }

    // Se passou todas as condições
    return true;
  }

  /**
   * Registar pistas desbloqueadas no banco de dados
   * @param {string} playerId - ID do jogador
   * @param {Array} hintsToUnlock - Pistas a desbloquear
   * @param {Object} context - Contexto de desbloqueio
   * @returns {Promise<Array>} Pistas desbloqueadas registadas
   */
  static async unlockHints(playerId, hintsToUnlock, context = {}) {
    const unlockedRecords = [];

    for (const hint of hintsToUnlock) {
      try {
        const record = await PlayerHintModel.unlock({
          playerId,
          hintId: hint.id,
          puzzleId: hint.puzzle_id,
          unlockedBy: context.reason || "puzzle_progress",
          context: {
            attemptCount: context.attemptCount,
            timeSpent: context.timeSpent,
            empathyScore: context.empathyScore,
          },
        });

        unlockedRecords.push(record);
      } catch (error) {
        console.error(`Error unlocking hint ${hint.id}:`, error);
      }
    }

    return unlockedRecords;
  }

  /**
   * Obter pistas disponíveis para exibição na UI
   * @param {string} playerId - ID do jogador
   * @param {string} puzzleId - ID do puzzle
   * @returns {Promise<Array>} Pistas com conteúdo
   */
  static async getAvailableHints(playerId, puzzleId) {
    try {
      // 1. Obter todas as pistas do puzzle
      const allHints = await HintModel.getByPuzzle(puzzleId);

      // 2. Obter pistas desbloqueadas por este jogador
      const playerHints = await PlayerHintModel.getByPuzzle(playerId, puzzleId);
      const playerHintIds = playerHints.map((ph) => ph.hint_id);

      // 3. Enriquecer pistas com status de desbloqueio
      const enrichedHints = allHints.map((hint) => ({
        ...hint,
        isUnlocked: playerHintIds.includes(hint.id),
        wasViewed:
          playerHints.find((ph) => ph.hint_id === hint.id)?.was_viewed || false,
      }));

      // 4. Ordenar por tier (progressão)
      enrichedHints.sort((a, b) => a.tier - b.tier);

      return enrichedHints;
    } catch (error) {
      console.error("HintEngine.getAvailableHints error:", error);
      throw error;
    }
  }

  /**
   * Recomendar próxima pista baseado no histórico do jogador
   * @param {Object} playerContext - Contexto do jogador
   * @returns {Promise<Object|null>} Próxima pista recomendada ou null
   */
  static async recommendNextHint(playerContext) {
    const { playerId, puzzleId } = playerContext;

    try {
      // 1. Obter pistas disponíveis
      const availableHints = await this.getAvailableHints(playerId, puzzleId);

      // 2. Filtrar apenas desbloqueadas e não vistas
      const unviewedUnlocked = availableHints.filter(
        (h) => h.isUnlocked && !h.wasViewed,
      );

      if (unviewedUnlocked.length === 0) {
        // Nenhuma pista nova para recomendar
        return null;
      }

      // 3. Retornar a primeira não vista (tier mais baixo)
      return unviewedUnlocked[0];
    } catch (error) {
      console.error("HintEngine.recommendNextHint error:", error);
      return null;
    }
  }

  /**
   * Calcular "hint score" - número de pistas usadas (para análise)
   * @param {string} playerId - ID do jogador
   * @param {string} sessionId - ID da sessão
   * @returns {Promise<Object>} Estatísticas de uso de pistas
   */
  static async getHintUsageStats(playerId, sessionId) {
    try {
      const playerHints = await PlayerHintModel.getUnlocked(playerId);

      // Filtrar pistas desta sessão
      const sessionHints = playerHints.filter(
        (ph) =>
          ph.unlocked_by === "puzzle_progress" &&
          ph.context?.sessionId === sessionId,
      );

      const totalUnlocked = sessionHints.length;
      const totalViewed = sessionHints.filter((ph) => ph.was_viewed).length;
      const viewRate =
        totalUnlocked > 0 ? (totalViewed / totalUnlocked) * 100 : 0;

      return {
        totalUnlocked,
        totalViewed,
        viewRate: Math.round(viewRate),
        byTier: this.groupHintsByTier(sessionHints),
      };
    } catch (error) {
      console.error("HintEngine.getHintUsageStats error:", error);
      throw error;
    }
  }

  /**
   * Agrupar pistas por tier
   * @private
   */
  static groupHintsByTier(hints) {
    const grouped = {};
    hints.forEach((hint) => {
      if (!grouped[hint.tier]) {
        grouped[hint.tier] = [];
      }
      grouped[hint.tier].push({
        id: hint.id,
        viewed: hint.was_viewed,
      });
    });
    return grouped;
  }

  /**
   * Sugestão de ajuda contextualizado
   * @param {Object} playerContext - Contexto do jogador
   * @returns {string} Mensagem de sugestão
   */
  static getSuggestion(playerContext) {
    const { attemptCount, timeSpent, empathyScore } = playerContext;

    // Ajuda para jogador que está tentando muito
    if (attemptCount >= 3) {
      return "💡 Você já tentou várias vezes. Considera usar uma pista!";
    }

    // Ajuda para jogador que está demorando muito
    if (timeSpent > 180 && timeSpent < 240) {
      // Entre 3-4 minutos
      return "⏱️ Está a demorar um tempo. Quer uma pista?";
    }

    // Ajuda para sensibilidade
    if (empathyScore < 30) {
      return "🤝 Considera a perspetiva da vítima nesta situação.";
    }

    return null;
  }
}

export default HintEngine;
