/**
 * StateManager.js
 * Gerencia estado global e variáveis de jogo através de narrativas
 * Suporta persistência em localStorage e sincronização com Twine
 */

class GameState {
  constructor() {
    // Estado do jogo global
    this.scenario = null;
    this.character = null;
    this.sessionId = this.generateSessionId();

    // Variáveis de jogo (persistem entre passages)
    this.variables = {};
    this.inventory = [];
    this.achievements = [];
    this.decisions = {};
    this.scores = {
      empathy: 0,
      clout: 0,
      investigation: 0,
      pressure: 0,
    };

    // Timers para mecânicas em tempo real
    this.activeTimers = {};
    this.messageQueue = [];

    // Histórico de ações
    this.history = [];

    // Inicializar localStorage
    this.loadFromStorage();
  }

  /**
   * Gerar ID único de sessão
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * SCENARIO 1: O Eco do Código
   * Estado específico para investigação de bullying
   */
  initializeScenario1() {
    this.scenario = "scenario_1_echo_codigo";
    this.character = "rodrigo";

    this.variables = {
      investigationLevel: 0,
      puzzlesCompleted: [],
      alliesFound: [],
      proofGathered: [],
      tiagoConfronted: false,
      lucasConverted: false,
      tellProtocolUsed: false,
      biaProtected: false,
      authorityInvolved: false,
    };

    this.inventory = [
      {
        id: "mural_access",
        name: "Acesso ao Mural Digital",
        description: "Você pode ver o perfil bloqueado",
      },
      {
        id: "initial_clues",
        name: "Pistas Iniciais",
        description: "@Bia_Truths, mensagens ofensivas",
      },
    ];

    this.scores = {
      empathy: 0,
      investigation: 0,
      allies: 0,
      riskTaken: 0,
    };
  }

  /**
   * SCENARIO 2: O Clout da Crueldade
   * Estado específico para dilema do agressor
   */
  initializeScenario2() {
    this.scenario = "scenario_2_clout_crueldade";
    this.character = Math.random() > 0.5 ? "tiago" : "catarina";

    this.variables = {
      cloutValue: 45,
      empathyValue: 50,
      groupPressure: 0,
      messagesReceived: 0,
      photoShared: false,
      dmWithBia: false,
      groupLeft: false,
      reportedAdmin: false,
      biaStatus: "normal", // normal -> offline -> desperate -> intervention
      redeemedYet: false,
    };

    this.messageQueue = [];
    this.inventory = [];

    this.scores = {
      clout: 45,
      empathy: 50,
      groupLoyalty: 0,
      reputationDamage: 0,
    };
  }

  /**
   * Adicionar prova ao inventário (Scenario 1)
   * @param {string} proofId - ID único da prova
   * @param {object} proofData - Dados da prova (tipo, conteúdo, etc)
   */
  addProof(proofId, proofData) {
    if (!this.variables.proofGathered) {
      this.variables.proofGathered = [];
    }

    const proof = {
      id: proofId,
      timestamp: Date.now(),
      ...proofData,
    };

    this.variables.proofGathered.push(proof);
    this.recordDecision("proof_gathered", proofId);

    // Adicionar XP
    this.addScore("investigation", 25);
    this.addScore("empathy", proofData.empathyBonus || 30);

    return proof;
  }

  /**
   * Completar puzzle
   * @param {string} puzzleId - exif_metadata, caesar_cipher, etc
   */
  completePuzzle(puzzleId) {
    if (!this.variables.puzzlesCompleted) {
      this.variables.puzzlesCompleted = [];
    }

    this.variables.puzzlesCompleted.push({
      id: puzzleId,
      completedAt: new Date().toISOString(),
    });

    this.addScore("investigation", 25);
    this.addScore("empathy", 20);
    this.recordDecision("puzzle_completed", puzzleId);
  }

  /**
   * Registar escolha do jogador (rastreio completo)
   */
  recordDecision(passageName, choiceText, scores = {}) {
    const decision = {
      passage: passageName,
      choice: choiceText,
      timestamp: new Date().toISOString(),
      scores: scores,
    };

    this.history.push(decision);
    this.decisions[passageName] = choiceText;

    // Aplicar modificadores de score
    if (scores.empathyScore) {
      this.addScore("empathy", scores.empathyScore);
    }
    if (scores.cloutScore) {
      this.addScore("clout", scores.cloutScore);
    }
  }

  /**
   * Adicionar/subtrair pontos
   */
  addScore(scoreType, value) {
    if (this.scores.hasOwnProperty(scoreType)) {
      this.scores[scoreType] = Math.max(
        0,
        Math.min(100, this.scores[scoreType] + value),
      );
    }
  }

  /**
   * Simular chegada de mensagem em tempo real (Scenario 2)
   * @param {string} senderName - Nome de quem envia
   * @param {string} messageContent - Conteúdo
   * @param {number} delayMs - Atraso antes de aparecer (0-5000ms)
   */
  queueMessage(senderName, messageContent, delayMs = 0) {
    const message = {
      id: `msg_${Date.now()}`,
      sender: senderName,
      content: messageContent,
      timestamp: Date.now() + delayMs,
      displayed: false,
    };

    this.messageQueue.push(message);

    // Se tem delay, criar timer
    if (delayMs > 0) {
      this.addTimer(`msg_${message.id}`, delayMs, () => {
        this.displayMessage(message.id);
      });
    }

    return message;
  }

  /**
   * Criar timer para mecânicas em tempo real
   */
  addTimer(timerId, durationMs, callback) {
    if (this.activeTimers[timerId]) {
      clearTimeout(this.activeTimers[timerId].id);
    }

    const timeoutId = setTimeout(() => {
      callback();
      delete this.activeTimers[timerId];
    }, durationMs);

    this.activeTimers[timerId] = {
      id: timeoutId,
      durationMs: durationMs,
      startTime: Date.now(),
      callback: callback,
    };

    return timerId;
  }

  /**
   * Cancelar timer
   */
  clearTimer(timerId) {
    if (this.activeTimers[timerId]) {
      clearTimeout(this.activeTimers[timerId].id);
      delete this.activeTimers[timerId];
      return true;
    }
    return false;
  }

  /**
   * Limpar todos os timers (transição de passage)
   */
  clearAllTimers() {
    Object.keys(this.activeTimers).forEach((timerId) => {
      clearTimeout(this.activeTimers[timerId].id);
    });
    this.activeTimers = {};
  }

  /**
   * Marcar mensagem como exibida
   */
  displayMessage(messageId) {
    const msg = this.messageQueue.find((m) => m.id === messageId);
    if (msg) {
      msg.displayed = true;
    }
    return msg;
  }

  /**
   * Obter mensagens não exibidas (para UI em tempo real)
   */
  getUnreadMessages() {
    return this.messageQueue.filter((m) => !m.displayed);
  }

  /**
   * Aumentar pressão do grupo (Scenario 2)
   */
  increasePressure(amount = 10) {
    this.variables.groupPressure = Math.min(
      100,
      this.variables.groupPressure + amount,
    );

    // Pressão afeta decisões
    if (this.variables.groupPressure > 75) {
      this.variables.cloutValue = Math.max(0, this.variables.cloutValue - 5);
    }
  }

  /**
   * Alterar status de Bia (Scenario 2)
   * normal -> offline -> desperate -> intervention
   */
  setBiaStatus(newStatus) {
    const validStatuses = ["normal", "offline", "desperate", "intervention"];
    if (validStatuses.includes(newStatus)) {
      this.variables.biaStatus = newStatus;

      // Impacto emocional
      if (newStatus === "desperate") {
        this.addScore("empathy", -20);
      }
      if (newStatus === "intervention") {
        this.addScore("empathy", 30); // Positive consequence finally
      }
    }
  }

  /**
   * Converter aliado (Scenario 1)
   */
  convertAlly(allyName) {
    if (!this.variables.alliesFound) {
      this.variables.alliesFound = [];
    }

    this.variables.alliesFound.push({
      name: allyName,
      convertedAt: new Date().toISOString(),
    });

    this.addScore("empathy", 40);

    if (allyName === "lucas") {
      this.variables.lucasConverted = true;
    }
  }

  /**
   * Determinar desfecho final (Scenario 1)
   */
  calculateScenario1Ending() {
    const empathyScore = this.scores.empathy;
    const investigationComplete = this.variables.puzzlesCompleted?.length === 2;
    const tellUsed = this.variables.tellProtocolUsed;
    const biaProtected = this.variables.biaProtected;

    if (empathyScore >= 85 && tellUsed && biaProtected) {
      return {
        ending: "guardian_of_climate",
        title: "Guardião do Clima",
        score: 100,
        message: "Você foi verdadeiramente um guardião do clima escolar.",
      };
    }

    if (empathyScore >= 70 && tellUsed) {
      return {
        ending: "responsible_guardian",
        title: "Guardião Responsável",
        score: 80,
        message: "Você agiu com responsabilidade e prudência.",
      };
    }

    return {
      ending: "silence_of_bia",
      title: "O Silêncio de Bia",
      score: Math.floor(empathyScore),
      message: "A situação não foi resolvida adequadamente.",
    };
  }

  /**
   * Determinar desfecho final (Scenario 2)
   */
  calculateScenario2Ending() {
    const cloutScore = this.scores.clout;
    const empathyScore = this.scores.empathy;
    const redeemedYet = this.variables.redeemedYet;
    const biaProtected =
      this.variables.dmWithBia || this.variables.reportedAdmin;

    if (redeemedYet && biaProtected && empathyScore >= 80) {
      return {
        ending: "redeemed",
        title: "O Redentor",
        score: 100,
        message: "Você reconheceu o erro e agiu para reparar.",
      };
    }

    if (biaProtected && empathyScore >= 70) {
      return {
        ending: "witness",
        title: "Testemunha Responsável",
        score: 75,
        message: "Você reportou responsavelmente à autoridade.",
      };
    }

    if (cloutScore < 0 && this.variables.groupLeft) {
      return {
        ending: "desert",
        title: "O Deserto",
        score: 70,
        message: "Você perdeu amigos mas salvou uma vida.",
      };
    }

    return {
      ending: "guilty_coward",
      title: "O Culpado Covarde",
      score: Math.floor((empathyScore + cloutScore) / 2),
      message: "Suas ações deixaram consequências que não pode apagar.",
    };
  }

  /**
   * Persistência: Salvar em localStorage
   */
  saveToStorage() {
    // Verificar se localStorage existe (apenas no browser)
    if (typeof localStorage === "undefined") {
      // Backend - não persistir em localStorage
      return true;
    }

    const stateData = {
      sessionId: this.sessionId,
      scenario: this.scenario,
      character: this.character,
      variables: this.variables,
      inventory: this.inventory,
      scores: this.scores,
      decisions: this.decisions,
      history: this.history,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(
        `gamestate_${this.sessionId}`,
        JSON.stringify(stateData),
      );
      return true;
    } catch (error) {
      console.warn("Aviso ao salvar estado:", error.message);
      return false;
    }
  }

  /**
   * Persistência: Carregar de localStorage
   */
  loadFromStorage() {
    // Verificar se localStorage existe (apenas no browser)
    if (typeof localStorage === "undefined") {
      // Backend - não carregar de localStorage
      return false;
    }

    try {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith("gamestate_"),
      );
      if (keys.length > 0) {
        const latestKey = keys[keys.length - 1];
        const stateData = JSON.parse(localStorage.getItem(latestKey));

        Object.assign(this, stateData);
        return true;
      }
    } catch (error) {
      console.warn("Aviso ao carregar estado:", error.message);
    }
    return false;
  }

  /**
   * Limpar sessionStorage completamente (novo jogo)
   */
  clearStorage() {
    // Verificar se localStorage existe (apenas no browser)
    if (typeof localStorage === "undefined") {
      // Backend - não há nada para limpar
      return true;
    }

    try {
      localStorage.removeItem(`gamestate_${this.sessionId}`);
      return true;
    } catch (error) {
      console.warn("Aviso ao limpar estado:", error.message);
      return false;
    }
  }

  /**
   * Exportar dados de conclusão para servidor
   */
  exportSessionData() {
    return {
      sessionId: this.sessionId,
      scenario: this.scenario,
      character: this.character,
      finalScores: this.scores,
      endingAchieved:
        this.scenario === "scenario_1_echo_codigo"
          ? this.calculateScenario1Ending()
          : this.calculateScenario2Ending(),
      totalDecisions: this.history.length,
      timeElapsed: Date.now(), // Será processado no servidor
      achievements: this.achievements,
    };
  }

  /**
   * DEBUG: Imprime estado completo
   */
  debug() {
    console.log("=== GAME STATE DEBUG ===");
    console.log("Scenario:", this.scenario);
    console.log("Character:", this.character);
    console.log("Variables:", this.variables);
    console.log("Scores:", this.scores);
    console.log("History:", this.history);
    console.log("Active Timers:", Object.keys(this.activeTimers));
    console.log("Message Queue:", this.messageQueue);
    console.log("======================");
  }
}

// Exportar para uso em Twine e componentes React
if (typeof module !== "undefined" && module.exports) {
  module.exports = GameState;
}

export default GameState;
