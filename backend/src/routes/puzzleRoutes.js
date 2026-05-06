/**
 * ROUTES: Puzzle Routes
 *
 * Endpoints para gerenciar puzzles
 * Com autenticação e validação
 */

import express from "express";
import PuzzleController from "../controllers/PuzzleController.js";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";

const router = express.Router();

/**
 * GET /api/puzzles/:puzzleId
 * Obter definição de puzzle (sem resposta correta)
 * Público mas com validação
 */
router.get("/:puzzleId", optionalAuthMiddleware, (req, res, next) => {
  PuzzleController.getPuzzle(req, res).catch(next);
});

/**
 * GET /api/puzzles/scenario/:scenarioId
 * Listar puzzles de um cenário
 * Público
 */
router.get(
  "/scenario/:scenarioId",
  optionalAuthMiddleware,
  (req, res, next) => {
    PuzzleController.getPuzzlesByScenario(req, res).catch(next);
  },
);

/**
 * POST /api/puzzles/solve
 * Submeter resposta a puzzle
 * Validação: puzzleId, answer, sessionId
 */
router.post(
  "/solve",
  authMiddleware,
  validate("puzzleAnswer"),
  (req, res, next) => {
    PuzzleController.solvePuzzle(req, res).catch(next);
  },
);

/**
 * GET /api/puzzles/:puzzleId/solved?sessionId=abc
 * Verificar se puzzle foi resolvido
 */
router.get("/:puzzleId/solved", authMiddleware, (req, res, next) => {
  PuzzleController.checkIfSolved(req, res).catch(next);
});

/**
 * GET /api/puzzles/:puzzleId/suggestion?sessionId=abc
 * Obter sugestão contextualizada
 */
router.get("/:puzzleId/suggestion", authMiddleware, (req, res, next) => {
  PuzzleController.getSuggestion(req, res).catch(next);
});

/**
 * GET /api/puzzles/session/:sessionId/answers
 * Obter histórico de respostas
 */
router.get("/session/:sessionId/answers", authMiddleware, (req, res, next) => {
  PuzzleController.getSessionAnswers(req, res).catch(next);
});

export default router;
