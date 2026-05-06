/**
 * ROUTES: Game Routes
 * Endpoints para gerenciar sessões e progresso do jogo
 * Todos com autenticação e validação
 */
import express from "express";
import GameController from "../controllers/GameController.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";

const router = express.Router();

/**
 * POST /api/game/session
 * Iniciar nova sessão de jogo
 * Validação: scenarioId (string, required), userId (string, required)
 */
router.post(
  "/session",
  authMiddleware,
  validate("gameSession"),
  (req, res, next) => {
    GameController.startSession(req, res).catch(next);
  },
);

/**
 * POST /api/game/decision
 * Registar decisão do jogador
 * Validação: sessionId, nodeId, choiceId
 */
router.post(
  "/decision",
  authMiddleware,
  validate("gameDecision"),
  (req, res, next) => {
    GameController.recordDecision(req, res).catch(next);
  },
);

/**
 * POST /api/game/puzzle
 * Completar puzzle
 * Validação: sessionId, puzzleId, answer
 */
router.post(
  "/puzzle",
  authMiddleware,
  validate("puzzleAnswer"),
  (req, res, next) => {
    GameController.completePuzzle(req, res).catch(next);
  },
);

/**
 * POST /api/game/clue
 * Descobrir pista
 * Validação: sessionId, clueId
 */
router.post(
  "/clue",
  authMiddleware,
  validate("hintRequest"),
  (req, res, next) => {
    GameController.discoverClue(req, res).catch(next);
  },
);

/**
 * POST /api/game/finish
 * Finalizar sessão
 * Validação: sessionId
 */
router.post("/finish", authMiddleware, (req, res, next) => {
  GameController.finishSession(req, res).catch(next);
});

export default router;
