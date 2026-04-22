/**
 * MODEL: GameMetrics
 *
 * Armazena métricas de aprendizagem e performance do jogo
 * Usado para Big Data Analytics e monitorização de progresso
 *
 * CAMADA 3: DADOS
 * CAMADA 2: BIG DATA ANALYTICS - Análise de padrões de aprendizagem
 */
import { query } from "../db/pool.js";
import { v4 as uuidv4 } from "uuid";

export class GameMetricsModel {
  /**
   * Registar métricas de uma sessão completa
   */
  static async recordSessionMetrics(sessionId, metricsData) {
    const id = uuidv4();
    const recordedAt = new Date();

    const text = `
      INSERT INTO game_metrics (
        id, session_id, user_id, scenario,
        total_duration, decisions_count, puzzles_solved,
        clues_found, empathy_score, final_choice,
        completion_status, recorded_at, raw_data
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    try {
      const result = await query(text, [
        id,
        metricsData.sessionId,
        metricsData.userId,
        metricsData.scenario,
        metricsData.totalDuration, // em segundos
        metricsData.decisionsCount,
        metricsData.puzzlesSolved,
        metricsData.cluesFound,
        metricsData.empathyScore, // 0-100
        metricsData.finalChoice,
        metricsData.completionStatus, // 'completed', 'abandoned', 'in_progress'
        recordedAt,
        JSON.stringify(metricsData.rawData || {}), // Dados adicionais
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Metrics recording error: ${error.message}`);
    }
  }

  /**
   * Obter estatísticas de um utilizador
   */
  static async getUserStatistics(userId) {
    const text = `
      SELECT 
        COUNT(*) as total_sessions,
        AVG(total_duration) as avg_session_duration,
        AVG(empathy_score) as avg_empathy_score,
        SUM(CASE WHEN completion_status = 'completed' THEN 1 ELSE 0 END) as completed_sessions,
        MAX(empathy_score) as max_empathy_score,
        MIN(empathy_score) as min_empathy_score
      FROM game_metrics
      WHERE user_id = $1
    `;

    try {
      const result = await query(text, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`User statistics error: ${error.message}`);
    }
  }

  /**
   * Relatório de progresso do utilizador por cenário
   */
  static async getUserProgressByScenario(userId) {
    const text = `
      SELECT 
        scenario,
        COUNT(*) as attempts,
        AVG(empathy_score) as avg_empathy,
        AVG(total_duration) as avg_duration,
        SUM(CASE WHEN completion_status = 'completed' THEN 1 ELSE 0 END) as completions
      FROM game_metrics
      WHERE user_id = $1
      GROUP BY scenario
    `;

    try {
      const result = await query(text, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`User progress error: ${error.message}`);
    }
  }

  /**
   * BIG DATA ANALYTICS: Análise em larga escala
   * Identificar tendências pedagógicas entre múltiplos utilizadores
   */
  static async getLargeScaleAnalytics(filters = {}) {
    let text = `
      SELECT 
        scenario,
        COUNT(*) as total_sessions,
        COUNT(DISTINCT user_id) as unique_players,
        ROUND(AVG(empathy_score)::numeric, 2) as avg_empathy_score,
        ROUND(AVG(total_duration)::numeric, 2) as avg_duration,
        ROUND((100.0 * SUM(CASE WHEN completion_status = 'completed' THEN 1 ELSE 0 END) 
              / COUNT(*))::numeric, 2) as completion_rate,
        COUNT(*) FILTER (WHERE empathy_score > 70) as high_empathy_players
      FROM game_metrics
    `;

    const params = [];
    const whereConditions = [];

    if (filters.scenarioId) {
      whereConditions.push(`scenario = $${params.length + 1}`);
      params.push(filters.scenarioId);
    }

    if (filters.dateFrom) {
      whereConditions.push(`recorded_at >= $${params.length + 1}`);
      params.push(filters.dateFrom);
    }

    if (whereConditions.length > 0) {
      text += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    text += ` GROUP BY scenario`;

    try {
      const result = await query(text, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Analytics error: ${error.message}`);
    }
  }

  /**
   * Exportar métricas em formato CSV
   * Para relatório pedagógico e análise offline
   */
  static async exportMetricsCSV(filters = {}) {
    let text = `
      SELECT 
        gm.session_id,
        u.name,
        u.grade,
        gm.scenario,
        gm.total_duration,
        gm.decisions_count,
        gm.empathy_score,
        gm.final_choice,
        gm.completion_status,
        gm.recorded_at
      FROM game_metrics gm
      JOIN users u ON gm.user_id = u.id
    `;

    const params = [];
    const whereConditions = [];

    if (filters.userId) {
      whereConditions.push(`gm.user_id = $${params.length + 1}`);
      params.push(filters.userId);
    }

    if (filters.scenario) {
      whereConditions.push(`gm.scenario = $${params.length + 1}`);
      params.push(filters.scenario);
    }

    if (whereConditions.length > 0) {
      text += ` WHERE ${whereConditions.join(" AND ")}`;
    }

    text += ` ORDER BY gm.recorded_at DESC`;

    try {
      const result = await query(text, params);
      return result.rows;
    } catch (error) {
      throw new Error(`CSV export error: ${error.message}`);
    }
  }

  /**
   * Identif pedagógica: Alunos que precisam de intervenção
   * Baseado em empatia score baixo
   */
  static async getStudentsNeedingIntervention(empathyThreshold = 40) {
    const text = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.grade,
        AVG(gm.empathy_score) as avg_empathy,
        COUNT(gm.id) as sessions_completed
      FROM users u
      LEFT JOIN game_metrics gm ON u.id = gm.user_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.name, u.email, u.grade
      HAVING AVG(gm.empathy_score) < $1 OR COUNT(gm.id) = 0
      ORDER BY avg_empathy ASC
    `;

    try {
      const result = await query(text, [empathyThreshold]);
      return result.rows;
    } catch (error) {
      throw new Error(`Intervention list error: ${error.message}`);
    }
  }
}

export default GameMetricsModel;
