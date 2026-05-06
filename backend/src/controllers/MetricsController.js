/**
 * CONTROLLER: MetricsController
 *
 * Gerencia análise de dados e exportação de métricas
 * BIG DATA ANALYTICS: análise pedagógica em larga escala
 */
import GameMetricsModel from "../models/GameMetricsModel.js";
import GameDecisionModel from "../models/GameDecisionModel.js";

export class MetricsController {
  /**
   * Obter estatísticas de um utilizador
   */
  static async getUserStats(req, res) {
    try {
      const { userId } = req.params;

      const stats = await GameMetricsModel.getUserStatistics(userId);
      const progressByScenario =
        await GameMetricsModel.getUserProgressByScenario(userId);
      const decisionPatterns =
        await GameDecisionModel.getUserDecisionPatterns(userId);

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

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="game_metrics.csv"',
      );
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

      const aggregatedPatterns =
        await GameDecisionModel.getAggregatedPatterns(scenario);
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
   * Exportar CSV de uma sessão específica
   * GET /api/metrics/session/:sessionId/export
   *
   * Formato CSV:
   * session_id,user_id,scenario,timestamp,event_type,scene_id,choice_id,puzzle_id,puzzle_result,time_spent_seconds,empathy_score,total_score
   */
  static async exportSessionCSV(req, res) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: "sessionId é obrigatório",
        });
      }

      // Recuperar decisões da sessão
      const decisions = await GameDecisionModel.getSessionDecisions(sessionId);

      if (!decisions || decisions.length === 0) {
        // Retornar CSV vazio com headers
        const headers = [
          "session_id",
          "user_id",
          "scenario",
          "timestamp",
          "event_type",
          "scene_id",
          "choice_id",
          "puzzle_id",
          "puzzle_result",
          "time_spent_seconds",
          "empathy_score",
          "total_score",
        ].join(",");

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="sessao_${sessionId}.csv"`,
        );
        res.send(headers);
        return;
      }

      // Converter para CSV com formato exato especificado
      const csv = this.formatSessionCSV(decisions, sessionId);

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="sessao_${sessionId}.csv"`,
      );
      res.send(csv);
    } catch (error) {
      console.error("Erro ao exportar sessão CSV:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Formatar decisões da sessão como CSV
   * Segue exatamente o formato especificado
   *
   * @private
   */
  static formatSessionCSV(decisions, sessionId) {
    const headers = [
      "session_id",
      "user_id",
      "scenario",
      "timestamp",
      "event_type",
      "scene_id",
      "choice_id",
      "puzzle_id",
      "puzzle_result",
      "time_spent_seconds",
      "empathy_score",
      "total_score",
    ];

    const csv = [headers.join(",")];

    for (const decision of decisions) {
      const row = [
        decision.session_id || sessionId,
        decision.user_id || "",
        decision.scenario || "",
        decision.timestamp ? new Date(decision.timestamp).toISOString() : "",
        decision.event_type || "choice_made",
        decision.scene_id || "",
        decision.choice_id || "",
        decision.puzzle_id || "",
        decision.puzzle_result !== undefined ? decision.puzzle_result : "",
        decision.time_spent_seconds || "0",
        decision.empathy_score || "50",
        decision.total_score || "0",
      ];

      csv.push(row.join(","));
    }

    return csv.join("\n");
  }

  /**
   * Helper: Converter array para CSV (genérico)
   */
  static convertToCSV(data) {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csv = [headers.join(",")];

    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return "";
        if (typeof value === "string" && value.includes(",")) {
          return `"${value}"`;
        }
        return value;
      });
      csv.push(values.join(","));
    }

    return csv.join("\n");
  }
}

export default MetricsController;
