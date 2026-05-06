/**
 * CONTROLLER: NarrativeController
 *
 * Gerencia acesso a narrativas Twine
 * Integra com TwineParser e NarrativeManager
 *
 * Endpoints:
 * - GET /api/narratives/:scenarioId - Lista todos os nós
 * - GET /api/narratives/:scenarioId/:nodeId - Nó específico com choices filtradas
 * - GET /api/narratives/:scenarioId/start - Nó inicial
 * - POST /api/narratives/:scenarioId/progress - Avança para próximo nó
 */

import narrativeManager from "../utils/NarrativeManager.js";
import GameSessionModel from "../models/GameSessionModel.js";

class NarrativeController {
  /**
   * GET /api/narratives/:scenarioId
   * Lista todos os nós de um cenário
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     scenarioId,
   *     title,
   *     description,
   *     stats: { sceneCount, puzzleCount },
   *     nodes: [{ id, name, tags, hasPuzzle, isStart }, ...]
   *   }
   * }
   */
  static async getScenarioNodes(req, res) {
    try {
      const { scenarioId } = req.params;

      const narrative = await narrativeManager.loadNarrative(scenarioId);

      if (!narrative) {
        return res.status(404).json({
          success: false,
          error: `Cenário não encontrado: ${scenarioId}`,
        });
      }

      const stats = narrativeManager.getStats(scenarioId);

      res.json({
        success: true,
        data: {
          scenarioId,
          title: narrative.title,
          description: narrative.description,
          stats: {
            sceneCount: stats.sceneCount,
            puzzleCount: stats.puzzleCount,
          },
          initialScene: narrative.initialScene,
          nodes: Object.entries(narrative.scenes).map(([sceneName, scene]) => ({
            id: sceneName,
            name: scene.title || sceneName,
            tags: scene.tags || [],
            hasPuzzle: !!scene.puzzle,
            isStart: sceneName === narrative.initialScene,
          })),
        },
      });
    } catch (error) {
      console.error("Erro ao obter nós de cenário:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/narratives/:scenarioId/start
   * Retorna o nó inicial de um cenário
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     node: { id, title, text, tags, puzzle, choices },
   *     sessionState: {} (se sessionId fornecido)
   *   }
   * }
   */
  static async getStartNode(req, res) {
    try {
      const { scenarioId } = req.params;
      const { sessionId } = req.query;

      const narrative = await narrativeManager.loadNarrative(scenarioId);

      if (!narrative) {
        return res.status(404).json({
          success: false,
          error: `Cenário não encontrado: ${scenarioId}`,
        });
      }

      const startNodeId = narrative.initialScene;
      const startNode = narrative.scenes[startNodeId];

      if (!startNode) {
        return res.status(404).json({
          success: false,
          error: `Nó inicial não encontrado para cenário ${scenarioId}`,
        });
      }

      // Se sessionId fornecido, obter estado da sessão
      let sessionState = null;
      if (sessionId) {
        const session = await GameSessionModel.findById(sessionId);
        if (session) {
          sessionState = session.state;
        }
      }

      res.json({
        success: true,
        data: {
          node: this._formatNode(startNodeId, startNode),
          choices: this._getAvailableChoices(startNode.choices, sessionState),
          sessionState,
        },
      });
    } catch (error) {
      console.error("Erro ao obter nó inicial:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * GET /api/narratives/:scenarioId/:nodeId
   * Retorna nó específico com choices filtradas por estado de sessão
   *
   * Query params:
   * - sessionId (opcional): para filtrar choices por estado
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     node: { id, title, text, tags, puzzle },
   *     choices: [...],
   *     sessionState: {}
   *   }
   * }
   */
  static async getNode(req, res) {
    try {
      const { scenarioId, nodeId } = req.params;
      const { sessionId } = req.query;

      const narrative = await narrativeManager.loadNarrative(scenarioId);

      if (!narrative) {
        return res.status(404).json({
          success: false,
          error: `Cenário não encontrado: ${scenarioId}`,
        });
      }

      const node = narrative.scenes[nodeId];

      if (!node) {
        return res.status(404).json({
          success: false,
          error: `Nó não encontrado: ${nodeId}`,
        });
      }

      // Se sessionId fornecido, obter estado e filtrar choices
      let sessionState = null;
      let availableChoices = node.choices || [];

      if (sessionId) {
        const session = await GameSessionModel.findById(sessionId);
        if (session) {
          sessionState = session.state;
          // Aqui poderíamos filtrar choices baseado em condições
          // Exemplo: algumas escolhas só aparecem se certas variáveis de estado estão set
          // Por agora, retornamos todas as escolhas
        }
      }

      res.json({
        success: true,
        data: {
          node: this._formatNode(nodeId, node),
          choices: availableChoices,
          sessionState,
        },
      });
    } catch (error) {
      console.error("Erro ao obter nó:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * POST /api/narratives/:scenarioId/progress
   * Avança para próximo nó
   *
   * Body:
   * {
   *   sessionId: string (obrigatório),
   *   currentNodeId: string,
   *   choiceId: string (índice da escolha)
   * }
   *
   * Response:
   * {
   *   success: true,
   *   data: {
   *     nextNode: { id, title, text, choices, puzzle },
   *     choices: [...],
   *     sessionUpdated: true,
   *     metrics: { empathyGained, scoreGained }
   *   }
   * }
   */
  static async progressNarrative(req, res) {
    try {
      const { scenarioId } = req.params;
      const { sessionId, currentNodeId, choiceId } = req.body;

      if (!sessionId || !currentNodeId || choiceId === undefined) {
        return res.status(400).json({
          success: false,
          error: "Parâmetros obrigatórios: sessionId, currentNodeId, choiceId",
        });
      }

      // Carregar narrativa
      const narrative = await narrativeManager.loadNarrative(scenarioId);
      if (!narrative) {
        return res.status(404).json({
          success: false,
          error: `Cenário não encontrado: ${scenarioId}`,
        });
      }

      // Verificar nó atual
      const currentNode = narrative.scenes[currentNodeId];
      if (!currentNode) {
        return res.status(404).json({
          success: false,
          error: `Nó não encontrado: ${currentNodeId}`,
        });
      }

      // Obter escolha
      const choice = currentNode.choices[choiceId];
      if (!choice) {
        return res.status(400).json({
          success: false,
          error: `Escolha inválida: ${choiceId}`,
        });
      }

      // Obter próximo nó
      const nextNodeId = choice.nextScene;
      const nextNode = narrative.scenes[nextNodeId];

      if (!nextNode) {
        return res.status(404).json({
          success: false,
          error: `Próximo nó não encontrado: ${nextNodeId}`,
        });
      }

      // Atualizar sessão com decisão
      const session = await GameSessionModel.findById(sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: "Sessão não encontrada",
        });
      }

      // Preparar estado atualizado
      const updatedState = {
        ...session.state,
        currentScene: nextNodeId,
        current_scene: nextNodeId,
      };

      // Inicializar arrays se não existirem
      if (!updatedState.choices_made) updatedState.choices_made = [];
      if (!updatedState.discovered_clues) updatedState.discovered_clues = [];

      // Adicionar decisão ao histórico
      updatedState.choices_made.push({
        timestamp: new Date().toISOString(),
        nodeId: currentNodeId,
        choiceIndex: choiceId,
        choiceText: choice.text,
        nextNodeId,
        empathyScore: choice.empathyScore || 50,
      });

      // Atualizar sessão
      await GameSessionModel.updateState(sessionId, updatedState);

      // Calcular métricas da escolha
      const empathyGained = choice.empathyScore ? choice.empathyScore - 50 : 0;

      res.json({
        success: true,
        data: {
          nextNode: this._formatNode(nextNodeId, nextNode),
          choices: nextNode.choices || [],
          sessionUpdated: true,
          metrics: {
            empathyGained,
            choiceText: choice.text,
            nextNodeId,
          },
        },
      });
    } catch (error) {
      console.error("Erro ao progredir narrativa:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * HELPER: Formatar nó para resposta
   *
   * @private
   */
  static _formatNode(nodeId, node) {
    return {
      id: nodeId,
      title: node.title,
      text: node.text,
      tags: node.tags || [],
      puzzle: node.puzzle || null,
      metadata: node.metadata || {},
    };
  }

  /**
   * HELPER: Filtrar choices disponíveis
   * Pode ser estendido para suportar condições complexas
   *
   * @private
   */
  static _getAvailableChoices(choices, sessionState) {
    // Por agora, retornar todas as choices
    // Futuramente, adicionar lógica de condições
    return choices || [];
  }
}

export default NarrativeController;
