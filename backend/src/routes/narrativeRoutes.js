/**
 * ROUTES: narrativeRoutes.js
 *
 * Endpoints para acesso a narrativas Twine
 * - GET /api/narratives/:scenarioId - Lista todos os nós
 * - GET /api/narratives/:scenarioId/start - Nó inicial
 * - GET /api/narratives/:scenarioId/:nodeId - Nó específico
 * - POST /api/narratives/:scenarioId/progress - Progredir narrativa
 */

import express from "express";
import NarrativeController from "../controllers/NarrativeController.js";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";

const router = express.Router();

/**
 * GET /api/narratives/:scenarioId
 * Listar todos os nós de um cenário
 * Acesso: público (sem autenticação requerida)
 */
router.get("/:scenarioId", optionalAuthMiddleware, (req, res, next) => {
  NarrativeController.getScenarioNodes(req, res).catch(next);
});

/**
 * GET /api/narratives/:scenarioId/start
 * Obter nó inicial de um cenário
 * Query: ?sessionId=<sessionId> (opcional)
 * Acesso: público
 */
router.get("/:scenarioId/start", optionalAuthMiddleware, (req, res, next) => {
  NarrativeController.getStartNode(req, res).catch(next);
});

/**
 * GET /api/narratives/:scenarioId/:nodeId
 * Obter nó específico
 * Query: ?sessionId=<sessionId> (opcional, para filtrar choices)
 * Acesso: público
 */
router.get("/:scenarioId/:nodeId", optionalAuthMiddleware, (req, res, next) => {
  NarrativeController.getNode(req, res).catch(next);
});

/**
 * POST /api/narratives/:scenarioId/progress
 * Avançar para próximo nó
 * Body: { sessionId, currentNodeId, choiceId }
 * Acesso: autenticado
 */
router.post(
  "/:scenarioId/progress",
  authMiddleware,
  validate("narrativeProgress"),
  (req, res, next) => {
    NarrativeController.progressNarrative(req, res).catch(next);
  },
);

export default router;
