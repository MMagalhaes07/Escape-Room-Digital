/**
 * MODEL: GameDecision
 * 
 * Estrutura para registar todas as decisões tomadas pelo jogador
 * Essencial para análise pedagógica e feedback personalizado
 * 
 * CAMADA 3: DADOS
 * CAMADA 2: DECISION ENGINE - Processa consequências das escolhas
 */
import { query } from '../db/pool.js';
import { v4 as uuidv4 } from 'uuid';

export class GameDecisionModel {
  /**
   * Registar uma decisão do jogador
   * @param {Object} decisionData - {sessionId, userId, sceneId, choiceId, consequence, timestamp}
   */
  static async record(decisionData) {
    const id = uuidv4();
    const recordedAt = new Date();
    
    const text = `
      INSERT INTO game_decisions (
        id, session_id, user_id, scene_id, choice_id, 
        consequence, recorded_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    try {
      const result = await query(text, [
        id,
        decisionData.sessionId,
        decisionData.userId,
        decisionData.sceneId,
        decisionData.choiceId,
        JSON.stringify(decisionData.consequence || {}),
        recordedAt,
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Decision recording error: ${error.message}`);
    }
  }

  /**
   * Obter sequência de decisões de uma sessão
   * Importante para análise de padrões de comportamento
   */
  static async getSessionDecisions(sessionId) {
    const text = `
      SELECT id, scene_id, choice_id, consequence, recorded_at
      FROM game_decisions
      WHERE session_id = $1
      ORDER BY recorded_at ASC
    `;
    
    try {
      const result = await query(text, [sessionId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Session decisions lookup error: ${error.message}`);
    }
  }

  /**
   * Análise pedagógica: Padrões de decisão por utilizador
   * CAMADA 2: DECISION ENGINE
   */
  static async getUserDecisionPatterns(userId) {
    const text = `
      SELECT 
        gd.scene_id,
        gd.choice_id,
        COUNT(*) as frequency,
        ROUND(AVG((gd.consequence->>'empathy_score')::numeric), 2) as avg_empathy_impact
      FROM game_decisions gd
      JOIN game_sessions gs ON gd.session_id = gs.id
      WHERE gs.user_id = $1
      GROUP BY gd.scene_id, gd.choice_id
      ORDER BY frequency DESC
    `;
    
    try {
      const result = await query(text, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`User decision patterns error: ${error.message}`);
    }
  }

  /**
   * Análise agregada de escolhas (para relatório pedagógico)
   * Usado para Big Data Analytics - análise em larga escala
   */
  static async getAggregatedPatterns(scenarioId = null) {
    let text = `
      SELECT 
        gd.choice_id,
        gd.scene_id,
        COUNT(*) as total_choices,
        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage,
        ROUND(AVG((gd.consequence->>'empathy_score')::numeric), 2) as avg_empathy
      FROM game_decisions gd
      JOIN game_sessions gs ON gd.session_id = gs.id
    `;
    
    const params = [];
    
    if (scenarioId) {
      text += ` WHERE gs.scenario = $1`;
      params.push(scenarioId);
    }
    
    text += ` GROUP BY gd.choice_id, gd.scene_id ORDER BY total_choices DESC`;
    
    try {
      const result = await query(text, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Aggregated patterns error: ${error.message}`);
    }
  }

  /**
   * Identificar escolhas pedagogicamente críticas
   * Determina escolhas que têm maior impacto na empatia/aprendizagem
   */
  static async getCriticalChoices() {
    const text = `
      SELECT 
        choice_id,
        scene_id,
        AVG((consequence->>'empathy_score')::numeric) as empathy_variance,
        COUNT(*) as total_attempts
      FROM game_decisions
      GROUP BY choice_id, scene_id
      HAVING AVG((consequence->>'empathy_score')::numeric) > 0.5
      ORDER BY empathy_variance DESC
      LIMIT 10
    `;
    
    try {
      const result = await query(text, []);
      return result.rows;
    } catch (error) {
      throw new Error(`Critical choices lookup error: ${error.message}`);
    }
  }
}

export default GameDecisionModel;
