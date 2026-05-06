/**
 * GamePlayPage.jsx
 *
 * Página principal de jogo
 * Orquestra o fluxo completo:
 * 1. Inicializa sessão
 * 2. Carrega cena inicial
 * 3. Renderiza cena + escolhas
 * 4. Se puzzle: renderiza interface de puzzle
 * 5. Ao chegar ao final: renderiza GameCompletion
 * 6. Exporta CSV
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useGameStore } from "@/store/gameStore";
import { usePlayerStore } from "@/store/playerStore";
import { useUIStore } from "@/store/uiStore";
import { API } from "@/services/api";

// Components
import SceneRenderer from "@/components/game/SceneRenderer";
import ChoiceButtons from "@/components/game/ChoiceButtons";
import Inventory from "@/components/game/Inventory";
import PuzzleInterface from "@/components/game/PuzzleInterface";
import SessionMetrics from "@/components/game/SessionMetrics";
import GameCompletion from "@/components/game/GameCompletion";

const GamePlayPage = () => {
  const { scenarioId } = useParams();
  const navigate = useNavigate();

  // Stores
  const user = useAuthStore((state) => state.user);
  const gameStore = useGameStore();
  const playerStore = usePlayerStore();
  const uiStore = useUIStore();

  // Local state
  const [currentSceneData, setCurrentSceneData] = useState(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [sessionResults, setSessionResults] = useState(null);
  const [showPuzzle, setShowPuzzle] = useState(false);

  /**
   * Fase 1: Inicializar sessão ao montar componente
   */
  useEffect(() => {
    if (!user || !scenarioId) {
      navigate("/login");
      return;
    }

    initializeGame();
  }, [user, scenarioId]);

  /**
   * Inicializar jogo
   */
  const initializeGame = async () => {
    try {
      uiStore.setLoading(true, "Iniciando jogo...");

      // 1. Carregar perfil de gamificação
      await playerStore.loadProfile(user.id);

      // 2. Iniciar sessão de jogo
      const response = await gameStore.startSession(scenarioId, user.id);

      // 3. Carregar cena inicial
      if (response.session?.sessionId) {
        const startNode = await API.narratives.getStart(
          scenarioId,
          response.session.sessionId,
        );

        setCurrentSceneData(startNode.data);

        uiStore.showSuccess("🎮 Jogo iniciado! Boa sorte!");
      }

      uiStore.setLoading(false);
    } catch (error) {
      uiStore.showError(
        error.response?.data?.error || "Erro ao iniciar jogo. Tente novamente.",
      );
      console.error("Erro ao inicializar jogo:", error);
      setTimeout(() => navigate("/student/scenarios"), 2000);
    }
  };

  /**
   * Handler: Fazer uma escolha
   */
  const handleChoiceSelect = async (choiceIndex) => {
    if (!currentSceneData || !gameStore.sessionId) {
      uiStore.showError("Sessão inválida");
      return;
    }

    try {
      uiStore.setLoading(true, "Processando escolha...");

      const response = await gameStore.makeDecision(
        currentSceneData.node.id,
        choiceIndex.toString(),
      );

      // Atualizar empatia do player baseado na escolha
      const empathyDelta = response.data?.metrics?.empathyGained || 0;
      playerStore.updateEmpathy(empathyDelta);
      playerStore.updateScore(Math.abs(empathyDelta) * 10);

      // Carregar próxima cena
      const nextNode = response.data?.nextNode;
      setCurrentSceneData(nextNode);

      // Verificar se é nó final
      if (
        nextNode?.tags?.includes("ending") ||
        nextNode?.tags?.includes("final")
      ) {
        await handleGameEnd();
      }

      // Se tem puzzle, preparar
      if (nextNode?.puzzle) {
        setShowPuzzle(true);
      }

      uiStore.setLoading(false);
      uiStore.showSuccess("✓ Escolha registada!", "success", 2000);
    } catch (error) {
      uiStore.showError(
        error.response?.data?.error || "Erro ao processar escolha",
      );
      uiStore.setLoading(false);
    }
  };

  /**
   * Handler: Resolver puzzle
   */
  const handlePuzzleSolve = async (answer) => {
    if (!currentSceneData?.puzzle || !gameStore.sessionId) {
      return;
    }

    try {
      uiStore.setLoading(true, "Verificando resposta...");

      const response = await gameStore.solvePuzzle(
        currentSceneData.puzzle.id,
        answer,
      );

      if (response.success) {
        const score = response.data?.score || 50;
        playerStore.updateScore(score);
        playerStore.addBadge({
          id: `puzzle_${currentSceneData.puzzle.id}`,
          name: `Puzzle: ${currentSceneData.puzzle.title}`,
          description: `Resolveste ${currentSceneData.puzzle.title}`,
        });

        uiStore.showSuccess("🎉 Puzzle resolvido!", "success", 3000);

        // Fechar puzzle após 2s
        setTimeout(() => {
          setShowPuzzle(false);
        }, 2000);
      } else {
        uiStore.showWarning(
          "Resposta incorreta. Tenta de novo!",
          "warning",
          3000,
        );
      }

      uiStore.setLoading(false);
    } catch (error) {
      uiStore.showError("Erro ao resolver puzzle");
      uiStore.setLoading(false);
    }
  };

  /**
   * Handler: Terminar jogo
   */
  const handleGameEnd = async () => {
    try {
      const finishResult = await gameStore.finishSession();

      // Determinar tipo de final baseado em empatia
      let finalType = "neutral";
      const empathy = gameStore.gameState?.total_empathy || 50;

      if (empathy >= 60) {
        finalType = "positive";
        playerStore.addBadge({
          id: "empath_master",
          name: "Mestre da Empatia",
          description: "Completaste um cenário com alta empatia",
        });
      } else if (empathy < 30) {
        finalType = "negative";
      }

      // Registar conclusão
      playerStore.completeScenario({
        scenarioId,
        finalType,
        empathy,
        score: gameStore.gameState?.total_empathy || 0,
      });

      // Preparar resultados
      const results = {
        scenario: scenarioId,
        finalType,
        empathy,
        score: gameStore.gameState?.total_empathy || 0,
        time: Date.now() - gameStore.sessionStartTime,
        choices: gameStore.gameState?.choices_made || [],
        puzzles: gameStore.gameState?.puzzles_solved || {},
        sessionId: gameStore.sessionId,
      };

      setSessionResults(results);
      setGameEnded(true);

      playerStore.loadLeaderboard();
    } catch (error) {
      uiStore.showError("Erro ao finalizar jogo");
      console.error("Erro ao terminar jogo:", error);
    }
  };

  /**
   * Handler: Exportar CSV
   */
  const handleExportCSV = async () => {
    try {
      const blob = await API.metrics.exportCSV(gameStore.sessionId);
      return blob;
    } catch (error) {
      uiStore.showError("Erro ao exportar CSV");
      throw error;
    }
  };

  /**
   * Handler: Voltar ao dashboard
   */
  const handleRestart = () => {
    gameStore.resetSession();
    navigate("/student/dashboard");
  };

  // === RENDER ===

  // Loading
  if (uiStore.isLoading && !currentSceneData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">{uiStore.loadingMessage}</p>
        </div>
      </div>
    );
  }

  // Game completed - show summary
  if (gameEnded && sessionResults) {
    return (
      <GameCompletion
        sessionResults={sessionResults}
        onExport={handleExportCSV}
        onRestart={handleRestart}
      />
    );
  }

  // Game in progress
  if (currentSceneData) {
    return (
      <div className="min-h-screen bg-slate-100">
        {/* Metrics HUD */}
        <SessionMetrics
          metrics={{
            empathy: gameStore.gameState?.total_empathy || 50,
            score: gameStore.gameState?.choices_made?.length || 0,
            decisionsCount: gameStore.gameState?.choices_made?.length || 0,
            puzzlesCount: gameStore.gameState?.puzzles_solved?.length || 0,
            puzzlesTotal: 5, // TODO: Get from scenario metadata
          }}
          sessionData={{
            startTime: gameStore.sessionStartTime,
          }}
        />

        {/* Main content area with padding for HUD */}
        <div className="pt-48 pb-80">
          <div className="max-w-4xl mx-auto px-4">
            {/* Scene Renderer */}
            <SceneRenderer
              sceneData={currentSceneData.node}
              inventory={gameStore.inventory}
              isLoading={uiStore.isLoading}
            />

            {/* Puzzle Interface (if scene has puzzle) */}
            {showPuzzle && currentSceneData.node.puzzle && (
              <PuzzleInterface
                puzzleData={currentSceneData.node.puzzle}
                onSubmit={handlePuzzleSolve}
                sessionId={gameStore.sessionId}
                isLoading={uiStore.isLoading}
              />
            )}

            {/* Inventory section */}
            {gameStore.inventory.length > 0 && (
              <div className="mt-8 mb-8">
                <Inventory items={gameStore.inventory} />
              </div>
            )}
          </div>
        </div>

        {/* Choice Buttons */}
        <ChoiceButtons
          choices={currentSceneData.choices || []}
          onSelect={handleChoiceSelect}
          disabled={uiStore.isLoading}
          gameState={gameStore.gameState}
        />
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center text-white">
        <p className="text-xl mb-4">Erro ao carregar jogo</p>
        <button
          onClick={() => navigate("/student/scenarios")}
          className="px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Voltar aos Cenários
        </button>
      </div>
    </div>
  );
};

export default GamePlayPage;
