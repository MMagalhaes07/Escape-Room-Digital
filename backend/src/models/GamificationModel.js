/**
 * MODEL: GamificationModel
 * 
 * Sistema de gamificação para motivação dos alunos
 * Pontos, badges, níveis e progressão
 * 
 * CAMADA 3: DADOS
 * CAMADA 2: GAMIFICATION ENGINE
 */
import { query } from '../db/pool.js';
import { v4 as uuidv4 } from 'uuid';

export class GamificationModel {
  /**
   * Obter/Criar perfil de gamificação do utilizador
   */
  static async getOrCreateProfile(userId) {
    // Primeiro tenta buscar
    let text = 'SELECT * FROM gamification_profiles WHERE user_id = $1';
    let result = await query(text, [userId]);
    
    if (result.rows.length > 0) {
      return result.rows[0];
    }
    
    // Se não existe, cria novo perfil
    const profileId = uuidv4();
    const createdAt = new Date();
    
    text = `
      INSERT INTO gamification_profiles (id, user_id, points, level, experience, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    try {
      result = await query(text, [profileId, userId, 0, 1, 0, createdAt]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Gamification profile creation error: ${error.message}`);
    }
  }

  /**
   * Adicionar pontos a um utilizador
   * Triggerado por eventos: decisão correta, puzzle resolvido, session completada
   */
  static async addPoints(userId, points, reason) {
    const text = `
      UPDATE gamification_profiles
      SET 
        points = points + $1,
        experience = experience + $1,
        last_updated = NOW()
      WHERE user_id = $2
      RETURNING *
    `;
    
    try {
      const result = await query(text, [points, userId]);
      
      // Log da transação de pontos
      await this.logPointTransaction(userId, points, reason);
      
      // Verificar se utilizador subiu de nível
      return result.rows[0];
    } catch (error) {
      throw new Error(`Points addition error: ${error.message}`);
    }
  }

  /**
   * Registar nova badge obtida
   */
  static async awardBadge(userId, badgeId, description) {
    const id = uuidv4();
    const awardedAt = new Date();
    
    const text = `
      INSERT INTO user_badges (id, user_id, badge_id, awarded_at, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    try {
      const result = await query(text, [id, userId, badgeId, awardedAt, description]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Badge award error: ${error.message}`);
    }
  }

  /**
   * Obter badges do utilizador
   */
  static async getUserBadges(userId) {
    const text = `
      SELECT 
        ub.id,
        ub.badge_id,
        ub.description,
        ub.awarded_at,
        b.name,
        b.icon_url
      FROM user_badges ub
      LEFT JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = $1
      ORDER BY ub.awarded_at DESC
    `;
    
    try {
      const result = await query(text, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`User badges lookup error: ${error.message}`);
    }
  }

  /**
   * Calcular nível baseado em pontos/experiência
   * Sistema de progressão linear: 100 XP por nível
   */
  static async calculateLevel(experience) {
    return Math.floor(experience / 100) + 1;
  }

  /**
   * Obter leaderboard (top 10 jogadores)
   */
  static async getLeaderboard(limit = 10) {
    const text = `
      SELECT 
        u.id,
        u.name,
        u.grade,
        gp.points,
        gp.level,
        gp.experience,
        COUNT(DISTINCT ub.badge_id) as badges_count
      FROM gamification_profiles gp
      JOIN users u ON gp.user_id = u.id
      LEFT JOIN user_badges ub ON u.id = ub.user_id
      WHERE u.role = 'student'
      GROUP BY u.id, u.name, u.grade, gp.points, gp.level, gp.experience
      ORDER BY gp.points DESC, gp.experience DESC
      LIMIT $1
    `;
    
    try {
      const result = await query(text, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Leaderboard error: ${error.message}`);
    }
  }

  /**
   * Obter leaderboard por turma/grade
   */
  static async getGradeLeaderboard(grade, limit = 10) {
    const text = `
      SELECT 
        u.id,
        u.name,
        gp.points,
        gp.level,
        COUNT(DISTINCT ub.badge_id) as badges_count,
        ROW_NUMBER() OVER (ORDER BY gp.points DESC) as rank
      FROM gamification_profiles gp
      JOIN users u ON gp.user_id = u.id
      LEFT JOIN user_badges ub ON u.id = ub.user_id
      WHERE u.role = 'student' AND u.grade = $1
      GROUP BY u.id, u.name, gp.points, gp.level
      ORDER BY gp.points DESC
      LIMIT $2
    `;
    
    try {
      const result = await query(text, [grade, limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`Grade leaderboard error: ${error.message}`);
    }
  }

  /**
   * Log de transações de pontos (para análise)
   */
  static async logPointTransaction(userId, points, reason) {
    const id = uuidv4();
    const transactionDate = new Date();
    
    const text = `
      INSERT INTO points_transactions (id, user_id, points, reason, transaction_date)
      VALUES ($1, $2, $3, $4, $5)
    `;
    
    try {
      await query(text, [id, userId, points, reason, transactionDate]);
    } catch (error) {
      console.error('Error logging point transaction:', error);
    }
  }

  /**
   * Definições de badges (constantes do sistema)
   */
  static BADGES = {
    FIRST_GAME: 'first_game',
    EMPATHY_CHAMPION: 'empathy_champion',
    PUZZLE_MASTER: 'puzzle_master',
    DECISION_MAKER: 'decision_maker',
    EXPLORATION_EXPERT: 'exploration_expert',
    SPEEDRUNNER: 'speedrunner',
    COLLECTOR: 'collector',
    THREE_ENDINGS: 'three_endings',
  };

  /**
   * Definições de pontos
   */
  static POINTS = {
    SESSION_COMPLETED: 50,
    PUZZLE_SOLVED: 30,
    CLUE_FOUND: 10,
    MORAL_CHOICE: 25,
    EMPATHY_BONUS: 100,
    PERFECT_ENDING: 150,
  };
}

export default GamificationModel;
