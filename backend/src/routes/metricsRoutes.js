/**
 * ROUTES: Metrics Routes
 * Endpoints para análise de dados e exportação de métricas
 */
import express from 'express';
import MetricsController from '../controllers/MetricsController.js';

const router = express.Router();

/**
 * GET /api/metrics/user/:userId
 * Obter estatísticas de um utilizador
 */
router.get('/user/:userId', MetricsController.getUserStats);

/**
 * GET /api/metrics/export
 * Exportar métricas em CSV
 */
router.get('/export', MetricsController.exportMetricsCSV);

/**
 * GET /api/metrics/analytics
 * Análise em larga escala (Big Data Analytics)
 */
router.get('/analytics', MetricsController.getLargeScaleAnalytics);

export default router;
