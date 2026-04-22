/**
 * CONTROLLER: MetricsController
 * 
 * Gerencia análise de dados e exportação de métricas
 * BIG DATA ANALYTICS: análise pedagógica em larga escala
 */
import GameMetricsModel from '../models/GameMetricsModel.js';
import GameDecisionModel from '../models/GameDecisionModel.js';

export class MetricsController {
  /**
   * Obter estatísticas de um utilizador
   */
  static async getUserStats(req, res) {
    try {
      const { userId } = req.params;

      const stats = await GameMetricsModel.getUserStatistics(userId);
      const progressByScenario = await GameMetricsModel.getUserProgressByScenario(userId);
      const decisionPatterns = await GameDecisionModel.getUserDecisionPatterns(userId);

      res.json({
        success: true,
        userStatistics: stats,
        progressByScenario,
        decisionPatterns,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Exportar métricas em CSV
   */
  static async exportMetricsCSV(req, res) {
    try {
      const { userId, scenario } = req.query;

      const metricsData = await GameMetricsModel.exportMetricsCSV({
        userId,
        scenario,
      });

      // Converter para CSV
      const csv = this.convertToCSV(metricsData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="game_metrics.csv"');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Análise em larga escala (Big Data Analytics)
   */
  static async getLargeScaleAnalytics(req, res) {
    try {
      const { scenario, dateFrom } = req.query;

      const analytics = await GameMetricsModel.getLargeScaleAnalytics({
        scenarioId: scenario,
        dateFrom: dateFrom ? new Date(dateFrom) : null,
      });

      const aggregatedPatterns = await GameDecisionModel.getAggregatedPatterns(scenario);
      const criticalChoices = await GameDecisionModel.getCriticalChoices();

      res.json({
        success: true,
        analytics,
        aggregatedPatterns,
        criticalChoices,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Helper: Converter array para CSV
   */
  static convertToCSV(data) {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csv = [headers.join(',')];

    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      });
      csv.push(values.join(','));
    }

    return csv.join('\n');
  }
}

export default MetricsController;
