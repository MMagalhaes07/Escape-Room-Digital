/**
 * ROUTES: Puzzle Routes
 *
 * Endpoints para gerenciar puzzles
 */

import express from "express";
import PuzzleController from "../controllers/PuzzleController.js";

const router = express.Router();

/**
 * GET /api/puzzles/:puzzleId
 * Obter definição de puzzle (sem resposta correta)
 */
router.get("/:puzzleId", PuzzleController.getPuzzle);

/**
 * GET /api/puzzles/scenario/:scenarioId
 * Listar puzzles de um cenário
 */
router.get("/scenario/:scenarioId", PuzzleController.getPuzzlesByScenario);

/**
 * POST /api/puzzles/solve
 * Submeter resposta a puzzle
 */
router.post("/solve", PuzzleController.solvePuzzle);

/**
 * GET /api/puzzles/:puzzleId/solved?sessionId=abc
 * Verificar se puzzle foi resolvido
 */
router.get("/:puzzleId/solved", PuzzleController.checkIfSolved);

/**
 * GET /api/puzzles/:puzzleId/suggestion?sessionId=abc
 * Obter sugestão contextualizada
 */
router.get("/:puzzleId/suggestion", PuzzleController.getSuggestion);

/**
 * GET /api/puzzles/session/:sessionId/answers
 * Obter histórico de respostas
 */
router.get("/session/:sessionId/answers", PuzzleController.getSessionAnswers);

export default router;
