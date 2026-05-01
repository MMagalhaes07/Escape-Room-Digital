/**
 * GamePage Component
 * Página principal do jogo - renderiza os cenários
 */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore, useGameStore, useUIStore } from "../store/index.js";
import { API } from "../services/api.js";
import "./GamePage.css";

import SceneRenderer from "../components/SceneRenderer.jsx";
import ChoiceButtons from "../components/ChoiceButtons.jsx";
import Inventory from "../components/Inventory.jsx";
import PuzzleInterface from "../components/PuzzleInterface.jsx";
import SessionMetrics from "../components/SessionMetrics.jsx";
import NarrativeStateDisplay from "../components/NarrativeStateDisplay.jsx";

export default function GamePage() {
  const { scenario } = useParams();
  const navigate = useNavigate();
  const {
    startSession,
    updateGameState,
    endSession,
    scenarioNarrative,
    gameState,
  } = useGameStore();
  const { user } = useAuthStore();
  const { showNotification } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [lastConsequence, setLastConsequence] = useState(null);
  const [finishing, setFinishing] = useState(false);
  const [sessionEnd, setSessionEnd] = useState(null);
  const [lastConsequenceSceneId, setLastConsequenceSceneId] = useState(null);

  useEffect(() => {
    initializeGame();
  }, [scenario]);

  const initializeGame = async () => {
    try {
      setLoading(true);
      setLastConsequence(null);
      setLastConsequenceSceneId(null);
      setSessionEnd(null);
      const response = await API.game.startSession(user.id, scenario);
      const session = response.data.session;
      const narrative = session?.narrative;

      startSession(session, narrative);
      setLoading(false);
    } catch (error) {
      showNotification("Erro ao iniciar jogo", "error");
      navigate("/dashboard");
    }
  };

  const currentSceneId =
    gameState?.current_scene ||
    gameState?.currentScene ||
    scenarioNarrative?.initialScene;
  const currentScene = currentSceneId
    ? scenarioNarrative?.scenes?.[currentSceneId]
    : null;
  const currentChoices = currentScene?.choices || [];
  const isTerminalScene = !!currentScene && currentChoices.length === 0;
  const currentPuzzleId = currentScene?.puzzle || null;
  const currentPuzzle =
    currentPuzzleId && scenarioNarrative?.puzzles
      ? scenarioNarrative.puzzles.find((p) => p.id === currentPuzzleId)
      : null;

  // Limpar banner ao mudar de cena (evita "consequência" ficar presa)
  useEffect(() => {
    if (!currentSceneId) return;
    if (
      lastConsequence &&
      lastConsequenceSceneId &&
      lastConsequenceSceneId !== currentSceneId
    ) {
      setLastConsequence(null);
      setLastConsequenceSceneId(null);
    }
  }, [currentSceneId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss do banner
  useEffect(() => {
    if (!lastConsequence) return;
    const t = setTimeout(() => {
      setLastConsequence(null);
      setLastConsequenceSceneId(null);
    }, 6000);
    return () => clearTimeout(t);
  }, [lastConsequence]);

  const handleChoiceSelected = async (choice) => {
    if (!user?.id || !gameState?.sessionId || !currentSceneId) return;

    setActing(true);
    try {
      const resp = await API.game.recordDecision(
        gameState.sessionId,
        user.id,
        currentSceneId,
        choice.text,
      );

      if (!resp.data?.success) {
        showNotification("Não foi possível registar a decisão", "error");
        return;
      }

      setLastConsequence(resp.data.consequence || null);
      setLastConsequenceSceneId(currentSceneId);
      updateGameState({
        current_scene: resp.data.nextScene,
        choices_made: (gameState.choices_made || []).concat({
          sceneId: currentSceneId,
          choiceText: choice.text,
          empathyScore: choice.empathyScore,
          timestamp: Date.now(),
        }),
        scores: {
          ...(gameState.scores || {}),
          empathy: resp.data.currentEmpathy ?? gameState?.scores?.empathy ?? 0,
        },
      });
    } catch (e) {
      showNotification("Erro ao processar decisão", "error");
    } finally {
      setActing(false);
    }
  };

  const handlePuzzleSolved = (points) => {
    updateGameState({
      puzzles_solved: Array.from(
        new Set([...(gameState.puzzles_solved || []), currentPuzzleId]),
      ),
    });
  };

  const handleFinishSession = async () => {
    if (!user?.id || !gameState?.sessionId || !currentSceneId) return;

    setFinishing(true);
    try {
      const resp = await API.game.finishSession(
        gameState.sessionId,
        user.id,
        currentSceneId,
      );
      if (!resp.data?.success) {
        showNotification("Erro ao finalizar sessão", "error");
        return;
      }
      setSessionEnd(resp.data);
      showNotification("Sessão finalizada com sucesso", "success");
    } catch (e) {
      showNotification("Erro ao finalizar sessão", "error");
    } finally {
      setFinishing(false);
    }
  };

  if (loading) {
    return (
      <div className="game-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (sessionEnd?.sessionSummary) {
    const summary = sessionEnd.sessionSummary;
    const feedback = sessionEnd.pedagogicalFeedback;

    return (
      <div className="game-container">
        <div className="game-end">
          <div className="game-end-card">
            <h1>🏁 Sessão Concluída</h1>

            <div className="game-end-summary">
              <div className="game-end-stat">
                <span>Duração</span>
                <strong>{summary.duration}s</strong>
              </div>
              <div className="game-end-stat">
                <span>Decisões</span>
                <strong>{summary.choicesMade}</strong>
              </div>
              <div className="game-end-stat">
                <span>Puzzles</span>
                <strong>{summary.puzzlesSolved}</strong>
              </div>
              <div className="game-end-stat">
                <span>Pistas</span>
                <strong>{summary.cluesFound}</strong>
              </div>
              <div className="game-end-stat">
                <span>Empatia</span>
                <strong>{summary.empathyScore}</strong>
              </div>
            </div>

            <div className="game-end-ending">
              <h3>{summary.finalEnding}</h3>
              <p>{summary.endingMessage}</p>
            </div>

            {feedback && (
              <div className="game-end-feedback">
                {feedback.empathyReflection && (
                  <div className="game-end-block">
                    <h4>Reflexão</h4>
                    <p>{feedback.empathyReflection}</p>
                  </div>
                )}

                {!!feedback.keyLearnings?.length && (
                  <div className="game-end-block">
                    <h4>Aprendizagens-chave</h4>
                    <ul>
                      {feedback.keyLearnings.map((k, i) => (
                        <li key={i}>{k}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {!!feedback.strategiesForIntervention?.length && (
                  <div className="game-end-block">
                    <h4>Estratégias</h4>
                    <ul>
                      {feedback.strategiesForIntervention.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {!!feedback.nextSteps?.length && (
                  <div className="game-end-block">
                    <h4>Próximos passos</h4>
                    <ul>
                      {feedback.nextSteps.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="game-end-actions">
              <button
                className="button button-secondary"
                onClick={() => {
                  endSession();
                  navigate("/dashboard");
                }}
              >
                Voltar ao Dashboard
              </button>
              <button
                className="button button-primary"
                onClick={initializeGame}
              >
                Jogar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const consequenceTone =
    lastConsequence?.impact === "positive"
      ? "positive"
      : lastConsequence?.impact === "negative"
        ? "negative"
        : lastConsequence
          ? "neutral"
          : null;

  return (
    <div className="game-container">
      <div className="game-layout">
        <div className="game-main">
          <div className="game-topbar">
            <div className="game-title">
              <h1>{scenarioNarrative?.title || "🎮 Escape Room Digital"}</h1>
              {scenarioNarrative?.description && (
                <p className="game-subtitle">{scenarioNarrative.description}</p>
              )}
            </div>

            <div className="game-actions">
              {(acting || finishing) && (
                <div className="game-status" aria-live="polite">
                  <span className="game-status-dot" />
                  <span className="game-status-text">
                    {finishing ? "A finalizar…" : "A guardar…"}
                  </span>
                </div>
              )}
              <button
                className="button button-secondary"
                onClick={() => {
                  endSession();
                  navigate("/dashboard");
                }}
              >
                Sair
              </button>
            </div>
          </div>

          <SessionMetrics />

          <NarrativeStateDisplay
            scenario={scenario}
            currentState={currentScene}
          />

          <SceneRenderer />

          {lastConsequence && (
            <div className={`consequence-banner ${consequenceTone || ""}`}>
              <div className="consequence-title">Conseqüência</div>
              <div className="consequence-text">{lastConsequence.text}</div>
              {lastConsequence.risk_level && (
                <div className="consequence-meta">
                  Risco: {lastConsequence.risk_level}
                </div>
              )}
            </div>
          )}

          <ChoiceButtons
            choices={currentChoices}
            disabled={acting}
            onSelect={handleChoiceSelected}
          />

          {currentPuzzleId && currentPuzzle && (
            <PuzzleInterface
              puzzleId={currentPuzzleId}
              puzzleData={currentPuzzle}
              onSolved={handlePuzzleSolved}
            />
          )}

          {isTerminalScene && (
            <div className="game-finish">
              <h3>Fim desta narrativa</h3>
              <p>
                Quando estiver pronto, finalize a sessão para ver o resumo e o
                feedback pedagógico.
              </p>
              <button
                className="button button-primary"
                onClick={handleFinishSession}
                disabled={finishing || acting}
              >
                {finishing ? "Finalizando..." : "Finalizar sessão"}
              </button>
            </div>
          )}
        </div>

        <aside className="game-aside">
          <Inventory />
        </aside>
      </div>
    </div>
  );
}
