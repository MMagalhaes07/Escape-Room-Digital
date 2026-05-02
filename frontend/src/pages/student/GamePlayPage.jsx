/**
 * Game Play Page - Main game interface
 * Features: Scene narrative rendering with Markdown support, choice selection, puzzle solving, clue system
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Alert, LoadingSpinner, Modal } from "@/components/ui";
import { useGame } from "@/hooks/useAPI";
import { useAuthStore } from "@/store/authStore";
import { Volume2, VolumeX } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function GamePlayPage() {
  const { scenarioId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const {
    state: gameState,
    startSession,
    recordDecision,
    completePuzzle,
    discoverClue,
    finishSession,
  } = useGame();

  const [sessionData, setSessionData] = useState(null);
  const [currentScene, setCurrentScene] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [endingReached, setEndingReached] = useState(false);

  useEffect(() => {
    // Start game session
    if (user && scenarioId) {
      startSession(user.id, scenarioId)
        .then((data) => {
          setSessionData(data.session);
          setCurrentScene(
            data.session.narrative.scenes[data.session.narrative.initialScene],
          );
        })
        .catch((error) => {
          console.error("Failed to start game session:", error);
        });
    }
  }, [user, scenarioId]);

  const handleChoice = async (choiceId, choice) => {
    try {
      // Build proper payload with all required fields
      const payload = {
        sessionId: sessionData.id,
        sceneId: currentScene.id || currentScene.passageName,
        choiceId: choiceId,
        userAnswer: choice.text || choice,
      };

      const result = await recordDecision(
        payload.sessionId,
        payload.sceneId,
        payload.choiceId,
        payload.userAnswer,
      );

      // Update game state
      setSessionData(result.session);

      if (result.nextScene) {
        setCurrentScene(result.nextScene);
      }

      if (result.isEnding) {
        setEndingReached(true);
      }
    } catch (error) {
      console.error("Failed to record decision - Error:", error);
      // Show user-friendly error message
      alert("Erro ao processar sua escolha. Tente novamente.");
    }
  };

  const handlePuzzleComplete = async (solution) => {
    try {
      const result = await completePuzzle(
        sessionData.id,
        currentScene.puzzleId,
        solution,
      );
      setSessionData(result.session);
      // Move to next scene
      if (result.nextScene) {
        setCurrentScene(result.nextScene);
      }
    } catch (error) {
      console.error("Failed to complete puzzle:", error);
    }
  };

  const handleClueRequest = async () => {
    try {
      const result = await discoverClue(sessionData.id, currentScene.id);
      setCurrentScene({
        ...currentScene,
        clueDiscovered: true,
        clue: result.clue,
      });
    } catch (error) {
      console.error("Failed to get clue:", error);
    }
  };

  const handleFinishGame = async () => {
    try {
      const result = await finishSession(sessionData.id);
      setShowModal(false);
      // Redirect with summary
      setTimeout(() => {
        navigate("/student/scenarios", {
          state: { gameSummary: result.summary },
        });
      }, 1500);
    } catch (error) {
      console.error("Failed to finish session:", error);
    }
  };

  if (!currentScene || !sessionData) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--bg-tertiary)]">
        <div className="flex gap-4">
          <div>
            <div className="text-sm text-[var(--text-secondary)]">
              Progresso
            </div>
            <div className="text-lg font-bold">
              {sessionData.history.length} /{" "}
              {Object.keys(sessionData.narrative.scenes).length}
            </div>
          </div>
          <div>
            <div className="text-sm text-[var(--text-secondary)]">Pontos</div>
            <div className="text-lg font-bold text-[var(--accent-blue)]">
              +{sessionData.scores.empathy}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
          <Button variant="secondary" onClick={() => setShowModal(true)}>
            Sair do Jogo
          </Button>
        </div>
      </div>

      {/* Main Game Area */}
      <Card className="min-h-96">
        {/* Scene Title */}
        <div className="mb-6 pb-4 border-b border-[var(--bg-tertiary)]">
          <h2 className="text-3xl font-bold">{currentScene.title}</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            {currentScene.location}
          </p>
        </div>

        {/* Scene Content - With Markdown Rendering Support */}
        <div className="mb-8 prose dark:prose-invert max-w-none">
          {currentScene.text ? (
            <div className="prose-content">
              <ReactMarkdown className="text-lg leading-relaxed">
                {currentScene.text}
              </ReactMarkdown>
            </div>
          ) : null}

          {currentScene.narrative && (
            <div className="mt-4 p-4 bg-[var(--bg-tertiary)] rounded-lg italic border-l-4 border-[var(--accent-blue)]">
              <ReactMarkdown className="text-base">
                {currentScene.narrative}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Puzzle Section */}
        {currentScene.hasPuzzle && (
          <div className="mb-6 p-4 bg-yellow-100/20 border border-yellow-500/50 rounded-lg">
            <h3 className="font-bold mb-2">
              🧩 Puzzle: {currentScene.puzzle?.title}
            </h3>
            <p className="mb-4">{currentScene.puzzle?.description}</p>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Digite sua resposta..."
                className="input-field"
                id="puzzle-input"
              />
              <Button
                onClick={() => {
                  const answer = document.getElementById("puzzle-input")?.value;
                  handlePuzzleComplete(answer);
                }}
                variant="primary"
              >
                Enviar Resposta
              </Button>
            </div>
          </div>
        )}

        {/* Clue Section */}
        {currentScene.hasClues && !currentScene.clueDiscovered && (
          <div className="mb-6">
            <Button
              onClick={handleClueRequest}
              variant="ghost"
              className="text-[var(--accent-blue)]"
            >
              💡 Obter uma Pista
            </Button>
          </div>
        )}

        {currentScene.clueDiscovered && currentScene.clue && (
          <Alert type="info">
            <strong>Pista:</strong> {currentScene.clue}
          </Alert>
        )}

        {/* Choices Section */}
        {currentScene.choices && currentScene.choices.length > 0 && (
          <div className="space-y-3">
            <p className="font-semibold text-[var(--text-secondary)]">
              O que você faz?
            </p>
            {currentScene.choices.map((choice, i) => (
              <Button
                key={i}
                onClick={() => handleChoice(i, choice)}
                variant="secondary"
                className="w-full text-left justify-start"
              >
                {choice.text}
              </Button>
            ))}
          </div>
        )}

        {/* Ending Display */}
        {endingReached && (
          <Alert type="success">
            <h3 className="font-bold mb-2">Cenário Concluído! 🎉</h3>
            <p>
              Você chegou ao final deste cenário. Confira seus crachás e
              progresso!
            </p>
          </Alert>
        )}
      </Card>

      {/* Exit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Sair do Jogo?"
        size="sm"
      >
        <div className="space-y-4">
          <p>Tem certeza que deseja sair? Seu progresso será salvo.</p>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowModal(false)}
              variant="secondary"
              className="flex-1"
            >
              Continuar Jogando
            </Button>
            <Button
              onClick={handleFinishGame}
              variant="primary"
              className="flex-1"
            >
              Sair e Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
