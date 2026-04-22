/**
 * RealTimeManager.js
 * Gerencia mecânicas em tempo real para Scenario 2
 * - Escalação de pressão do grupo
 * - Mudança de status de Bia
 * - Timers para decisões
 * - Sequência automática de mensagens
 */

export class RealTimeManager {
  constructor(gameState) {
    this.gameState = gameState;
    this.startTime = Date.now();
    this.elapsedSeconds = 0;
    this.pressureIntervalId = null;
    this.biaStatusIntervalId = null;
    this.messageSequenceId = null;
  }

  /**
   * Iniciar mecânicas em tempo real para Scenario 2
   */
  startRealtimeMechanics() {
    if (this.gameState.scenario !== 'scenario_2_clout_crueldade') {
      console.warn('RealTimeManager: Scenario 2 apenas');
      return;
    }

    // Iniciar contador de tempo
    this.startTimeTracking();

    // Iniciar sequência de mensagens do grupo
    this.startMessageSequence();

    // Iniciar mudança de status de Bia baseada em tempo
    this.startBiaStatusProgression();

    // Iniciar aumentos de pressão baseados em ações
    this.startPressureEscalation();

    console.log('✓ RealTimeManager: Mecânicas iniciadas para Scenario 2');
  }

  /**
   * Rastrear tempo decorrido
   */
  startTimeTracking() {
    const trackingInterval = setInterval(() => {
      this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    }, 1000);

    this.gameState.addTimer('timeTracking', 99999999, () => clearInterval(trackingInterval));
  }

  /**
   * Sequência automática de mensagens do grupo
   * Simula grupo reagindo às ações do player
   */
  startMessageSequence() {
    const baseMessages = [
      {
        delay: 0,
        sender: 'Lucas',
        content: 'Ei galera, olhem para isto 😂😂😂',
        pressure: 5,
      },
      {
        delay: 2000,
        sender: 'João',
        content: 'Que cringe HAHA',
        pressure: 5,
      },
      {
        delay: 4000,
        sender: 'Catarina',
        content: 'Lol deveria meter isto como profile pic dela 💀',
        pressure: 8,
      },
      {
        delay: 6000,
        sender: 'Lucas',
        content: '@Tiago, o que achas?',
        pressure: 15,
      },
    ];

    baseMessages.forEach((msg) => {
      this.gameState.queueMessage(
        msg.sender,
        msg.content,
        msg.delay
      );

      // Aumentar pressão quando mensagem é enviada
      this.gameState.addTimer(`pressure_${msg.delay}`, msg.delay, () => {
        this.gameState.increasePressure(msg.pressure);
      });
    });
  }

  /**
   * Progressão de status de Bia baseada em tempo decorrido
   * 0-30min: normal
   * 30-60min: offline
   * 60-120min: desperate
   * 120+min: intervention
   */
  startBiaStatusProgression() {
    const statusCheck = setInterval(() => {
      const minElapsed = this.elapsedSeconds / 60;

      if (minElapsed >= 120) {
        this.gameState.setBiaStatus('intervention');
        clearInterval(statusCheck);
      } else if (minElapsed >= 60) {
        this.gameState.setBiaStatus('desperate');
      } else if (minElapsed >= 30) {
        this.gameState.setBiaStatus('offline');
      }
    }, 5000); // Verificar a cada 5 segundos

    this.biaStatusIntervalId = statusCheck;
  }

  /**
   * Escalação de pressão baseada em ações do jogador
   * Mais agressividade = mais pressão
   */
  startPressureEscalation() {
    const pressureCheck = setInterval(() => {
      const currentPressure = this.gameState.variables.groupPressure;

      // Se pressão > 75, grupo fica mais agressivo
      if (currentPressure > 75) {
        const aggressiveMessages = [
          {
            sender: 'João',
            content: 'Tiago, vamos continuar a lacrar?',
            pressure: 10,
          },
          {
            sender: 'Catarina',
            content: 'O grupo inteiro quer ver mais',
            pressure: 15,
          },
          {
            sender: 'Lucas',
            content: 'Aposto que a Bia já viu tudo',
            pressure: 12,
          },
        ];

        // Enviar mensagem aleatória
        const randomMsg = aggressiveMessages[
          Math.floor(Math.random() * aggressiveMessages.length)
        ];

        this.gameState.queueMessage(
          randomMsg.sender,
          randomMsg.content,
          Math.random() * 3000
        );

        this.gameState.increasePressure(randomMsg.pressure);
      }
    }, 15000); // Verificar a cada 15 segundos

    this.pressureIntervalId = pressureCheck;
  }

  /**
   * Processar ação do jogador com impactos em tempo real
   */
  processPlayerAction(actionType) {
    switch (actionType) {
      case 'lacrar':
        // Ação agressiva
        this.gameState.addScore('clout', 40);
        this.gameState.addScore('empathy', -20);
        this.gameState.increasePressure(20);
        this.respondToAggression();
        break;

      case 'emoji_neutro':
        // Ação passiva
        this.gameState.addScore('clout', 0);
        this.gameState.addScore('empathy', 0);
        this.gameState.increasePressure(5);
        this.respondToPassivity();
        break;

      case 'ignore':
        // Ação de ignorar
        this.gameState.addScore('clout', -20);
        this.gameState.addScore('empathy', 15);
        this.respondToIgnore();
        break;

      case 'defend_bia':
        // Ação de defender Bia
        this.gameState.addScore('clout', -50);
        this.gameState.addScore('empathy', 80);
        this.gameState.increasePressure(40);
        this.respondToDefense();
        break;

      case 'leave_group':
        // Sair do grupo
        this.gameState.addScore('clout', -100);
        this.gameState.addScore('empathy', 90);
        this.respondToLeaving();
        break;

      case 'report_admin':
        // Reportar ao administrador
        this.gameState.addScore('clout', -80);
        this.gameState.addScore('empathy', 95);
        this.respondToReport();
        break;

      default:
        break;
    }
  }

  /**
   * Respostas do grupo a ações agressivas
   */
  respondToAggression() {
    const responses = [
      { sender: 'Lucas', content: 'AHHHH! Ele entrou! Agora sim 🔥', delay: 1000 },
      { sender: 'João', content: 'Tiago tá selvagem hoje lol', delay: 2000 },
      { sender: 'Catarina', content: 'Amigo, meteste-te nos tronos 👑', delay: 3000 },
    ];

    responses.forEach((msg) => {
      this.gameState.queueMessage(msg.sender, msg.content, msg.delay);
    });

    // Grupo fica mais agressivo
    this.gameState.increasePressure(15);
  }

  /**
   * Respostas a passividade
   */
  respondToPassivity() {
    const responses = [
      { sender: 'Lucas', content: 'Oi, esse emoji quer dizer o quê?', delay: 1500 },
      { sender: 'João', content: 'Ele não quer meter-se 😂', delay: 3000 },
      { sender: 'Catarina', content: 'Ainda bem, nunca tens coragem mesmo', delay: 4500 },
    ];

    responses.forEach((msg) => {
      this.gameState.queueMessage(msg.sender, msg.content, msg.delay);
    });
  }

  /**
   * Respostas a ignorar
   */
  respondToIgnore() {
    const responses = [
      { sender: 'Lucas', content: 'Tiago sumiu', delay: 2000 },
      { sender: 'Catarina', content: 'Deixa lá ele', delay: 3500 },
    ];

    responses.forEach((msg) => {
      this.gameState.queueMessage(msg.sender, msg.content, msg.delay);
    });

    // Conteúdo escalada em redes sociais
    console.log('⚠️ Conteúdo está a escalar para redes sociais...');
    this.gameState.setBiaStatus('desperate');
  }

  /**
   * Respostas a defender Bia
   */
  respondToDefense() {
    const responses = [
      { sender: 'Lucas', content: 'Afff, agora virou herói?', delay: 1000 },
      { sender: 'João', content: 'Acredita que estou a ignorar este gajo', delay: 2500 },
      { sender: 'Catarina', content: 'Sempre a mesma história com ele', delay: 4000 },
    ];

    responses.forEach((msg) => {
      this.gameState.queueMessage(msg.sender, msg.content, msg.delay);
    });

    // Grupo o isola
    console.log('⚠️ O grupo está a isolá-lo');
    this.gameState.increasePressure(30);
  }

  /**
   * Respostas a sair do grupo
   */
  respondToLeaving() {
    const responses = [
      { sender: 'Lucas', content: 'Afff, agora sumiu?', delay: 1000 },
      { sender: 'João', content: 'Deixa lá, mais um para apagar', delay: 2500 },
    ];

    responses.forEach((msg) => {
      this.gameState.queueMessage(msg.sender, msg.content, msg.delay);
    });

    this.gameState.variables.groupLeft = true;
    console.log('✓ Saiu do grupo com sucesso');
  }

  /**
   * Respostas a reportar
   */
  respondToReport() {
    console.log('✓ Reportado ao administrador');
    this.gameState.variables.reportedAdminFlag = true;

    // Administrador toma ação
    setTimeout(() => {
      this.gameState.queueMessage(
        'Admin',
        'Ação tomada contra participantes. Investigação iniciada.',
        2000
      );
    }, 3000);
  }

  /**
   * Parar todas as mecânicas (fim de jogo)
   */
  stopRealtimeMechanics() {
    if (this.pressureIntervalId) clearInterval(this.pressureIntervalId);
    if (this.biaStatusIntervalId) clearInterval(this.biaStatusIntervalId);
    this.gameState.clearAllTimers();
    console.log('✓ RealTimeManager: Mecânicas paradas');
  }

  /**
   * Obter resumo de tempo decorrido
   */
  getTimeElapsed() {
    const minutes = Math.floor(this.elapsedSeconds / 60);
    const seconds = this.elapsedSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }

  /**
   * Obter diagnóstico de impacto do jogo
   */
  getDiagnosis() {
    const clout = this.gameState.scores.clout;
    const empathy = this.gameState.scores.empathy;
    const pressure = this.gameState.variables.groupPressure;

    return {
      timeElapsed: this.getTimeElapsed(),
      cloutImpact: clout >= 75 ? 'Você ganhou estatuto no grupo' : 'Você perdeu estatuto',
      empathyState: empathy >= 80 ? 'Mostrou muita empatia' : 'Mostrou pouca empatia',
      groupPressureIntensity:
        pressure > 75
          ? 'Pressão EXTREMA'
          : pressure > 50
          ? 'Pressão ALTA'
          : 'Pressão MÉDIA',
      biaCurrentStatus: this.gameState.variables.biaStatus,
    };
  }
}

export default RealTimeManager;
