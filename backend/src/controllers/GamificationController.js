/**
 * CONTROLLER: GamificationController
 * 
 * Gerencia sistema de pontos, badges e progressão
 * Motivação e engajamento dos alunos
 */
import GamificationModel from '../models/GamificationModel.js';

export class GamificationController {
  /**
   * Obter perfil de gamificação do utilizador
   */
  static async getUserProfile(req, res) {
    try {
      const { userId } = req.params;

      const profile = await GamificationModel.getOrCreateProfile(userId);
      const badges = await GamificationModel.getUserBadges(userId);

      // Calcular nível baseado na experiência
      const level = await GamificationModel.calculateLevel(profile.experience);

      res.json({
        success: true,
        profile: {
          ...profile,
          level,
        },
        badges,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter leaderboard global
   */
  static async getGlobalLeaderboard(req, res) {
    try {
      const { limit = 10 } = req.query;

      const leaderboard = await GamificationModel.getLeaderboard(parseInt(limit));

      res.json({
        success: true,
        leaderboard,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter leaderboard por turma/grade
   */
  static async getGradeLeaderboard(req, res) {
    try {
      const { grade, limit = 10 } = req.query;

      if (!grade) {
        return res.status(400).json({ error: 'Grade is required' });
      }

      const leaderboard = await GamificationModel.getGradeLeaderboard(grade, parseInt(limit));

      res.json({
        success: true,
        leaderboard,
        grade,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter todas as badges disponíveis no sistema
   */
  static async getAvailableBadges(req, res) {
    try {
      const badges = [
        {
          id: GamificationModel.BADGES.FIRST_GAME,
          name: 'Primeiro Jogo',
          description: 'Completou seu primeiro jogo',
          icon: '🎮',
        },
        {
          id: GamificationModel.BADGES.EMPATHY_CHAMPION,
          name: 'Campeão da Empatia',
          description: 'Obteve score de empatia acima de 80 em 5 sessões',
          icon: '💚',
        },
        {
          id: GamificationModel.BADGES.PUZZLE_MASTER,
          name: 'Mestre dos Puzzles',
          description: 'Resolveu todos os puzzles do jogo',
          icon: '🧩',
        },
        {
          id: GamificationModel.BADGES.DECISION_MAKER,
          name: 'Tomador de Decisões',
          description: 'Fez mais de 20 decisões significativas',
          icon: '🎯',
        },
        {
          id: GamificationModel.BADGES.EXPLORATION_EXPERT,
          name: 'Explorador Experto',
          description: 'Descobriu todas as pistas disponíveis',
          icon: '🔍',
        },
        {
          id: GamificationModel.BADGES.SPEEDRUNNER,
          name: 'Speedrunner',
          description: 'Completou um cenário em menos de 5 minutos',
          icon: '⚡',
        },
        {
          id: GamificationModel.BADGES.COLLECTOR,
          name: 'Colecionador',
          description: 'Desbloqueou 10 ou mais badges',
          icon: '🏆',
        },
        {
          id: GamificationModel.BADGES.THREE_ENDINGS,
          name: 'Todas as Terminações',
          description: 'Desbloqueou os 3 finais possíveis de um cenário',
          icon: '🎬',
        },
      ];

      res.json({
        success: true,
        badges,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default GamificationController;
