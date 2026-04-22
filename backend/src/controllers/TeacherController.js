/**
 * CONTROLLER: TeacherController
 * 
 * Dashboard do professor (facilitador)
 * Monitorização de progresso dos alunos e análise pedagógica
 * 
 * CENTRADO NO PROFESSOR COMO FACILITADOR
 */
import GameMetricsModel from '../models/GameMetricsModel.js';
import UserModel from '../models/UserModel.js';
import GamificationModel from '../models/GamificationModel.js';

export class TeacherController {
  /**
   * Dashboard principal do professor
   * Visão geral de todos os alunos
   */
  static async getDashboard(req, res) {
    try {
      const { teacherId, school } = req.query;

      // Obter todos os alunos da escola do professor
      const students = await UserModel.findBySchool(school);

      // Análise em larga escala
      const largeScaleAnalytics = await GameMetricsModel.getLargeScaleAnalytics();

      // Alunos que precisam de intervenção
      const studentsNeedingHelp = await GameMetricsModel.getStudentsNeedingIntervention(40);

      // Leaderboard geral
      const leaderboard = await GamificationModel.getLeaderboard(5);

      res.json({
        success: true,
        dashboard: {
          totalStudents: students.length,
          analytics: largeScaleAnalytics,
          studentsNeedingIntervention: studentsNeedingHelp,
          topPerformers: leaderboard,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Perfil detalhado de um aluno
   * Para monitorização individual e orientação
   */
  static async getStudentProfile(req, res) {
    try {
      const { studentId } = req.params;

      // Dados do aluno
      const student = await UserModel.findById(studentId);

      // Estatísticas de jogo
      const gameStats = await GameMetricsModel.getUserStatistics(studentId);

      // Progresso por cenário
      const progressByScenario = await GameMetricsModel.getUserProgressByScenario(studentId);

      // Perfil de gamificação
      const gamificationProfile = await GamificationModel.getOrCreateProfile(studentId);
      const badges = await GamificationModel.getUserBadges(studentId);

      // Recomendações pedagógicas
      const recommendations = this.generatePedagogicalRecommendations(gameStats, progressByScenario);

      res.json({
        success: true,
        student,
        gameStatistics: gameStats,
        progressByScenario,
        gamification: {
          profile: gamificationProfile,
          badges,
        },
        pedagogicalRecommendations: recommendations,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Relatório de classe (todos os alunos de uma turma)
   */
  static async getClassReport(req, res) {
    try {
      const { grade, school } = req.query;

      // Obter alunos da turma
      const students = await UserModel.findBySchool(school);
      const classStudents = students.filter((s) => s.grade === grade);

      // Preparar relatório para cada aluno
      const classReport = [];

      for (const student of classStudents) {
        const stats = await GameMetricsModel.getUserStatistics(student.id);
        const gamProfile = await GamificationModel.getOrCreateProfile(student.id);

        classReport.push({
          student: student.name,
          email: student.email,
          completedSessions: stats.completed_sessions || 0,
          avgEmpathyScore: stats.avg_empathy_score || 0,
          level: await GamificationModel.calculateLevel(gamProfile.experience),
          points: gamProfile.points,
        });
      }

      res.json({
        success: true,
        grade,
        school,
        totalStudents: classStudents.length,
        classReport: classReport.sort((a, b) => b.points - a.points),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Exportar relatório pedagógico em CSV
   */
  static async exportClassReportCSV(req, res) {
    try {
      const { grade, school } = req.query;

      const students = await UserModel.findBySchool(school);
      const classStudents = students.filter((s) => s.grade === grade);

      const reportData = [];

      for (const student of classStudents) {
        const stats = await GameMetricsModel.getUserStatistics(student.id);
        const gamProfile = await GamificationModel.getOrCreateProfile(student.id);

        reportData.push({
          name: student.name,
          email: student.email,
          grade: student.grade,
          completed_sessions: stats.completed_sessions || 0,
          avg_empathy_score: stats.avg_empathy_score || 0,
          level: await GamificationModel.calculateLevel(gamProfile.experience),
          points: gamProfile.points,
          max_empathy: stats.max_empathy_score || 0,
        });
      }

      const csv = this.convertToCSV(reportData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="class_report_${grade}.csv"`);
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Gerar recomendações pedagógicas para um aluno
   */
  static generatePedagogicalRecommendations(stats, progressByScenario) {
    const recommendations = {
      strengths: [],
      areasForImprovement: [],
      suggestedInterventions: [],
    };

    // Análise de empatia
    if (stats.avg_empathy_score >= 70) {
      recommendations.strengths.push('Forte desenvolvimento de empatia');
      recommendations.suggestedInterventions.push('Considere criar oportunidades de peer mentoring com este aluno');
    } else if (stats.avg_empathy_score < 40) {
      recommendations.areasForImprovement.push('Desenvolvimento de empatia abaixo do esperado');
      recommendations.suggestedInterventions.push(
        'Conversa individual sobre perspetivas e consequências das ações'
      );
      recommendations.suggestedInterventions.push('Possível exposição a recursos adicionais sobre empatia');
    }

    // Análise de participação
    if (stats.total_sessions === 0) {
      recommendations.areasForImprovement.push('Sem participação no jogo');
      recommendations.suggestedInterventions.push('Verificar motivação e acesso ao sistema');
    } else if (stats.completed_sessions < stats.total_sessions * 0.5) {
      recommendations.areasForImprovement.push('Taxa de abandono elevada');
      recommendations.suggestedInterventions.push('Investigar possíveis dificuldades técnicas ou de compreensão');
    }

    return recommendations;
  }

  /**
   * Helper: Converter para CSV
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

export default TeacherController;
