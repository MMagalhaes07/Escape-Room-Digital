/**
 * PuzzleInterface Component
 * Interface para resolver puzzles durante o jogo
 */
import React, { useState } from 'react';
import { useAuthStore, useGameStore, useUIStore } from '../store/index.js';
import { API } from '../services/api.js';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './GameComponents.css';

export default function PuzzleInterface({ puzzleId, puzzleData, onSolved }) {
  const { gameState } = useGameStore();
  const { user } = useAuthStore();
  const { showNotification } = useUIStore();
  const [solving, setSolving] = useState(false);
  const [solved, setSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [answer, setAnswer] = useState('');

  const handleSubmitAnswer = async () => {
    setSolving(true);
    setAttempts(attempts + 1);

    try {
      const response = await API.game.completePuzzle(
        gameState.sessionId,
        user?.id,
        puzzleId,
        answer
      );

      if (response.data.success) {
        setSolved(true);
        showNotification(`Puzzle resolvido! +${response.data.points || 50} pontos`, 'success');
        onSolved?.(response.data.points);
      } else {
        showNotification(
          `Resposta incorreta. Tentativas: ${attempts + 1}`,
          'error'
        );
      }
    } catch (error) {
      showNotification('Erro ao processar resposta', 'error');
    } finally {
      setSolving(false);
    }
  };

  if (!puzzleData) return null;

  if (solved) {
    return (
      <div className="puzzle-solved">
        <FiCheckCircle size={48} className="puzzle-icon-success" />
        <h3>Puzzle Resolvido!</h3>
        <p>Continuando...</p>
      </div>
    );
  }

  return (
    <div className="puzzle-container">
      <div className="puzzle-header">
        <h3>{puzzleData.title}</h3>
        {(puzzleData.difficulty || puzzleData.type) && (
          <span className="puzzle-difficulty">{puzzleData.difficulty || puzzleData.type}</span>
        )}
      </div>

      <div className="puzzle-content">
        <p className="puzzle-description">{puzzleData.description}</p>

        <div className="puzzle-input">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Escreve a tua resposta…"
            disabled={solving}
          />
        </div>

        {/* Hints */}
        {puzzleData.hint && (
          <div className="puzzle-hint">
            <strong>Dica:</strong> {puzzleData.hint}
          </div>
        )}

        {/* Tentativas */}
        <div className="puzzle-attempts">
          <span>Tentativas: {attempts}</span>
        </div>
      </div>

      <div className="puzzle-actions">
        <button
          className="button button-primary"
          onClick={handleSubmitAnswer}
          disabled={solving || !answer || !gameState?.sessionId || !user?.id}
        >
          {solving ? 'Processando...' : 'Enviar Resposta'}
        </button>
      </div>
    </div>
  );
}
