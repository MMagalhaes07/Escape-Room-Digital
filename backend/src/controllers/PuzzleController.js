/**
 * CONTROLLER: PuzzleController
 *
 * Gerencia endpoints de puzzles
 * - Submissão de respostas
 * - Validação
 * - Geração de feedback
 * - Desbloqueio de pistas
 */

import PuzzleModel from "../models/PuzzleModel.js";
import { PuzzleAnswerModel } from "../models/HintModel.js";
import GameSessionModel from "../models/GameSessionModel.js";
import GamificationModel from "../models/GamificationModel.js";
import { PuzzleValidator } from "../utils/PuzzleValidator.js";
import { HintEngine } from "../utils/HintEngine.js";
import { EducationalFeedback } from "../utils/EducationalFeedback.js";

export class PuzzleController {
  /**
   * Obter definição de puzzle
   * GET /api/puzzles/:puzzleId
   */
  static async getPuzzle(req, res) {
    try {
      const { puzzleId } = req.params;
      const puzzle = await PuzzleModel.getById(puzzleId);

      // Não retornar resposta correta ao cliente
      const safePuzzle = {
        ...puzzle,
        expected_answers: undefined, // Remover resposta correta
      };

      return res.json(safePuzzle);
    } catch (error) {
      console.error("PuzzleController.getPuzzle error:", error);
      return res.status(404).json({ error: error.message });
    }
  }

  /**
   * Listar puzzles de um cenário
   * GET /api/puzzles/scenario/:scenarioId
   */
  static async getPuzzlesByScenario(req, res) {
    try {
      const { scenarioId } = req.params;
      const puzzles = await PuzzleModel.getByScenario(scenarioId);

      // Remover respostas corretas
      const safePuzzles = puzzles.map((p) => ({
        ...p,
        expected_answers: undefined,
      }));

      return res.json(safePuzzles);
    } catch (error) {
      console.error("PuzzleController.getPuzzlesByScenario error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Submeter resposta a puzzle
   * POST /api/puzzles/solve
   *
   * Body: {
   *   sessionId: string,
   *   puzzleId: string,
   *   answer: any,
   *   timeSpent: number (segundos)
   * }
   */
  static async solvePuzzle(req, res) {
    try {
      const { sessionId, puzzleId, answer, timeSpent = 0 } = req.body;

      // Validação de entrada
      if (!sessionId || !puzzleId || answer === undefined) {
        return res
          .status(400)
          .json({ error: "sessionId, puzzleId, and answer are required" });
      }

      // 1. Recuperar sessão do jogador
      const session = await GameSessionModel.getById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // 2. Recuperar puzzle
      const puzzle = await PuzzleModel.getById(puzzleId);
      if (!puzzle) {
        return res.status(404).json({ error: "Puzzle not found" });
      }

      // 3. Contar tentativas anteriores
      const previousAttempts = await PuzzleAnswerModel.countAttempts(
        sessionId,
        puzzleId,
      );
      const attemptNumber = previousAttempts + 1;

      // 4. Recuperar estado da sessão para contexto
      const sessionState = JSON.parse(session.state || "{}");
      const playerContext = {
        empathyScore: sessionState.empathyScore || 0,
        cloutScore: sessionState.cloutScore || 0,
        puzzlesSolved: sessionState.puzzlesSolved || 0,
        scenarioPhase: sessionState.scenarioPhase || "early",
        attemptCount: attemptNumber,
        timeSpent,
      };

      // 5. Validar resposta do puzzle
      const validation = PuzzleValidator.validate(
        puzzle,
        answer,
        playerContext,
      );

      // 6. Gerar feedback educativo
      const feedback = EducationalFeedback.generate({
        puzzle,
        isCorrect: validation.isCorrect,
        playerAnswer: answer,
        attemptCount: attemptNumber,
        empathyScore: playerContext.empathyScore,
        scenario: session.scenario,
      });

      // 7. Registar resposta no banco de dados
      const answerRecord = await PuzzleAnswerModel.create({
        sessionId,
        puzzleId,
        playerAnswer: answer,
        isCorrect: validation.isCorrect,
        score: validation.score,
        attemptNumber,
        timeSpent,
        feedback: feedback.fullMessage || feedback.message,
      });

      // 8. Calcular recompensas
      let pointsEarned = 0;
      let empathyChange = 0;

      if (validation.isCorrect) {
        pointsEarned = PuzzleValidator.calculatePoints(validation, {
          difficulty: puzzle.difficulty,
          attemptCount: attemptNumber,
          timeSpent,
        });

        empathyChange = PuzzleValidator.calculateEmpathyChange(
          puzzle,
          validation,
        );

        // Atualizar gamificação do jogador
        await GamificationModel.addPoints(session.user_id, pointsEarned, {
          reason: `puzzle_solved:${puzzleId}:${attemptNumber === 1 ? "first_try" : "multiple_attempts"}`,
        });
      }

      // 9. Determinar pistas a desbloquear
      let hintsUnlocked = [];
      if (validation.isCorrect || attemptNumber >= 2) {
        const hintsToUnlock = await HintEngine.determineHintsToUnlock({
          playerId: session.user_id,
          puzzleId,
          sessionId,
          attemptCount: attemptNumber,
          timeSpent,
          empathyScore: playerContext.empathyScore,
          puzzlesSolved: playerContext.puzzlesSolved,
          scenarioPhase: playerContext.scenarioPhase,
        });

        if (hintsToUnlock.length > 0) {
          const unlockedRecords = await HintEngine.unlockHints(
            session.user_id,
            hintsToUnlock,
            {
              reason: validation.isCorrect
                ? "puzzle_solved"
                : "struggle_assistance",
              attemptCount: attemptNumber,
              timeSpent,
              empathyScore: playerContext.empathyScore,
            },
          );
          hintsUnlocked = unlockedRecords.map((r) => ({ id: r.hint_id }));
        }
      }

      // 10. Atualizar estado da sessão
      const newState = {
        ...sessionState,
        puzzlesSolved: validation.isCorrect
          ? (sessionState.puzzlesSolved || 0) + 1
          : sessionState.puzzlesSolved,
        empathyScore: Math.max(
          0,
          Math.min(100, (sessionState.empathyScore || 0) + empathyChange),
        ),
        lastPuzzleAttempt: {
          puzzleId,
          wasCorrect: validation.isCorrect,
          attemptNumber,
          timestamp: new Date().toISOString(),
        },
      };

      await GameSessionModel.updateState(sessionId, newState);

      // 11. Preparar resposta
      const completionMessage = EducationalFeedback.generateCompletionMessage(
        {
          pointsEarned,
          empathyChange,
          hintsUnlocked,
        },
        playerContext,
      );

      return res.json({
        success: true,
        isCorrect: validation.isCorrect,
        score: validation.score,
        feedback: feedback.fullMessage || feedback.message,
        explanation: feedback.educational,
        characterInsight: feedback.characterInsight,
        pointsEarned,
        empathyChange,
        hintsUnlocked: hintsUnlocked.map((h) => h.id),
        completionMessage,
        attemptNumber,
        validateResult: validation, // Debug info (remover em produção)
      });
    } catch (error) {
      console.error("PuzzleController.solvePuzzle error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter histórico de respostas do jogador
   * GET /api/puzzles/session/:sessionId/answers
   */
  static async getSessionAnswers(req, res) {
    try {
      const { sessionId } = req.params;
      const stats = await PuzzleAnswerModel.getSessionStats(sessionId);
      return res.json(stats);
    } catch (error) {
      console.error("PuzzleController.getSessionAnswers error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Verificar se puzzle foi resolvido
   * GET /api/puzzles/:puzzleId/solved?sessionId=abc
   */
  static async checkIfSolved(req, res) {
    try {
      const { puzzleId } = req.params;
      const { sessionId } = req.query;

      if (!sessionId) {
        return res
          .status(400)
          .json({ error: "sessionId query parameter required" });
      }

      const isSolved = await PuzzleAnswerModel.isSolved(sessionId, puzzleId);
      return res.json({ isSolved });
    } catch (error) {
      console.error("PuzzleController.checkIfSolved error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter sugestão de pista contextualizada
   * GET /api/puzzles/:puzzleId/suggestion?sessionId=abc
   */
  static async getSuggestion(req, res) {
    try {
      const { puzzleId } = req.params;
      const { sessionId } = req.query;

      if (!sessionId) {
        return res
          .status(400)
          .json({ error: "sessionId query parameter required" });
      }

      // Recuperar contexto do jogador
      const session = await GameSessionModel.getById(sessionId);
      const sessionState = JSON.parse(session.state || "{}");

      // Recuperar histórico de respostas
      const answers = await PuzzleAnswerModel.getBySessionAndPuzzle(
        sessionId,
        puzzleId,
      );

      const suggestion = HintEngine.getSuggestion({
        attemptCount: answers.length + 1,
        timeSpent: answers.reduce((sum, a) => sum + (a.time_spent || 0), 0),
        empathyScore: sessionState.empathyScore || 0,
      });

      return res.json({ suggestion });
    } catch (error) {
      console.error("PuzzleController.getSuggestion error:", error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export default PuzzleController;
