/**
 * ROUTES: Hint Routes
 *
 * FIX #5 — Rotas estáticas declaradas ANTES da rota paramétrica /:hintId.
 * O Express avalia rotas por ordem de declaração: se /:hintId vier primeiro,
 * captura "/unviewed", "/recommend", etc. como se fossem IDs de pistas.
 */

import express from "express";
import HintController from "../controllers/HintController.js";

const router = express.Router();

// ─── ROTAS ESTÁTICAS (devem vir ANTES de /:hintId) ─────────────────────────

/** GET /api/hints?puzzleId=abc&sessionId=xyz */
router.get("/", HintController.getAvailableHints);

/** GET /api/hints/unviewed?sessionId=abc */
router.get("/unviewed", HintController.getUnviewedHints);

/** GET /api/hints/recommend?puzzleId=abc&sessionId=xyz */
router.get("/recommend", HintController.recommendHint);

/** GET /api/hints/stats?sessionId=abc */
router.get("/stats", HintController.getHintUsageStats);

/** GET /api/hints/suggestion?sessionId=abc&puzzleId=xyz */
router.get("/suggestion", HintController.getHelpSuggestion);

/** GET /api/hints/player?sessionId=abc */
router.get("/player", HintController.getPlayerHints);

// ─── ROTA PARAMÉTRICA (deve vir POR ÚLTIMO) ─────────────────────────────────

/** GET /api/hints/:hintId */
router.get("/:hintId", HintController.getHint);

/** POST /api/hints/:hintId/view */
router.post("/:hintId/view", HintController.markHintViewed);

export default router;
