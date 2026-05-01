/**
 * SceneRenderer Component
 * Renderiza a cena/narrativa atual do jogo
 */
import React, { useEffect } from "react";
import { useGameStore } from "../store/index.js";
import { parseMarkdown } from "../utils/markdownParser.js";
import "./GameComponents.css";

export default function SceneRenderer() {
  const { gameState, scenarioNarrative } = useGameStore();

  if (!gameState || !scenarioNarrative) {
    return <div className="scene-loading">Carregando cenário...</div>;
  }

  // Obter cena atual
  const currentSceneId =
    gameState.current_scene ||
    gameState.currentScene ||
    scenarioNarrative.initialScene;
  const currentScene = scenarioNarrative.scenes?.[currentSceneId];

  if (!currentScene) {
    return <div className="scene-error">Erro ao carregar cena</div>;
  }

  // Parse narrative text for markdown formatting
  const renderNarrativeContent = () => {
    const text = currentScene.text;
    if (!text) return null;

    // Split by lines and render with markdown formatting
    const lines = text.split("\n").filter((line) => line.trim());

    return lines.map((line, idx) => {
      // Check for headers
      if (line.startsWith("# ")) {
        return (
          <h3 key={idx} className="narrative-heading">
            {line.replace(/^# /, "")}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h4 key={idx} className="narrative-subheading">
            {line.replace(/^## /, "")}
          </h4>
        );
      }
      if (line.startsWith("- ")) {
        // List item
        return (
          <li
            key={idx}
            dangerouslySetInnerHTML={{
              __html: parseMarkdown(line.replace(/^- /, "")),
            }}
          />
        );
      }
      // Regular paragraph with markdown formatting
      return (
        <p
          key={idx}
          className="narrative-text"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(line) }}
        />
      );
    });
  };

  return (
    <div className="scene-container">
      {/* Header da cena */}
      <div className="scene-header">
        <h2>{currentScene.title}</h2>
        {currentScene.location && (
          <div className="scene-location">{currentScene.location}</div>
        )}
      </div>

      {/* Descrição/Narrativa da cena */}
      <div className="scene-content">
        {renderNarrativeContent()}

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

      {/* Indicador de progresso */}
      <div className="scene-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.max(
                5,
                Math.min(
                  100,
                  ((gameState.choices_made?.length || 0) /
                    Math.max(
                      1,
                      Object.keys(scenarioNarrative.scenes || {}).length,
                    )) *
                    100,
                ),
              )}%`,
            }}
          ></div>
        </div>
        <span className="progress-text">Cena: {currentSceneId}</span>
      </div>
    </div>
  );
}
