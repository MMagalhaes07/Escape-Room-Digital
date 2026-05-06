/**
 * ROUTES: Hint Routes
 *
 * FIX #5 — Rotas estáticas declaradas ANTES da rota paramétrica /:hintId.
 * O Express avalia rotas por ordem de declaração: se /:hintId vier primeiro,
 * captura "/unviewed", "/recommend", etc. como se fossem IDs de pistas.
 *
 * Com autenticação e validação adicionadas
 */

import express from "express";
import HintController from "../controllers/HintController.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";

const router = express.Router();

// ─── ROTAS ESTÁTICAS (devem vir ANTES de /:hintId) ─────────────────────────

/**
 * GET /api/hints?puzzleId=abc&sessionId=xyz
 * Obter pistas disponíveis
 */
router.get("/", authMiddleware, (req, res, next) => {
  HintController.getAvailableHints(req, res).catch(next);
});

/**
 * GET /api/hints/unviewed?sessionId=abc
 * Obter pistas não vistas
 */
router.get("/unviewed", authMiddleware, (req, res, next) => {
  HintController.getUnviewedHints(req, res).catch(next);
});

/**
 * GET /api/hints/recommend?puzzleId=abc&sessionId=xyz
 * Recomendar pista baseada em progresso
 */
router.get("/recommend", authMiddleware, (req, res, next) => {
  HintController.recommendHint(req, res).catch(next);
});

/**
 * GET /api/hints/stats?sessionId=abc
 * Obter estatísticas de uso de pistas
 */
router.get("/stats", authMiddleware, (req, res, next) => {
  HintController.getHintUsageStats(req, res).catch(next);
});

/**
 * GET /api/hints/suggestion?sessionId=abc&puzzleId=xyz
 * Obter sugestão de ajuda
 */
router.get("/suggestion", authMiddleware, (req, res, next) => {
  HintController.getHelpSuggestion(req, res).catch(next);
});

/**
 * GET /api/hints/player?sessionId=abc
 * Obter pistas do jogador
 */
router.get("/player", authMiddleware, (req, res, next) => {
  HintController.getPlayerHints(req, res).catch(next);
});

// ─── ROTA PARAMÉTRICA (deve vir POR ÚLTIMO) ─────────────────────────────────

/**
 * GET /api/hints/:hintId
 * Obter detalhes da pista
 */
router.get("/:hintId", authMiddleware, (req, res, next) => {
  HintController.getHint(req, res).catch(next);
});

/**
 * POST /api/hints/:hintId/view
 * Marcar pista como vista (unlock)
 * Validação: hintId, sessionId
 */
router.post(
  "/:hintId/view",
  authMiddleware,
  validate("hintRequest"),
  (req, res, next) => {
    HintController.markHintViewed(req, res).catch(next);
  },
);

export default router;
