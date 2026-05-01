/**
 * CONTROLLER: HintController
 *
 * Gerencia endpoints de pistas
 * - Obter pistas disponíveis
 * - Marcar como vistas
 * - Recomendações
 */

import HintModel, { PlayerHintModel } from "../models/HintModel.js";
import GameSessionModel from "../models/GameSessionModel.js";
import { HintEngine } from "../utils/HintEngine.js";

export class HintController {
  /**
   * Obter pistas disponíveis para um puzzle
   * GET /api/hints?puzzleId=abc&sessionId=xyz
   */
  static async getAvailableHints(req, res) {
    try {
      const { puzzleId, sessionId } = req.query;

      if (!puzzleId || !sessionId) {
        return res
          .status(400)
          .json({ error: "puzzleId and sessionId query parameters required" });
      }

      // Recuperar sessão para obter user_id
      const session = await GameSessionModel.getById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Obter pistas disponíveis
      const hints = await HintEngine.getAvailableHints(
        session.user_id,
        puzzleId,
      );

      // Filtrar apenas pistas desbloqueadas para resposta
      const unlockedHints = hints
        .filter((h) => h.isUnlocked)
        .map((h) => ({
          id: h.id,
          tier: h.tier,
          title: h.title,
          content: h.content,
          was_viewed: h.wasViewed,
        }));

      // Enviar meta-informações também
      const lockedCount = hints.filter((h) => !h.isUnlocked).length;

      return res.json({
        unlockedHints,
        lockedCount,
        nextHintRecommendation:
          unlockedHints.filter((h) => !h.was_viewed)[0] || null,
      });
    } catch (error) {
      console.error("HintController.getAvailableHints error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter detalhe de pista específica
   * GET /api/hints/:hintId
   */
  static async getHint(req, res) {
    try {
      const { hintId } = req.params;
      const hint = await HintModel.getById(hintId);

      return res.json({
        id: hint.id,
        tier: hint.tier,
        title: hint.title,
        content: hint.content,
        educational_value: hint.educational_value,
        bullying_context: hint.bullying_context,
      });
    } catch (error) {
      console.error("HintController.getHint error:", error);
      return res.status(404).json({ error: error.message });
    }
  }

  /**
   * Marcar pista como vista
   * POST /api/hints/:hintId/view
   * Body: { sessionId: string }
   */
  static async markHintViewed(req, res) {
    try {
      const { hintId } = req.params;
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: "sessionId is required" });
      }

      // Recuperar sessão
      const session = await GameSessionModel.getById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Marcar como vista
      await PlayerHintModel.markViewed(session.user_id, hintId);

      return res.json({ success: true, message: "Hint marked as viewed" });
    } catch (error) {
      console.error("HintController.markHintViewed error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter pistas não vistas
   * GET /api/hints/unviewed?sessionId=abc
   */
  static async getUnviewedHints(req, res) {
    try {
      const { sessionId } = req.query;

      if (!sessionId) {
        return res
          .status(400)
          .json({ error: "sessionId query parameter required" });
      }

      const session = await GameSessionModel.getById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const unviewedHints = await PlayerHintModel.getUnviewed(session.user_id);

      return res.json({
        count: unviewedHints.length,
        hints: unviewedHints.map((h) => ({
          id: h.hint_id,
          puzzleId: h.puzzle_id,
          unlockedAt: h.unlocked_at,
        })),
      });
    } catch (error) {
      console.error("HintController.getUnviewedHints error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter recomendação de pista
   * GET /api/hints/recommend?puzzleId=abc&sessionId=xyz
   */
  static async recommendHint(req, res) {
    try {
      const { puzzleId, sessionId } = req.query;

      if (!puzzleId || !sessionId) {
        return res
          .status(400)
          .json({ error: "puzzleId and sessionId query parameters required" });
      }

      const session = await GameSessionModel.getById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const sessionState = JSON.parse(session.state || "{}");

      const recommendation = await HintEngine.recommendNextHint({
        playerId: session.user_id,
        puzzleId,
      });

      if (!recommendation) {
        return res.json({
          hasRecommendation: false,
          message: "Sem pistas novas disponíveis neste momento.",
        });
      }

      return res.json({
        hasRecommendation: true,
        hint: {
          id: recommendation.id,
          tier: recommendation.tier,
          title: recommendation.title,
          content: recommendation.content,
        },
      });
    } catch (error) {
      console.error("HintController.recommendHint error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter estatísticas de uso de pistas
   * GET /api/hints/stats?sessionId=abc
   */
  static async getHintUsageStats(req, res) {
    try {
      const { sessionId } = req.query;

      if (!sessionId) {
        return res
          .status(400)
          .json({ error: "sessionId query parameter required" });
      }

      const session = await GameSessionModel.getById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const stats = await HintEngine.getHintUsageStats(
        session.user_id,
        sessionId,
      );

      return res.json(stats);
    } catch (error) {
      console.error("HintController.getHintUsageStats error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter pista de ajuda contextualizada
   * GET /api/hints/suggestion?sessionId=abc&puzzleId=xyz
   */
  static async getHelpSuggestion(req, res) {
    try {
      const { sessionId, puzzleId } = req.query;

      if (!sessionId || !puzzleId) {
        return res
          .status(400)
          .json({ error: "sessionId and puzzleId query parameters required" });
      }

      const session = await GameSessionModel.getById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const sessionState = JSON.parse(session.state || "{}");

      // Recuperar histórico de respostas do puzzle
      const { PuzzleAnswerModel } = await import("../models/HintModel.js");
      const answers = await PuzzleAnswerModel.getBySessionAndPuzzle(
        sessionId,
        puzzleId,
      );

      const suggestion = HintEngine.getSuggestion({
        attemptCount: answers.length + 1,
        timeSpent: answers.reduce((sum, a) => sum + (a.time_spent || 0), 0),
        empathyScore: sessionState.empathyScore || 0,
      });

      if (!suggestion) {
        return res.json({ hasSuggestion: false });
      }

      return res.json({
        hasSuggestion: true,
        suggestion,
        attemptCount: answers.length + 1,
      });
    } catch (error) {
      console.error("HintController.getHelpSuggestion error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Listar todas as pistas desbloqueadas por um jogador
   * GET /api/hints/player?sessionId=abc
   */
  static async getPlayerHints(req, res) {
    try {
      const { sessionId } = req.query;

      if (!sessionId) {
        return res
          .status(400)
          .json({ error: "sessionId query parameter required" });
      }

      const session = await GameSessionModel.getById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const playerHints = await PlayerHintModel.getUnlocked(session.user_id);

      return res.json({
        total: playerHints.length,
        hints: playerHints.map((ph) => ({
          hintId: ph.hint_id,
          puzzleId: ph.puzzle_id,
          unlockedBy: ph.unlocked_by,
          wasViewed: ph.was_viewed,
          unlockedAt: ph.unlocked_at,
          viewedAt: ph.viewed_at,
        })),
      });
    } catch (error) {
      console.error("HintController.getPlayerHints error:", error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export default HintController;
