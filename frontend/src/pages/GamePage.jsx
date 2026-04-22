/**
 * GamePage Component
 * Página principal do jogo - renderiza os cenários
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore, usePlayerStore, useUIStore } from '../store/index.js';
import { API } from '../services/api.js';
import './GamePage.css';

export default function GamePage() {
  const { scenario } = useParams();
  const navigate = useNavigate();
  const { startSession, updateGameState, endSession } = useGameStore();
  const { user } = useAuthStore();
  const { showNotification } = useUIStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeGame();
  }, [scenario]);

  const initializeGame = async () => {
    try {
      const response = await API.game.startSession(user.id, scenario);
      startSession(response.data.session, response.data.narrative);
      setLoading(false);
    } catch (error) {
      showNotification('Erro ao iniciar jogo', 'error');
      navigate('/dashboard');
    }
  };

  if (loading) {
    return <div className="game-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="game-container">
      <div className="game-content">
        <h1>🎮 Jogo em Desenvolvimento</h1>
        <p>
          A interface do jogo será renderizada aqui com a narrativa interativa,
          cenas, puzzles e sistema de decisões.
        </p>
        <p>Componentes a implementar:</p>
        <ul>
          <li>SceneRenderer - Renderiza a cena atual</li>
          <li>ChoiceButtons - Botões de decisão</li>
          <li>Inventory - Sistema de inventário</li>
          <li>PuzzleInterface - Interface de puzzles</li>
          <li>SessionMetrics - Acompanhamento de métricas</li>
        </ul>
        <button className="button button-primary" onClick={() => navigate('/dashboard')}>
          Voltar ao Dashboard
        </button>
      </div>
    </div>
  );
}

// Import necessário que falta
import { useAuthStore } from '../store/index.js';
