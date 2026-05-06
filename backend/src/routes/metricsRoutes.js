/**
 * ROUTES: Metrics Routes
 * Endpoints para análise de dados e exportação de métricas
 */
import express from "express";
import MetricsController from "../controllers/MetricsController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/metrics/session/:sessionId/export
 * Exportar sessão específica como CSV
 * Acesso: autenticado
 */
router.get("/session/:sessionId/export", authMiddleware, (req, res, next) => {
  MetricsController.exportSessionCSV(req, res).catch(next);
});

/**
 * GET /api/metrics/user/:userId
 * Obter estatísticas de um utilizador
 */
router.get("/user/:userId", authMiddleware, (req, res, next) => {
  MetricsController.getUserStats(req, res).catch(next);
});

/**
 * GET /api/metrics/export
 * Exportar métricas em CSV
 */
router.get("/export", authMiddleware, (req, res, next) => {
  MetricsController.exportMetricsCSV(req, res).catch(next);
});

/**
 * GET /api/metrics/analytics
 * Análise em larga escala (Big Data Analytics)
 */
router.get("/analytics", authMiddleware, (req, res, next) => {
  MetricsController.getLargeScaleAnalytics(req, res).catch(next);
});

export default router;
