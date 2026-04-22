/**
 * ROUTES: Game Routes
 * Endpoints para gerenciar sessões e progresso do jogo
 */
import express from 'express';
import GameController from '../controllers/GameController.js';

const router = express.Router();

/**
 * POST /api/game/session
 * Iniciar nova sessão de jogo
 */
router.post('/session', GameController.startSession);

/**
 * POST /api/game/decision
 * Registar decisão do jogador
 */
router.post('/decision', GameController.recordDecision);

/**
 * POST /api/game/puzzle
 * Completar puzzle
 */
router.post('/puzzle', GameController.completePuzzle);

/**
 * POST /api/game/clue
 * Descobrir pista
 */
router.post('/clue', GameController.discoverClue);

/**
 * POST /api/game/finish
 * Finalizar sessão
 */
router.post('/finish', GameController.finishSession);

export default router;
