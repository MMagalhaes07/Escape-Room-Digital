/**
 * MODEL: GameSession
 * 
 * Estrutura para sesões de jogo individual do utilizador
 * Armazena o estado do jogo para cada jogador
 * 
 * CAMADA 3: DADOS
 * CAMADA 2: STATE MANAGER - Gerencia estado do jogo no contexto de persistência
 */
import { query } from '../db/pool.js';
import { v4 as uuidv4 } from 'uuid';

export class GameSessionModel {
  /**
   * Criar nova sessão de jogo
   * @param {string} userId - ID do utilizador
   * @param {string} scenario - 'scenario_1' ou 'scenario_2'
   */
  static async create(userId, scenario) {
    const sessionId = uuidv4();
    const startTime = new Date();
    
    const text = `
      INSERT INTO game_sessions (id, user_id, scenario, start_time, state)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    // Estado inicial do jogo
    const initialState = {
      currentScene: scenario === 'scenario_1' ? 'school_intro' : 'chat_intro',
      inventory: [],
      choices_made: [],
      puzzles_solved: [],
      discovered_clues: [],
      completion_time: 0,
      game_active: true,
    };
    
    try {
      const result = await query(text, [
        sessionId,
        userId,
        scenario,
        startTime,
        JSON.stringify(initialState),
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Session creation error: ${error.message}`);
    }
  }

  /**
   * Buscar sessão por ID
   */
  static async findById(sessionId) {
    const text = 'SELECT * FROM game_sessions WHERE id = $1';
    try {
      const result = await query(text, [sessionId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Session lookup error: ${error.message}`);
    }
  }

  /**
   * Obter todas as sessões de um utilizador
   */
  static async findByUserId(userId) {
    const text = `
      SELECT id, user_id, scenario, start_time, end_time, state
      FROM game_sessions
      WHERE user_id = $1
      ORDER BY start_time DESC
    `;
    try {
      const result = await query(text, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`User sessions lookup error: ${error.message}`);
    }
  }

  /**
   * Atualizar estado da sessão
   * CAMADA 2: STATE MANAGER - Atualiza o estado persistido do jogo
   */
  static async updateState(sessionId, stateUpdate) {
    // Primeiro obtemos o estado atual
    const getStateText = 'SELECT state FROM game_sessions WHERE id = $1';
    const currentResult = await query(getStateText, [sessionId]);
    
    if (currentResult.rows.length === 0) {
      throw new Error('Session not found');
    }
    
    const currentState = currentResult.rows[0].state;
    const updatedState = { ...currentState, ...stateUpdate };
    
    const updateText = `
      UPDATE game_sessions
      SET state = $1, last_updated = $2
      WHERE id = $3
      RETURNING *
    `;
    
    try {
      const result = await query(updateText, [
        JSON.stringify(updatedState),
        new Date(),
        sessionId,
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`State update error: ${error.message}`);
    }
  }

  /**
   * Finalizar sessão de jogo
   */
  static async finalize(sessionId, finalState) {
    const endTime = new Date();
    
    const text = `
      UPDATE game_sessions
      SET end_time = $1, state = $2
      WHERE id = $3
      RETURNING *
    `;
    
    try {
      const result = await query(text, [
        endTime,
        JSON.stringify(finalState),
        sessionId,
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Session finalization error: ${error.message}`);
    }
  }

  /**
   * Obter resumo de sessão (para exportação de métricas)
   */
  static async getSummary(sessionId) {
    const text = `
      SELECT 
        id,
        user_id,
        scenario,
        start_time,
        end_time,
        EXTRACT(EPOCH FROM (end_time - start_time)) as duration_seconds,
        state
      FROM game_sessions
      WHERE id = $1
    `;
    
    try {
      const result = await query(text, [sessionId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Session summary error: ${error.message}`);
    }
  }
}

export default GameSessionModel;
