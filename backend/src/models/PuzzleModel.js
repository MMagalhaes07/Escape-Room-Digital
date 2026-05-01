/**
 * MODEL: PuzzleModel
 *
 * Gerencia definições de puzzles na base de dados
 * Suporta diferentes tipos: multiple_choice, text_validation, ordering, matching
 */

import { query } from "../db/pool.js";
import { v4 as uuid } from "uuid";

export class PuzzleModel {
  /**
   * Criar novo puzzle
   * @param {Object} puzzleData - Dados do puzzle
   * @returns {Promise<Object>} Puzzle criado
   */
  static async create(puzzleData) {
    const id = puzzleData.id || uuid();
    const {
      scenarioId,
      type,
      question,
      difficulty = 1,
      educationalContext = "general",
      expectedAnswers = null,
      hints = [],
      feedback = {},
      metadata = {},
    } = puzzleData;

    try {
      const result = await query(
        `INSERT INTO puzzles 
         (id, scenario_id, type, question, difficulty, educational_context, expected_answers, hints, feedback, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         RETURNING *`,
        [
          id,
          scenarioId,
          type,
          question,
          difficulty,
          educationalContext,
          JSON.stringify(expectedAnswers),
          JSON.stringify(hints),
          JSON.stringify(feedback),
          JSON.stringify(metadata),
        ],
      );

      return result.rows[0];
    } catch (error) {
      console.error("PuzzleModel.create error:", error);
      throw error;
    }
  }

  /**
   * Obter puzzle por ID
   * @param {string} puzzleId - ID do puzzle
   * @returns {Promise<Object>} Dados do puzzle
   */
  static async getById(puzzleId) {
    try {
      const result = await query("SELECT * FROM puzzles WHERE id = $1", [
        puzzleId,
      ]);

      if (result.rows.length === 0) {
        throw new Error(`Puzzle ${puzzleId} not found`);
      }

      // Parse JSON fields
      const puzzle = result.rows[0];
      puzzle.expected_answers = JSON.parse(puzzle.expected_answers || "{}");
      puzzle.hints = JSON.parse(puzzle.hints || "[]");
      puzzle.feedback = JSON.parse(puzzle.feedback || "{}");
      puzzle.metadata = JSON.parse(puzzle.metadata || "{}");

      return puzzle;
    } catch (error) {
      console.error("PuzzleModel.getById error:", error);
      throw error;
    }
  }

  /**
   * Obter todos os puzzles de um cenário
   * @param {string} scenarioId - ID do cenário
   * @returns {Promise<Array>} Lista de puzzles
   */
  static async getByScenario(scenarioId) {
    try {
      const result = await query(
        "SELECT * FROM puzzles WHERE scenario_id = $1 ORDER BY created_at ASC",
        [scenarioId],
      );

      // Parse JSON fields para cada puzzle
      return result.rows.map((puzzle) => ({
        ...puzzle,
        expected_answers: JSON.parse(puzzle.expected_answers || "{}"),
        hints: JSON.parse(puzzle.hints || "[]"),
        feedback: JSON.parse(puzzle.feedback || "{}"),
        metadata: JSON.parse(puzzle.metadata || "{}"),
      }));
    } catch (error) {
      console.error("PuzzleModel.getByScenario error:", error);
      throw error;
    }
  }

  /**
   * Obter puzzles por tipo
   * @param {string} type - Tipo de puzzle (multiple_choice, text_validation, etc)
   * @returns {Promise<Array>} Lista de puzzles
   */
  static async getByType(type) {
    try {
      const result = await query(
        "SELECT * FROM puzzles WHERE type = $1 ORDER BY created_at ASC",
        [type],
      );

      return result.rows.map((puzzle) => ({
        ...puzzle,
        expected_answers: JSON.parse(puzzle.expected_answers || "{}"),
        hints: JSON.parse(puzzle.hints || "[]"),
        feedback: JSON.parse(puzzle.feedback || "{}"),
        metadata: JSON.parse(puzzle.metadata || "{}"),
      }));
    } catch (error) {
      console.error("PuzzleModel.getByType error:", error);
      throw error;
    }
  }

  /**
   * Atualizar puzzle
   * @param {string} puzzleId - ID do puzzle
   * @param {Object} updateData - Dados para atualizar
   * @returns {Promise<Object>} Puzzle atualizado
   */
  static async update(puzzleId, updateData) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Construir query dinâmica
    if (updateData.question !== undefined) {
      updates.push(`question = $${paramCount++}`);
      values.push(updateData.question);
    }
    if (updateData.difficulty !== undefined) {
      updates.push(`difficulty = $${paramCount++}`);
      values.push(updateData.difficulty);
    }
    if (updateData.feedback !== undefined) {
      updates.push(`feedback = $${paramCount++}`);
      values.push(JSON.stringify(updateData.feedback));
    }
    if (updateData.hints !== undefined) {
      updates.push(`hints = $${paramCount++}`);
      values.push(JSON.stringify(updateData.hints));
    }

    if (updates.length === 0) {
      return this.getById(puzzleId);
    }

    updates.push(`updated_at = NOW()`);
    values.push(puzzleId);

    try {
      const result = await query(
        `UPDATE puzzles SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
        values,
      );

      const puzzle = result.rows[0];
      puzzle.expected_answers = JSON.parse(puzzle.expected_answers || "{}");
      puzzle.hints = JSON.parse(puzzle.hints || "[]");
      puzzle.feedback = JSON.parse(puzzle.feedback || "{}");
      puzzle.metadata = JSON.parse(puzzle.metadata || "{}");

      return puzzle;
    } catch (error) {
      console.error("PuzzleModel.update error:", error);
      throw error;
    }
  }

  /**
   * Deletar puzzle
   * @param {string} puzzleId - ID do puzzle
   * @returns {Promise<boolean>} True se deletado
   */
  static async delete(puzzleId) {
    try {
      await query("DELETE FROM puzzles WHERE id = $1", [puzzleId]);
      return true;
    } catch (error) {
      console.error("PuzzleModel.delete error:", error);
      throw error;
    }
  }

  /**
   * Listar todos os puzzles
   * @param {Object} options - Opções de paginação
   * @returns {Promise<Array>} Lista de puzzles
   */
  static async list(options = {}) {
    const { limit = 50, offset = 0 } = options;
    try {
      const result = await query(
        "SELECT * FROM puzzles ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        [limit, offset],
      );

      return result.rows.map((puzzle) => ({
        ...puzzle,
        expected_answers: JSON.parse(puzzle.expected_answers || "{}"),
        hints: JSON.parse(puzzle.hints || "[]"),
        feedback: JSON.parse(puzzle.feedback || "{}"),
        metadata: JSON.parse(puzzle.metadata || "{}"),
      }));
    } catch (error) {
      console.error("PuzzleModel.list error:", error);
      throw error;
    }
  }
}

export default PuzzleModel;
