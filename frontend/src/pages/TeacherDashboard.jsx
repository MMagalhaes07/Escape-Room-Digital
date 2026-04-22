/**
 * TeacherDashboard Component
 * Dashboard para professores (facilitadores)
 * Monitorização de progresso e análise pedagógica
 */
import React, { useEffect, useState } from 'react';
import { useAuthStore, useUIStore } from '../store/index.js';
import { API } from '../services/api.js';
import { FiDownload, FiEye } from 'react-icons/fi';
import './TeacherDashboard.css';

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const { showNotification } = useUIStore();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, [user?.school]);

  const loadDashboard = async () => {
    try {
      const response = await API.teacher.getDashboard(user?.school);
      setDashboard(response.data.dashboard);
    } catch (error) {
      showNotification('Erro ao carregar dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (grade) => {
    try {
      const response = await API.teacher.exportClassReport(grade, user?.school);
      // Criar download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_turma_${grade}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showNotification('Relatório exportado com sucesso', 'success');
    } catch (error) {
      showNotification('Erro ao exportar relatório', 'error');
    }
  };

  if (loading) {
    return <div className="teacher-dashboard-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="teacher-dashboard-container">
      <div className="teacher-header">
        <h1>📊 Dashboard do Professor</h1>
        <p>Monitorização de Progresso Pedagógico</p>
      </div>

      {/* Analytics Geral */}
      {dashboard?.analytics && (
        <section className="analytics-section">
          <h2>📈 Análise Geral</h2>
          <div className="analytics-grid">
            {dashboard.analytics.map((stat, idx) => (
              <div key={idx} className="analytics-card">
                <h4>{stat.scenario}</h4>
                <div className="metric">
                  <span>Total de Sessões:</span>
                  <strong>{stat.total_sessions}</strong>
                </div>
                <div className="metric">
                  <span>Taxa de Conclusão:</span>
                  <strong>{Math.round(stat.completion_rate)}%</strong>
                </div>
                <div className="metric">
                  <span>Empatia Média:</span>
                  <strong>{Math.round(stat.avg_empathy_score)}/100</strong>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Alunos que Precisam de Intervenção */}
      {dashboard?.studentsNeedingIntervention && dashboard.studentsNeedingIntervention.length > 0 && (
        <section className="intervention-section">
          <h2>⚠️ Alunos que Precisam de Intervenção</h2>
          <div className="student-list">
            {dashboard.studentsNeedingIntervention.map((student) => (
              <div key={student.id} className="intervention-card">
                <div className="student-name">{student.name}</div>
                <div className="intervention-info">
                  <span>Email: {student.email}</span>
                  <span>Score de Empatia: {Math.round(student.avg_empathy || 0)}/100</span>
                </div>
                <button
                  className="button button-secondary"
                  onClick={() => setSelectedStudent(student)}
                >
                  <FiEye size={16} /> Ver Detalhes
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top Performers */}
      {dashboard?.topPerformers && (
        <section className="top-performers-section">
          <h2>🏆 Top Performers</h2>
          <div className="leaderboard">
            {dashboard.topPerformers.map((performer, idx) => (
              <div key={performer.id} className="leaderboard-row">
                <span className="rank">#{idx + 1}</span>
                <span className="name">{performer.name}</span>
                <span className="points">{performer.points} pts</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedStudent.name}</h3>
            <p>{selectedStudent.email}</p>
            <p>Score de Empatia Médio: {Math.round(selectedStudent.avg_empathy || 0)}/100</p>
            <p>Sessões Completas: {selectedStudent.sessions_completed || 0}</p>
            <button
              className="button button-secondary"
              onClick={() => setSelectedStudent(null)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <section className="actions-section">
        <h2>📥 Exportar Dados</h2>
        <div className="action-buttons">
          <button
            className="button button-primary"
            onClick={() => handleExportReport('8º')}
          >
            <FiDownload size={16} /> Exportar 8º Ano
          </button>
          <button
            className="button button-primary"
            onClick={() => handleExportReport('9º')}
          >
            <FiDownload size={16} /> Exportar 9º Ano
          </button>
        </div>
      </section>
    </div>
  );
}
