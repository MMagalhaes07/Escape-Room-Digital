/**
 * SceneRenderer Component
 * Renderiza a cena/narrativa atual do jogo
 */
import React, { useEffect } from 'react';
import { useGameStore } from '../store/index.js';
import './GameComponents.css';

export default function SceneRenderer({ onChoiceSelected }) {
  const { gameState, scenarioNarrative } = useGameStore();

  if (!gameState || !scenarioNarrative) {
    return <div className="scene-loading">Carregando cenário...</div>;
  }

  // Obter cena atual
  const currentScene = scenarioNarrative.scenes[gameState.currentScene];

  if (!currentScene) {
    return <div className="scene-error">Erro ao carregar cena</div>;
  }

  return (
    <div className="scene-container">
      {/* Header da cena */}
      <div className="scene-header">
        <h2>{currentScene.title}</h2>
        <div className="scene-location">{currentScene.location}</div>
      </div>

      {/* Descrição/Narrativa da cena */}
      <div className="scene-content">
        <p className="narrative-text">{currentScene.narrative}</p>

        {/* Imagem/contexto visual (placeholder) */}
        {currentScene.visual && (
          <div className="scene-visual">
            <img src={currentScene.visual} alt={currentScene.title} />
          </div>
        )}

        {/* Contexto emocional */}
        {currentScene.context && (
          <div className="scene-context">
            <strong>Contexto:</strong>
            <p>{currentScene.context}</p>
          </div>
        )}
      </div>

      {/* Exibir escolhas disponíveis */}
      <div className="scene-choices">
        <p className="choices-label">O que faz?</p>
        <div className="choices-list">
          {currentScene.choices && currentScene.choices.map((choice, idx) => (
            <button
              key={idx}
              className="choice-button"
              onClick={() => onChoiceSelected(idx, choice)}
              title={`Consequência: Empatia ${choice.empathyScore > 0 ? '+' : ''}${choice.empathyScore}`}
            >
              <span className="choice-text">{choice.text}</span>
              <span className="choice-consequence">
                Empatia: {choice.empathyScore > 0 ? '+' : ''}{choice.empathyScore}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Indicador de progresso */}
      <div className="scene-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((gameState.currentScene + 1) / (scenarioNarrative.scenes.length)) * 100}%`
            }}
          ></div>
        </div>
        <span className="progress-text">
          Cena {gameState.currentScene + 1} de {scenarioNarrative.scenes.length}
        </span>
      </div>
    </div>
  );
}
