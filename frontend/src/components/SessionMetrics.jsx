/**
 * SessionMetrics Component
 * Exibe métricas da sessão atual durante o jogo
 */
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/index.js';
import { FiHeart, FiClock, FiTarget } from 'react-icons/fi';
import './GameComponents.css';

export default function SessionMetrics() {
  const { gameState } = useGameStore();
  const [elapsedTime, setElapsedTime] = useState(0);

  // Atualizar tempo decorrido
  useEffect(() => {
    if (!gameState?.startTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - gameState.startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState?.startTime]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcular score de empatia (0-100)
  const empathyScore = gameState?.scores?.empathy ?? gameState?.total_empathy ?? 0;
  const empathyLevel = empathyScore >= 75 ? 'Alto' : empathyScore >= 50 ? 'Médio' : 'Baixo';
  const empathyColor =
    empathyScore >= 75
      ? 'var(--empathy-high)'
      : empathyScore >= 50
      ? 'var(--empathy-medium)'
      : 'var(--empathy-low)';

  return (
    <div className="session-metrics">
      <div className="metrics-header">
        <h4>📊 Sessão</h4>
      </div>

      <div className="metrics-grid">
        {/* Empatia */}
        <div className="metric-item">
          <div className="metric-icon" style={{ color: empathyColor }}>
            <FiHeart size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Empatia</span>
            <div className="metric-value">{empathyScore}/100</div>
            <div className="metric-level">{empathyLevel}</div>
            <div className="metric-bar">
              <div
                className="metric-fill"
                style={{
                  width: `${empathyScore}%`,
                  backgroundColor: empathyColor
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tempo */}
        <div className="metric-item">
          <div className="metric-icon">
            <FiClock size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Tempo</span>
            <div className="metric-value">{formatTime(elapsedTime)}</div>
          </div>
        </div>

        {/* Decisões */}
        <div className="metric-item">
          <div className="metric-icon">
            <FiTarget size={20} />
          </div>
          <div className="metric-content">
            <span className="metric-label">Decisões</span>
            <div className="metric-value">{gameState?.choices_made?.length || 0}</div>
          </div>
        </div>
      </div>

      {/* Progresso de Pistas */}
      {gameState?.inventory && gameState.inventory.length > 0 && (
        <div className="metrics-clues">
          <span className="clue-label">Pistas:</span>
          <div className="clues-icons">
            {gameState.inventory.map((clue, idx) => (
              <div key={idx} className="clue-icon" title={clue.name}>
                📌
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
