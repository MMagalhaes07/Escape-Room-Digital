/**
 * DashboardPage Component
 * Dashboard do aluno com estatísticas e acesso aos cenários
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore, usePlayerStore, useUIStore } from '../store/index.js';
import { API } from '../services/api.js';
import { FiTrendingUp, FiAward } from 'react-icons/fi';
import { PiGameController } from 'react-icons/pi';
import './Dashboard.css';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { profile, gamification, stats, setProfile, setGamification, setStats } = usePlayerStore();
  const { setLoading, showNotification } = useUIStore();
  const [loading, setLoadingLocal] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [user?.id]);

  const loadUserData = async () => {
    if (!user?.id) return;

    try {
      setLoadingLocal(true);

      // Carregar múltiplos dados em paralelo
      const [profileRes, gamificationRes, statsRes] = await Promise.all([
        API.auth.getProfile(user.id),
        API.gamification.getUserProfile(user.id),
        API.metrics.getUserStats(user.id),
      ]);

      setProfile(profileRes.data.user);
      setGamification(gamificationRes.data);
      setStats(statsRes.data.userStatistics);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showNotification('Erro ao carregar dados', 'error');
    } finally {
      setLoadingLocal(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>👋 Bem-vindo, {user?.name}!</h1>
        <p>Escolha um cenário para começar sua aventura pedagógica</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <PiGameController size={32} />
          <h3>Sessões Completas</h3>
          <p className="stat-value">{stats?.completed_sessions || 0}</p>
        </div>

        <div className="stat-card">
          <FiTrendingUp size={32} />
          <h3>Score de Empatia</h3>
          <p className="stat-value">{Math.round(stats?.avg_empathy_score || 0)}%</p>
        </div>

        <div className="stat-card">
          <FiAward size={32} />
          <h3>Pontos Totais</h3>
          <p className="stat-value">{gamification?.profile?.points || 0}</p>
        </div>

        <div className="stat-card">
          <span style={{ fontSize: '2rem' }}>📊</span>
          <h3>Nível</h3>
          <p className="stat-value">{gamification?.profile?.level || 1}</p>
        </div>
      </div>

      {/* Cenários Disponíveis */}
      <section className="scenarios-section">
        <h2>🎮 Escolha um Cenário</h2>
        <div className="scenarios-grid">
          {/* Cenário 1 */}
          <div className="scenario-card scenario-1">
            <div className="scenario-badge">Cenário 1</div>
            <h3>O Testemunho</h3>
            <p className="scenario-context">Contexto Escolar</p>
            <p className="scenario-description">
              Você é testemunha de um incidente de bullying na escola. Como você reage?
            </p>
            <div className="scenario-difficulty">
              <span className="difficulty-level">Dificuldade: Média</span>
            </div>
            <Link to="/game/scenario_1" className="button button-primary">
              Iniciar Cenário 1
            </Link>
          </div>

          {/* Cenário 2 */}
          <div className="scenario-card scenario-2">
            <div className="scenario-badge">Cenário 2</div>
            <h3>A Perspetiva</h3>
            <p className="scenario-context">Contexto Digital</p>
            <p className="scenario-description">
              Você é um membro de um grupo de chat onde cyberbullying está acontecendo.
            </p>
            <div className="scenario-difficulty">
              <span className="difficulty-level">Dificuldade: Alta</span>
            </div>
            <Link to="/game/scenario_2" className="button button-primary">
              Iniciar Cenário 2
            </Link>
          </div>
        </div>
      </section>

      {/* Badges */}
      {gamification?.badges && gamification.badges.length > 0 && (
        <section className="badges-section">
          <h2>🏆 Tuas Conquistas</h2>
          <div className="badges-list">
            {gamification.badges.map((badge) => (
              <div key={badge.id} className="badge-item">
                <span className="badge-icon">🏅</span>
                <div className="badge-info">
                  <p className="badge-name">{badge.name}</p>
                  <p className="badge-date">
                    {new Date(badge.awarded_at).toLocaleDateString('pt-PT')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
