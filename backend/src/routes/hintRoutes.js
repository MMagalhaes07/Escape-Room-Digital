/**
 * ROUTES: Hint Routes
 *
 * Endpoints para gerenciar pistas
 */

import express from "express";
import HintController from "../controllers/HintController.js";

const router = express.Router();

/**
 * GET /api/hints?puzzleId=abc&sessionId=xyz
 * Obter pistas desbloqueadas para um puzzle
 */
router.get("/", HintController.getAvailableHints);

/**
 * GET /api/hints/:hintId
 * Obter detalhe de pista específica
 */
router.get("/:hintId", HintController.getHint);

/**
 * POST /api/hints/:hintId/view
 * Marcar pista como vista
 */
router.post("/:hintId/view", HintController.markHintViewed);

/**
 * GET /api/hints/unviewed?sessionId=abc
 * Obter pistas não vistas
 */
router.get("/unviewed", HintController.getUnviewedHints);

/**
 * GET /api/hints/recommend?puzzleId=abc&sessionId=xyz
 * Obter recomendação de pista
 */
router.get("/recommend", HintController.recommendHint);

/**
 * GET /api/hints/stats?sessionId=abc
 * Obter estatísticas de uso de pistas
 */
router.get("/stats", HintController.getHintUsageStats);

/**
 * GET /api/hints/suggestion?sessionId=abc&puzzleId=xyz
 * Obter sugestão de ajuda contextualizada
 */
router.get("/suggestion", HintController.getHelpSuggestion);

/**
 * GET /api/hints/player?sessionId=abc
 * Listar pistas do jogador
 */
router.get("/player", HintController.getPlayerHints);

export default router;
