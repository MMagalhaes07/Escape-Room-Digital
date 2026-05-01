/**
 * CONTROLLER: GameController
 *
 * CAMADA 2: LÓGICA DE NEGÓCIO
 * - State Manager: Gerencia estado do jogo
 * - Decision Engine: Processa escolhas e suas consequências
 * - Narrative Engine: Carrega e gerencia narrativas em formato Twine
 *
 * Este controlador orquestra a lógica entre apresentação e dados
 * com suporte para narrativas dinâmicas em ficheiros Twine
 */
import GameSessionModel from "../models/GameSessionModel.js";
import GameDecisionModel from "../models/GameDecisionModel.js";
import GameMetricsModel from "../models/GameMetricsModel.js";
import GamificationModel from "../models/GamificationModel.js";
import NarrativeManager from "../utils/NarrativeManager.js";
import GameState from "../utils/StateManager.js";
import RealTimeManager from "../utils/RealTimeManager.js";
import path from "path";
import { fileURLToPath } from "url";

// Suporte para ESM __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Narrative Manager - Carrega narrativas de ficheiros Twine
 * Suporta hot-reloading em desenvolvimento
 */
const narrativeManager = new NarrativeManager(
  path.join(__dirname, "../../narratives"),
);

// Mapa de GameState por sessionId (em memória)
const gameStates = new Map();

// Mapa de RealTimeManager por sessionId (para Scenario 2)
const realTimeManagers = new Map();

export class GameController {
  /**
   * Inicializar narrativas (deve ser chamado uma vez no startup)
   */
  static async initialize() {
    try {
      const narratives = await narrativeManager.loadAllNarratives();
      console.log("✓ Narrativas Twine carregadas com sucesso");
      console.log(
        `  Cenários disponíveis: ${narrativeManager.listNarratives().join(", ")}`,
      );

      // Loggar estatísticas
      for (const scenarioId of narrativeManager.listNarratives()) {
        const stats = narrativeManager.getStats(scenarioId);
        console.log(
          `  ${scenarioId}: ${stats.sceneCount} cenas, ${stats.puzzleCount} puzzles`,
        );
      }

      return narratives;
    } catch (error) {
      console.error("✗ Erro ao carregar narrativas:", error.message);
      throw error;
    }
  }

  /**
   * Iniciar nova sessão de jogo
   */
  static async startSession(req, res) {
    try {
      const { userId, scenario } = req.body;

      if (!userId || !scenario) {
        return res
          .status(400)
          .json({ error: "userId and scenario are required" });
      }

      // Validar cenário
      const narrative = narrativeManager.getNarrative(scenario);
      if (!narrative) {
        return res
          .status(404)
          .json({ error: `Scenario "${scenario}" not found` });
      }

      // Criar sessão de jogo
      const session = await GameSessionModel.create(userId, scenario);

      // Inicializar GameState
      const gameState = new GameState();
      // Suportar múltiplos nomes de cenários
      const normalizedScenario = scenario.toLowerCase();
      if (
        normalizedScenario.includes("scenario_1") ||
        normalizedScenario.includes("echo") ||
        normalizedScenario.includes("school")
      ) {
        gameState.initializeScenario1();
      } else if (
        normalizedScenario.includes("scenario_2") ||
        normalizedScenario.includes("clout") ||
        normalizedScenario.includes("chat")
      ) {
        gameState.initializeScenario2();
      }

      // Guardar GameState na memória
      gameStates.set(session.id, gameState);

      // Se Scenario 2, inicializar RealTimeManager
      const normalizedScenario2 = scenario.toLowerCase();
      if (
        normalizedScenario2.includes("scenario_2") ||
        normalizedScenario2.includes("clout") ||
        normalizedScenario2.includes("chat")
      ) {
        const realTimeManager = new RealTimeManager(gameState);
        realTimeManager.startRealtimeMechanics();
        realTimeManagers.set(session.id, realTimeManager);
      }

      // Guardar em localStorage também
      gameState.saveToStorage();

      res.status(201).json({
        success: true,
        session: {
          sessionId: session.id,
          userId: session.user_id,
          scenario: session.scenario,
          state: gameState.variables,
          scores: gameState.scores,
          inventory: gameState.inventory,
          history: gameState.history,
          narrative: {
            title: narrative.title,
            description: narrative.description,
            initialScene: narrative.initialScene,
            scenes: narrative.scenes,
            puzzles: narrative.puzzles,
          },
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Processar ação em tempo real (Scenario 2)
   * Processa impactos imediatos de ações do jogador
   */
  static async processRealtimeAction(req, res) {
    try {
      const { sessionId, userId, actionType } = req.body;

      // Validar sessão
      const session = await GameSessionModel.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Obter RealTimeManager
      let realTimeManager = realTimeManagers.get(sessionId);
      if (!realTimeManager) {
        return res.status(400).json({
          error: "RealTimeManager not available for this session",
        });
      }

      // Obter GameState
      const gameState = gameStates.get(sessionId);
      if (!gameState) {
        return res.status(404).json({ error: "GameState not found" });
      }

      // Processar ação com RealTimeManager
      realTimeManager.processPlayerAction(actionType);

      // Registar ação no histórico
      gameState.recordDecision(`realtime_action_${actionType}`, actionType);

      res.json({
        success: true,
        action: actionType,
        gameState: {
          variables: gameState.variables,
          scores: gameState.scores,
        },
        diagnosis: realTimeManager.getDiagnosis(),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Processar decisão do jogador
   * DECISION ENGINE: calcula consequências e atualiza estado
   */
  static async recordDecision(req, res) {
    try {
      const { sessionId, userId, sceneId, choiceText } = req.body;

      // Validar entrada
      if (!sessionId || !userId || !sceneId || !choiceText) {
        return res
          .status(400)
          .json({
            error:
              "Missing required fields: sessionId, userId, sceneId, choiceText",
          });
      }

      // Validar sessão
      const session = await GameSessionModel.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Obter GameState
      let gameState = gameStates.get(sessionId);
      if (!gameState) {
        // Tentar recuperar de localStorage (para sessões que foram recarregadas)
        gameState = new GameState();
        if (gameState.loadFromStorage() === false) {
          return res.status(404).json({ error: "GameState not found" });
        }
        gameStates.set(sessionId, gameState);
      }

      // Obter narrativa e cena
      const narrative = narrativeManager.getNarrative(session.scenario);
      if (!narrative) {
        console.error(
          `Narrativa não encontrada para cenário: ${session.scenario}`,
        );
        return res
          .status(404)
          .json({ error: `Scenario "${session.scenario}" not found` });
      }

      const scene = narrative.scenes[sceneId];
      if (!scene) {
        console.error(
          `Cena não encontrada: ${sceneId} no cenário ${session.scenario}`,
        );
        console.error(
          `Cenas disponíveis: ${Object.keys(narrative.scenes).join(", ")}`,
        );
        return res
          .status(404)
          .json({
            error: `Scene "${sceneId}" not found in scenario "${session.scenario}"`,
          });
      }

      // Validar que scene tem choices array
      if (!scene.choices || !Array.isArray(scene.choices)) {
        console.error(
          `Cena ${sceneId} não tem array de choices. Estrutura:`,
          scene,
        );
        return res
          .status(400)
          .json({ error: `Scene "${sceneId}" has no valid choices` });
      }

      // Encontrar a escolha correspondente
      const choice = scene.choices.find((c) => c.text === choiceText);
      if (!choice) {
        console.error(
          `Escolha não encontrada: "${choiceText}" na cena ${sceneId}`,
        );
        console.error(
          `Escolhas disponíveis: ${scene.choices.map((c) => c.text).join(", ")}`,
        );
        return res
          .status(400)
          .json({
            error: `Invalid choice: "${choiceText}" not found in scene "${sceneId}"`,
          });
      }

      // Registar decisão no GameState
      if (typeof gameState.recordDecision === "function") {
        gameState.recordDecision(sceneId, choiceText, {
          empathyScore: choice.empathyScore || 0,
          cloutScore: choice.cloutScore || 0,
        });
      }

      // Calcular consequências da escolha
      const consequence = {
        empathy_score: choice.empathyScore || 0,
        risk_level: choice.risk || "none",
        consequence_type: choice.consequence || "neutral",
        text: `Sua escolha: "${choice.text}"`,
        impact: GameController.calculateImpact(choice),
      };

      // Registar decisão no banco de dados
      try {
        await GameDecisionModel.record({
          sessionId,
          userId,
          sceneId,
          choiceText,
          consequence,
        });
      } catch (dbError) {
        console.error(
          "Erro ao registar decisão no banco de dados:",
          dbError.message,
        );
        // Não interromper o fluxo por erro de BD
      }

      // Atualizar estado da sessão no banco
      try {
        const currentState =
          typeof session.state === "string"
            ? JSON.parse(session.state)
            : session.state || {};
        currentState.choices_made = (currentState.choices_made || []).concat({
          sceneId,
          choiceText,
          empathyScore: choice.empathyScore || 0,
          timestamp: new Date().toISOString(),
        });
        currentState.current_scene = choice.nextScene || sceneId;
        currentState.total_empathy =
          (currentState.total_empathy || 0) + (choice.empathyScore || 0);

        await GameSessionModel.updateState(sessionId, currentState);
      } catch (stateError) {
        console.error(
          "Erro ao atualizar estado da sessão:",
          stateError.message,
        );
        // Não interromper o fluxo por erro de BD
      }

      // Guardar GameState
      if (typeof gameState.saveToStorage === "function") {
        gameState.saveToStorage();
      }

      // Adicionar pontos pela decisão
      try {
        await GamificationModel.addPoints(
          userId,
          25,
          `Decision: "${choiceText}" in ${sceneId}`,
        );
      } catch (gamError) {
        console.error("Erro ao adicionar pontos:", gamError.message);
        // Não interromper o fluxo por erro de BD
      }

      res.json({
        success: true,
        consequence,
        nextScene: choice.nextScene || sceneId,
        currentEmpathy: gameState.scores?.empathy || 0,
        gameState: {
          variables: gameState.variables || {},
          scores: gameState.scores || {},
          inventory: gameState.inventory || [],
          history: gameState.history || [],
        },
      });
    } catch (error) {
      console.error("Erro no recordDecision:", error);
      res.status(500).json({ error: error.message, details: error.stack });
    }
  }

  /**
   * Completar puzzle
   */
  static async completePuzzle(req, res) {
    try {
      const { sessionId, userId, puzzleId, solution } = req.body;

      const session = await GameSessionModel.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Obter GameState
      let gameState = gameStates.get(sessionId);
      if (!gameState) {
        gameState = new GameState();
        gameState.loadFromStorage();
        gameStates.set(sessionId, gameState);
      }

      // Obter narrativa para validar puzzle
      const narrative = narrativeManager.getNarrative(session.scenario);
      if (!narrative) {
        return res.status(404).json({ error: "Scenario not found" });
      }

      // Validar puzzle existência
      const puzzle = narrative.puzzles.find((p) => p.id === puzzleId);
      if (!puzzle) {
        return res
          .status(404)
          .json({ error: `Puzzle "${puzzleId}" not found` });
      }

      // Validar solução
      const isCorrect = GameController.validatePuzzleSolution(
        puzzleId,
        solution,
      );

      if (isCorrect) {
        // Completar puzzle no GameState
        gameState.completePuzzle(puzzleId);

        // Atualizar estado da sessão no banco
        const currentState = JSON.parse(session.state);
        if (!currentState.puzzles_solved) {
          currentState.puzzles_solved = [];
        }

        if (!currentState.puzzles_solved.includes(puzzleId)) {
          currentState.puzzles_solved.push(puzzleId);

          await GameSessionModel.updateState(sessionId, {
            puzzles_solved: currentState.puzzles_solved,
          });

          // Adicionar pontos por puzzle resolvido
          const puzzlePoints = 50;
          await GamificationModel.addPoints(
            userId,
            puzzlePoints,
            `Puzzle solved: ${puzzleId}`,
          );

          // Verificar badge de múltiplos puzzles
          if (currentState.puzzles_solved.length >= 2) {
            await GamificationModel.awardBadge(
              userId,
              "PUZZLE_MASTER",
              "Resolveu múltiplos puzzles!",
            );
          }
        }

        // Guardar GameState
        gameState.saveToStorage();

        res.json({
          success: true,
          message: "Puzzle solved!",
          points: 50,
          puzzlesSolved: currentState.puzzles_solved.length,
          gameState: {
            variables: gameState.variables,
            scores: gameState.scores,
            inventory: gameState.inventory,
            history: gameState.history,
          },
        });
      } else {
        res.json({
          success: false,
          message: "Incorrect solution. Try again.",
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Descobrir pista
   */
  static async discoverClue(req, res) {
    try {
      const { sessionId, userId, clueId } = req.body;

      const session = await GameSessionModel.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const currentState = JSON.parse(session.state);

      if (!currentState.discovered_clues.includes(clueId)) {
        currentState.discovered_clues.push(clueId);

        await GameSessionModel.updateState(sessionId, {
          discovered_clues: currentState.discovered_clues,
        });

        await GamificationModel.addPoints(
          userId,
          GamificationModel.POINTS.CLUE_FOUND,
          `Clue: ${clueId}`,
        );
      }

      res.json({ success: true, clue: this.getClueContent(clueId) });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Finalizar sessão de jogo
   */
  static async finishSession(req, res) {
    try {
      const { sessionId, userId, finalSceneId } = req.body;

      const session = await GameSessionModel.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      // Obter GameState
      let gameState = gameStates.get(sessionId);
      if (!gameState) {
        gameState = new GameState();
        gameState.loadFromStorage();
        gameStates.set(sessionId, gameState);
      }

      const currentState = JSON.parse(session.state);
      const endTime = new Date();
      const duration = Math.floor(
        (endTime - new Date(session.start_time)) / 1000,
      );

      // Calcular desfecho final baseado em GameState
      const endingData = session.scenario.includes("scenario_1")
        ? gameState.calculateScenario1Ending()
        : gameState.calculateScenario2Ending();

      const finalState = {
        ...currentState,
        game_active: false,
        final_scene: finalSceneId,
        completion_time: duration,
        final_ending: endingData.ending,
        total_empathy_score: endingData.score,
      };

      // Finalizar sessão no banco
      await GameSessionModel.finalize(sessionId, finalState);

      // Registar métricas
      await GameMetricsModel.recordSessionMetrics(sessionId, {
        sessionId,
        userId,
        scenario: session.scenario,
        totalDuration: duration,
        decisionsCount: currentState.choices_made
          ? currentState.choices_made.length
          : 0,
        puzzlesSolved: currentState.puzzles_solved
          ? currentState.puzzles_solved.length
          : 0,
        cluesFound: currentState.discovered_clues
          ? currentState.discovered_clues.length
          : 0,
        empathyScore: endingData.score,
        finalScene: finalSceneId,
        completionStatus: "completed",
        finalEnding: endingData.ending,
      });

      // Adicionar bônus de conclusão
      await GamificationModel.addPoints(
        userId,
        100,
        `Session completed: ${endingData.ending}`,
      );

      // Gerar feedback pedagógico personalizado
      const feedback = this.generatePedagogicalFeedback(
        finalState,
        session.scenario,
      );

      // Limpar RealTimeManager se aplicável
      const realTimeManager = realTimeManagers.get(sessionId);
      if (realTimeManager) {
        realTimeManager.stopRealtimeMechanics();
        realTimeManagers.delete(sessionId);
      }

      // Limpar GameState da memória
      gameStates.delete(sessionId);

      res.json({
        success: true,
        sessionSummary: {
          duration,
          choicesMade: currentState.choices_made
            ? currentState.choices_made.length
            : 0,
          puzzlesSolved: currentState.puzzles_solved
            ? currentState.puzzles_solved.length
            : 0,
          cluesFound: currentState.discovered_clues
            ? currentState.discovered_clues.length
            : 0,
          empathyScore: endingData.score,
          finalScene: finalSceneId,
          finalEnding: endingData.title,
          endingMessage: endingData.message,
        },
        pedagogicalFeedback: feedback,
        exportedData: gameState.exportSessionData(),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Calcular impacto de uma escolha
   */
  static calculateImpact(choice) {
    const empathy = choice.empathyScore;
    if (empathy >= 70) return "positive";
    if (empathy >= 40) return "neutral";
    return "negative";
  }

  /**
   * Validar solução de puzzle
   * Palavras-chave esperadas em cada tipo de puzzle
   */
  static validatePuzzleSolution(puzzleId, solution) {
    if (!solution) return false;

    const puzzleSolutions = {
      // Cenário 1: Testemunho escolar
      social_media_analysis: [
        "pessoas",
        "comentários",
        "padrão",
        "escala",
        "grupo",
        "dispersão",
        "aumentou",
      ],
      timeline_reconstruction: [
        "cronologia",
        "escalação",
        "sequência",
        "tempo",
        "desenvolvimento",
        "progressão",
      ],
      empathy_response: [
        "difícil",
        "posso ajudar",
        "apoio",
        "responder",
        "compreender",
      ],

      // Cenário 2: Chat/Cyberbullying
      cyberbullying_documentation: [
        "mensagens",
        "screenshots",
        "participantes",
        "sequência",
        "evidência",
        "documentar",
      ],
    };

    const keywords = puzzleSolutions[puzzleId] || [];
    const solutionLower = solution.toLowerCase();

    return keywords.some((keyword) => solutionLower.includes(keyword));
  }

  /**
   * Obter conteúdo de pista
   * Baseado no ID da pista
   */
  static getClueContent(clueId) {
    const clues = {
      // Cenário 1: Dicas escolares
      social_media_dm: {
        title: "Mensagem Privada Descoberta",
        content:
          "Encontrou uma conversa privada que revela como o incidente começou online. A vítima pediu ajuda há dias, mas ninguém respondeu.",
      },
      witness_testimony: {
        title: "Depoimento de Testemunha",
        content:
          "Outro aluno confirma que viu o incidente começar há semanas. Não era a primeira vez.",
      },
      victim_background: {
        title: "História da Vítima",
        content:
          "Você aprende que a vítima já enfrentava problemas de saúde mental. O bullying piorou significativamente as coisas.",
      },

      // Cenário 2: Dicas de chat
      chat_history: {
        title: "Histórico de Chat",
        content:
          "Você encontra mensagens anteriores mostrando que o bullying começou de forma subtil, então escalou rapidamente.",
      },
      victim_story: {
        title: "História da Vítima",
        content:
          "A vítima partilha que se sente completamente isolada. Ninguém defendeu.",
      },
      peer_perspective: {
        title: "Perspetiva de Colega",
        content:
          "Outro aluno diz que viu a situação sair do controlo, mas não sabia como intervir.",
      },
    };

    return clues[clueId] || { title: "Clue", content: "No content available" };
  }

  /**
   * Gerar feedback pedagógico personalizado
   * Baseado nas escolhas e performance do jogador
   */
  static generatePedagogicalFeedback(gameState, scenario) {
    const {
      choices_made,
      puzzles_solved,
      discovered_clues,
      total_empathy_score,
    } = gameState;

    let feedback = {
      scenario: scenario,
      empathyReflection: "",
      strategiesForIntervention: [],
      keyLearnings: [],
      nextSteps: [],
    };

    // Feedback baseado em score de empatia
    if (total_empathy_score >= 80) {
      feedback.empathyReflection =
        "🌟 Excelente! Você demonstrou forte empatia, compreensão e ação decisiva contra o bullying.";
      feedback.strategiesForIntervention = [
        "Sua abordagem de reconhecer o problema e procurar ajuda foi exemplar",
        "Você equilibrou bem a compaixão com a segurança pessoal",
        "Seu apoio contínuo à vítima foi crucial",
      ];
      feedback.keyLearnings = [
        "A empatia ativa (fazer algo) é mais poderosa que a empatia passiva",
        "Procurar ajuda de adultos não é fraqueza, é sabedoria",
        "Ser testemunha ativa muda a cultura de grupo",
      ];
    } else if (total_empathy_score >= 60) {
      feedback.empathyReflection =
        "✓ Bom trabalho! Você mostrou preocupação e tomou algumas ações, mas havia mais que poderia ter feito.";
      feedback.strategiesForIntervention = [
        "Considere intervir mais cedo quando vir sinais de bullying",
        "Não hesite em procurar ajuda de adultos imediatamente",
        "Apoio público à vítima é mais eficaz que privado",
      ];
      feedback.keyLearnings = [
        "A rapidez na resposta importa - quanto mais cedo, melhor",
        "O silêncio é uma forma de cumplicidade, mesmo involuntária",
        "Uma pessoa pode fazer a diferença numa situação de grupo",
      ];
    } else if (total_empathy_score >= 40) {
      feedback.empathyReflection =
        "⚠️ Você reconheceu o problema, mas hesitou em agir. Isso é comum, mas tem consequências.";
      feedback.strategiesForIntervention = [
        "O medo é natural, mas não deve impedir ação",
        "Começar pequeno: fale com um colega ou adulto de confiança",
        "Documentar abusos é uma forma segura de ajudar",
      ];
      feedback.keyLearnings = [
        "Esperar não resolve o problema - geralmente piora",
        "A vítima precisa saber que não está sozinha",
        "Você tem mais poder do que acredita",
      ];
    } else {
      feedback.empathyReflection =
        "❌ Sua inação contribuiu para o ciclo do bullying. A boa notícia: você pode aprender e fazer melhor.";
      feedback.strategiesForIntervention = [
        "Reconheça que testemunhas têm responsabilidade",
        "Procure apoio se tiver medo de agir sozinho",
        "Fale sobre bullying com educadores e pais",
      ];
      feedback.keyLearnings = [
        "O silêncio não é neutro - é uma escolha com consequências",
        "Bullying funciona porque ninguém intervém",
        "Uma pessoa pode mudar tudo",
      ];
    }

    // Feedback sobre puzzles
    if (puzzles_solved.length >= 2) {
      feedback.keyLearnings.push(
        "🧩 Você investigou profundamente e compreendeu os padrões de bullying",
      );
    }

    if (discovered_clues.length >= 3) {
      feedback.keyLearnings.push(
        "🔍 Sua observação atenta revelou evidências importantes para ajudar a vítima",
      );
    }

    // Próximos passos
    if (scenario === "scenario_1") {
      feedback.nextSteps = [
        "Reflita: como você reagiria numa situação real semelhante?",
        "Fale com amigos sobre como reconhecer e responder a bullying",
        "Tente o Cenário 2 para ver a situação da perspetiva de quem está sob pressão de grupo",
      ];
    } else if (scenario === "scenario_2") {
      feedback.nextSteps = [
        "Entenda: a pressão de grupo afeta como as pessoas agem",
        "Reconheça: você sempre tem uma escolha, mesmo em grupo",
        "Converse: fale sobre peer pressure e cyberbullying com outras pessoas",
      ];
    }

    return feedback;
  }
}

export default GameController;
