/**
 * Game Play Page - Main game interface
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Alert, LoadingSpinner, Modal } from "@/components/ui";
import { useGame } from "@/hooks/useAPI";
import { useAuthStore } from "@/store/authStore";
import { Volume2, VolumeX } from "lucide-react";

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
      startSession(user.id, scenarioId).then((data) => {
        setSessionData(data.session);
        setCurrentScene(
          data.session.narrative.scenes[data.session.narrative.initialScene],
        );
      });
    }
  }, [user, scenarioId]);

  const handleChoice = async (choiceId, choice) => {
    try {
      const result = await recordDecision(
        sessionData.id,
        currentScene.id,
        choiceId,
        choice.text,
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
      console.error("Failed to record decision:", error);
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
            <div className="text-sm text-[var(--text-secondary)]">Progress</div>
            <div className="text-lg font-bold">
              {sessionData.sceneCount} / {sessionData.totalScenes}
            </div>
          </div>
          <div>
            <div className="text-sm text-[var(--text-secondary)]">Points</div>
            <div className="text-lg font-bold text-[var(--accent-blue)]">
              +{sessionData.points}
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
            Exit Game
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

        {/* Scene Content */}
        <div className="mb-8">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">
            {currentScene.text}
          </p>

          {currentScene.narrative && (
            <div className="mt-4 p-4 bg-[var(--bg-tertiary)] rounded-lg italic">
              "{currentScene.narrative}"
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
                placeholder="Enter your answer..."
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
                Submit Answer
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
              💡 Get a Clue
            </Button>
          </div>
        )}

        {currentScene.clueDiscovered && currentScene.clue && (
          <Alert type="info">
            <strong>Clue:</strong> {currentScene.clue}
          </Alert>
        )}

        {/* Choices Section */}
        {currentScene.choices && currentScene.choices.length > 0 && (
          <div className="space-y-3">
            <p className="font-semibold text-[var(--text-secondary)]">
              What do you do?
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
            <h3 className="font-bold mb-2">Scenario Complete! 🎉</h3>
            <p>
              You've reached the end of this scenario. Check your badges and
              progress!
            </p>
          </Alert>
        )}
      </Card>

      {/* Exit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Exit Game?"
        size="sm"
      >
        <div className="space-y-4">
          <p>Are you sure you want to exit? Your progress will be saved.</p>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowModal(false)}
              variant="secondary"
              className="flex-1"
            >
              Continue Playing
            </Button>
            <Button
              onClick={handleFinishGame}
              variant="primary"
              className="flex-1"
            >
              Exit & Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
