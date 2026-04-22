/**
 * PuzzleInterface Component
 * Interface para resolver puzzles durante o jogo
 */
import React, { useState } from 'react';
import { useGameStore, useUIStore } from '../store/index.js';
import { API } from '../services/api.js';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './GameComponents.css';

export default function PuzzleInterface({ puzzleId, puzzleData, onSolved }) {
  const { gameState } = useGameStore();
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
        puzzleId,
        answer
      );

      if (response.data.success) {
        setSolved(true);
        showNotification('Puzzle resolvido! +25 pontos', 'success');
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
        <span className="puzzle-difficulty">{puzzleData.difficulty}</span>
      </div>

      <div className="puzzle-content">
        <p className="puzzle-description">{puzzleData.description}</p>

        {/* Renderizar tipo de puzzle diferente */}
        {puzzleData.type === 'text_input' && (
          <div className="puzzle-input">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={puzzleData.inputPlaceholder}
              disabled={solving}
            />
          </div>
        )}

        {puzzleData.type === 'multiple_choice' && (
          <div className="puzzle-choices">
            {puzzleData.options.map((option, idx) => (
              <button
                key={idx}
                className={`puzzle-choice ${answer === option ? 'selected' : ''}`}
                onClick={() => setAnswer(option)}
                disabled={solving}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {puzzleData.type === 'ordering' && (
          <div className="puzzle-ordering">
            <p className="puzzle-instruction">{puzzleData.instruction}</p>
            {/* Implementar drag-and-drop para ordenação */}
            <div className="ordering-items">
              {puzzleData.items.map((item, idx) => (
                <div key={idx} className="ordering-item">
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hints */}
        {puzzleData.hint && (
          <div className="puzzle-hint">
            <strong>Dica:</strong> {puzzleData.hint}
          </div>
        )}

        {/* Tentativas */}
        <div className="puzzle-attempts">
          <span>Tentativas: {attempts}/{puzzleData.maxAttempts}</span>
        </div>
      </div>

      <div className="puzzle-actions">
        <button
          className="button button-primary"
          onClick={handleSubmitAnswer}
          disabled={solving || !answer}
        >
          {solving ? 'Processando...' : 'Enviar Resposta'}
        </button>
      </div>
    </div>
  );
}
