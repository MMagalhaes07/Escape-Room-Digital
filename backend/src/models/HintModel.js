/**
 * MODEL: HintModel
 *
 * Gerencia pistas (hints) que desbloqueiam progressivamente
 * Suporta múltiplas camadas e condições de desbloqueio
 */

import { query } from "../db/pool.js";
import { v4 as uuid } from "uuid";

export class HintModel {
  /**
   * Criar nova pista
   * @param {Object} hintData - Dados da pista
   * @returns {Promise<Object>} Pista criada
   */
  static async create(hintData) {
    const id = hintData.id || uuid();
    const {
      puzzleId,
      tier = 1, // Camada (1=primeira, 2=segunda, etc)
      title,
      content,
      unblockConditions = {},
      priority = 1,
      bullying_context = "general",
      educational_value = {},
    } = hintData;

    try {
      const result = await query(
        `INSERT INTO hints 
         (id, puzzle_id, tier, title, content, unlock_conditions, priority, bullying_context, educational_value, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         RETURNING *`,
        [
          id,
          puzzleId,
          tier,
          title,
          content,
          JSON.stringify(unblockConditions),
          priority,
          bullying_context,
          JSON.stringify(educational_value),
        ],
      );

      return result.rows[0];
    } catch (error) {
      console.error("HintModel.create error:", error);
      throw error;
    }
  }

  /**
   * Obter pista por ID
   * @param {string} hintId - ID da pista
   * @returns {Promise<Object>} Dados da pista
   */
  static async getById(hintId) {
    try {
      const result = await query("SELECT * FROM hints WHERE id = $1", [hintId]);

      if (result.rows.length === 0) {
        throw new Error(`Hint ${hintId} not found`);
      }

      const hint = result.rows[0];
      hint.unlock_conditions = JSON.parse(hint.unlock_conditions || "{}");
      hint.educational_value = JSON.parse(hint.educational_value || "{}");

      return hint;
    } catch (error) {
      console.error("HintModel.getById error:", error);
      throw error;
    }
  }

  /**
   * Obter todas as pistas de um puzzle
   * @param {string} puzzleId - ID do puzzle
   * @returns {Promise<Array>} Lista de pistas ordenadas por tier
   */
  static async getByPuzzle(puzzleId) {
    try {
      const result = await query(
        "SELECT * FROM hints WHERE puzzle_id = $1 ORDER BY tier ASC",
        [puzzleId],
      );

      return result.rows.map((hint) => ({
        ...hint,
        unlock_conditions: JSON.parse(hint.unlock_conditions || "{}"),
        educational_value: JSON.parse(hint.educational_value || "{}"),
      }));
    } catch (error) {
      console.error("HintModel.getByPuzzle error:", error);
      throw error;
    }
  }

  /**
   * Obter pistas ordenadas por tier (para progressão)
   * @param {string} puzzleId - ID do puzzle
   * @param {number} maxTier - Máximo tier a retornar
   * @returns {Promise<Array>} Pistas ordenadas
   */
  static async getProgression(puzzleId, maxTier = 3) {
    try {
      const result = await query(
        "SELECT * FROM hints WHERE puzzle_id = $1 AND tier <= $2 ORDER BY tier ASC",
        [puzzleId, maxTier],
      );

      return result.rows.map((hint) => ({
        ...hint,
        unlock_conditions: JSON.parse(hint.unlock_conditions || "{}"),
        educational_value: JSON.parse(hint.educational_value || "{}"),
      }));
    } catch (error) {
      console.error("HintModel.getProgression error:", error);
      throw error;
    }
  }

  /**
   * Atualizar pista
   * @param {string} hintId - ID da pista
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Pista atualizada
   */
  static async update(hintId, updateData) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (updateData.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(updateData.title);
    }
    if (updateData.content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      values.push(updateData.content);
    }
    if (updateData.unlock_conditions !== undefined) {
      updates.push(`unlock_conditions = $${paramCount++}`);
      values.push(JSON.stringify(updateData.unlock_conditions));
    }

    if (updates.length === 0) {
      return this.getById(hintId);
    }

    updates.push(`updated_at = NOW()`);
    values.push(hintId);

    try {
      const result = await query(
        `UPDATE hints SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
        values,
      );

      const hint = result.rows[0];
      hint.unlock_conditions = JSON.parse(hint.unlock_conditions || "{}");
      hint.educational_value = JSON.parse(hint.educational_value || "{}");

      return hint;
    } catch (error) {
      console.error("HintModel.update error:", error);
      throw error;
    }
  }

  /**
   * Deletar pista
   * @param {string} hintId - ID da pista
   * @returns {Promise<boolean>} True se deletada
   */
  static async delete(hintId) {
    try {
      await query("DELETE FROM hints WHERE id = $1", [hintId]);
      return true;
    } catch (error) {
      console.error("HintModel.delete error:", error);
      throw error;
    }
  }
}

/**
 * MODEL: PuzzleAnswerModel
 *
 * Rastreia respostas dos jogadores a puzzles
 * Usado para análise de progresso e geração de pistas
 */
export class PuzzleAnswerModel {
  /**
   * Registar resposta do jogador a puzzle
   * @param {Object} answerData - Dados da resposta
   * @returns {Promise<Object>} Resposta criada
   */
  static async create(answerData) {
    const id = answerData.id || uuid();
    const {
      sessionId,
      puzzleId,
      playerAnswer,
      isCorrect,
      score = 0,
      attemptNumber = 1,
      timeSpent = 0,
      feedback = "",
    } = answerData;

    try {
      const result = await query(
        `INSERT INTO puzzle_answers 
         (id, session_id, puzzle_id, player_answer, is_correct, score, attempt_number, time_spent, feedback, answered_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         RETURNING *`,
        [
          id,
          sessionId,
          puzzleId,
          playerAnswer,
          isCorrect,
          score,
          attemptNumber,
          timeSpent,
          feedback,
        ],
      );

      return result.rows[0];
    } catch (error) {
      console.error("PuzzleAnswerModel.create error:", error);
      throw error;
    }
  }

  /**
   * Obter histórico de respostas do jogador para um puzzle
   * @param {string} sessionId - ID da sessão
   * @param {string} puzzleId - ID do puzzle
   * @returns {Promise<Array>} Lista de respostas
   */
  static async getBySessionAndPuzzle(sessionId, puzzleId) {
    try {
      const result = await query(
        "SELECT * FROM puzzle_answers WHERE session_id = $1 AND puzzle_id = $2 ORDER BY answered_at ASC",
        [sessionId, puzzleId],
      );

      return result.rows;
    } catch (error) {
      console.error("PuzzleAnswerModel.getBySessionAndPuzzle error:", error);
      throw error;
    }
  }

  /**
   * Obter última resposta de um puzzle
   * @param {string} sessionId - ID da sessão
   * @param {string} puzzleId - ID do puzzle
   * @returns {Promise<Object|null>} Última resposta ou null
   */
  static async getLatest(sessionId, puzzleId) {
    try {
      const result = await query(
        "SELECT * FROM puzzle_answers WHERE session_id = $1 AND puzzle_id = $2 ORDER BY answered_at DESC LIMIT 1",
        [sessionId, puzzleId],
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error("PuzzleAnswerModel.getLatest error:", error);
      throw error;
    }
  }

  /**
   * Verificar se puzzle já foi resolvido
   * @param {string} sessionId - ID da sessão
   * @param {string} puzzleId - ID do puzzle
   * @returns {Promise<boolean>} True se resolvido
   */
  static async isSolved(sessionId, puzzleId) {
    try {
      const result = await query(
        "SELECT * FROM puzzle_answers WHERE session_id = $1 AND puzzle_id = $2 AND is_correct = true LIMIT 1",
        [sessionId, puzzleId],
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("PuzzleAnswerModel.isSolved error:", error);
      throw error;
    }
  }

  /**
   * Contar tentativas do jogador num puzzle
   * @param {string} sessionId - ID da sessão
   * @param {string} puzzleId - ID do puzzle
   * @returns {Promise<number>} Número de tentativas
   */
  static async countAttempts(sessionId, puzzleId) {
    try {
      const result = await query(
        "SELECT COUNT(*) as count FROM puzzle_answers WHERE session_id = $1 AND puzzle_id = $2",
        [sessionId, puzzleId],
      );

      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      console.error("PuzzleAnswerModel.countAttempts error:", error);
      throw error;
    }
  }

  /**
   * Obter estatísticas de respostas de um jogador
   * @param {string} sessionId - ID da sessão
   * @returns {Promise<Object>} Estatísticas
   */
  static async getSessionStats(sessionId) {
    try {
      const result = await query(
        `SELECT 
           COUNT(*) as total_attempts,
           SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
           AVG(score) as average_score,
           AVG(time_spent) as average_time,
           MAX(time_spent) as max_time,
           MIN(time_spent) as min_time
         FROM puzzle_answers 
         WHERE session_id = $1`,
        [sessionId],
      );

      return result.rows[0];
    } catch (error) {
      console.error("PuzzleAnswerModel.getSessionStats error:", error);
      throw error;
    }
  }
}

/**
 * MODEL: PlayerHintModel
 *
 * Rastreia pistas desbloqueadas por cada jogador
 */
export class PlayerHintModel {
  /**
   * Registar pista desbloqueada
   * @param {Object} hintData - Dados da pista desbloqueada
   * @returns {Promise<Object>} Registro criado
   */
  static async unlock(hintData) {
    const id = hintData.id || uuid();
    const {
      playerId,
      hintId,
      puzzleId,
      unlockedBy = "puzzle_progress",
      context = {},
    } = hintData;

    try {
      const result = await query(
        `INSERT INTO player_hints 
         (id, player_id, hint_id, puzzle_id, unlocked_by, context, unlocked_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [id, playerId, hintId, puzzleId, unlockedBy, JSON.stringify(context)],
      );

      return result.rows[0];
    } catch (error) {
      console.error("PlayerHintModel.unlock error:", error);
      throw error;
    }
  }

  /**
   * Obter pistas desbloqueadas por um jogador
   * @param {string} playerId - ID do jogador
   * @returns {Promise<Array>} Lista de pistas desbloqueadas
   */
  static async getUnlocked(playerId) {
    try {
      const result = await query(
        "SELECT * FROM player_hints WHERE player_id = $1 ORDER BY unlocked_at DESC",
        [playerId],
      );

      return result.rows.map((ph) => ({
        ...ph,
        context: JSON.parse(ph.context || "{}"),
      }));
    } catch (error) {
      console.error("PlayerHintModel.getUnlocked error:", error);
      throw error;
    }
  }

  /**
   * Obter pistas desbloqueadas para um puzzle
   * @param {string} playerId - ID do jogador
   * @param {string} puzzleId - ID do puzzle
   * @returns {Promise<Array>} Pistas desbloqueadas para este puzzle
   */
  static async getByPuzzle(playerId, puzzleId) {
    try {
      const result = await query(
        "SELECT * FROM player_hints WHERE player_id = $1 AND puzzle_id = $2 ORDER BY unlocked_at ASC",
        [playerId, puzzleId],
      );

      return result.rows.map((ph) => ({
        ...ph,
        context: JSON.parse(ph.context || "{}"),
      }));
    } catch (error) {
      console.error("PlayerHintModel.getByPuzzle error:", error);
      throw error;
    }
  }

  /**
   * Verificar se pista está desbloqueada
   * @param {string} playerId - ID do jogador
   * @param {string} hintId - ID da pista
   * @returns {Promise<boolean>} True se desbloqueada
   */
  static async isUnlocked(playerId, hintId) {
    try {
      const result = await query(
        "SELECT * FROM player_hints WHERE player_id = $1 AND hint_id = $2 LIMIT 1",
        [playerId, hintId],
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error("PlayerHintModel.isUnlocked error:", error);
      throw error;
    }
  }

  /**
   * Marcar pista como vista
   * @param {string} playerId - ID do jogador
   * @param {string} hintId - ID da pista
   * @returns {Promise<Object>} Registro atualizado
   */
  static async markViewed(playerId, hintId) {
    try {
      const result = await query(
        "UPDATE player_hints SET was_viewed = true, viewed_at = NOW() WHERE player_id = $1 AND hint_id = $2 RETURNING *",
        [playerId, hintId],
      );

      return result.rows[0];
    } catch (error) {
      console.error("PlayerHintModel.markViewed error:", error);
      throw error;
    }
  }

  /**
   * Obter pistas não vistas
   * @param {string} playerId - ID do jogador
   * @returns {Promise<Array>} Pistas não vistas
   */
  static async getUnviewed(playerId) {
    try {
      const result = await query(
        "SELECT * FROM player_hints WHERE player_id = $1 AND was_viewed = false ORDER BY unlocked_at DESC",
        [playerId],
      );

      return result.rows.map((ph) => ({
        ...ph,
        context: JSON.parse(ph.context || "{}"),
      }));
    } catch (error) {
      console.error("PlayerHintModel.getUnviewed error:", error);
      throw error;
    }
  }
}

export default HintModel;
