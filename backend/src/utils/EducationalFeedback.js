/**
 * UTILITY: EducationalFeedback
 *
 * Gera feedback educativo contextualizado sobre bullying e cyberbullying
 * Adapta mensagens baseado no progresso, empatia e contexto do cenário
 */

export class EducationalFeedback {
  /**
   * Gerar feedback completo para resposta de puzzle
   * @param {Object} params - Parâmetros
   * @returns {Object} Feedback estruturado
   */
  static generate({
    puzzle,
    isCorrect,
    playerAnswer,
    attemptCount = 1,
    empathyScore = 0,
    scenario = "scenario_1",
  }) {
    const baseContext = {
      scenario,
      attemptCount,
      empathyScore,
      playerAnswer,
    };

    if (isCorrect) {
      return this.generateCorrectFeedback(puzzle, baseContext);
    } else {
      return this.generateIncorrectFeedback(puzzle, baseContext);
    }
  }

  /**
   * Feedback para resposta correta
   * @private
   */
  static generateCorrectFeedback(puzzle, context) {
    const { scenario, empathyScore } = context;
    const bullyingContext = puzzle.educational_context || "general";

    // BASE: Mensagem de acerto
    let message = puzzle.feedback?.correct || "✅ Correto!";

    // ENRICHMENT 1: Contexto educativo sobre bullying
    let educationalNote = this.getEducationalNote(
      bullyingContext,
      true,
      empathyScore,
    );

    // ENRICHMENT 2: Ligação com personagem (se aplicável)
    let characterInsight = this.getCharacterInsight(scenario, puzzle);

    // ENRICHMENT 3: Incentivar empatia se score baixo
    let empathyReminder = "";
    if (empathyScore < 50 && bullyingContext !== "general") {
      empathyReminder = "\n\n💭 Reflita: Como se sentiria no lugar da vítima?";
    }

    return {
      title: "✅ Excelente!",
      message,
      educational: educationalNote,
      characterInsight,
      empathyReminder,
      fullMessage: `${message}\n${educationalNote}${characterInsight}${empathyReminder}`,
      encouragement: this.getEncouragement(empathyScore),
    };
  }

  /**
   * Feedback para resposta incorreta
   * @private
   */
  static generateIncorrectFeedback(puzzle, context) {
    const { attemptCount, empathyScore } = context;
    const bullyingContext = puzzle.educational_context || "general";

    let message;
    let guidance;

    // Escalonar feedback baseado em tentativas
    if (attemptCount === 1) {
      message = puzzle.feedback?.incorrect || "❌ Não exatamente.";
      guidance = "Tenta considerar: qual é a perspetiva mais empática?";
    } else if (attemptCount === 2) {
      message = puzzle.feedback?.incorrect || "❌ Ainda não.";
      guidance = this.getStrongerHint(puzzle);
    } else if (attemptCount === 3) {
      message = puzzle.feedback?.incorrect || "❌ Reconsidera...";
      guidance = this.getExplanation(puzzle);
    } else {
      message = puzzle.feedback?.incorrect || "❌ Vamos tentar diferente.";
      guidance = this.getAlternativeApproach(puzzle);
    }

    // Nota educativa
    let educationalNote = this.getEducationalNote(
      bullyingContext,
      false,
      empathyScore,
    );

    return {
      title: "❌ Não é essa...",
      message,
      guidance,
      educational: educationalNote,
      attempt: attemptCount,
      nextSteps:
        attemptCount >= 3
          ? "A solução será revelada em breve..."
          : "Tenta novamente!",
      fullMessage: `${message}\n\n💡 ${guidance}`,
    };
  }

  /**
   * Obter nota educativa contextualizada
   * @private
   */
  static getEducationalNote(context, isCorrect, empathyScore) {
    const notes = {
      bullying_investigation: {
        correct:
          "📚 Investigar é importante para descobrir a verdade e proteger vítimas.",
        incorrect:
          "📚 A investigação responsável ajuda a compreender a situação.",
      },
      cyberbullying_recognition: {
        correct: "📚 Reconhecer cyberbullying é o primeiro passo para ajudar.",
        incorrect:
          "📚 Cyberbullying pode ser subtil. Presta atenção às emoções envolvidas.",
      },
      empathy_building: {
        correct: "❤️ Mostrar empatia é reconhecer o sofrimento alheio e agir.",
        incorrect:
          "❤️ A empatia verdadeira vai além de sentir pena - é compreender e atuar.",
      },
      victim_support: {
        correct: "🤝 Apoiar a vítima é um ato de coragem e solidariedade.",
        incorrect: "🤝 Considere: o que a vítima realmente precisa?",
      },
      bystander_effect: {
        correct:
          "👥 Você escolheu não ser espectador - essa é uma decisão importante.",
        incorrect: "👥 Os espectadores têm o poder de mudar uma situação.",
      },
      group_dynamics: {
        correct:
          "💬 Reconhecer a pressão do grupo e resisti-la mostra maturidade.",
        incorrect:
          "💬 A pressão grupal é real, mas as consequências das nossas escolhas também.",
      },
    };

    return notes[context]?.[isCorrect ? "correct" : "incorrect"] || "";
  }

  /**
   * Obter insight sobre personagem
   * @private
   */
  static getCharacterInsight(scenario, puzzle) {
    const characterInsights = {
      scenario_1: {
        investigacao:
          "🔍 Bia está assustada. Sua investigação pode ajudá-la a sentir-se segura.",
        decisao:
          "⚖️ Lembre-se: Bia não escolheu esta situação. Sua escolha pode fazer a diferença.",
      },
      scenario_2: {
        pressao_grupo:
          "👥 O grupo é poderoso, mas nem todos pensam igual. Sua voz importa.",
        solidariedade:
          "💪 Bia precisa de alguém que a veja como uma pessoa, não como um alvo.",
      },
    };

    if (characterInsights[scenario]) {
      const insightType = puzzle.id?.includes("investigacao")
        ? "investigacao"
        : "decisao";
      return `\n\n${characterInsights[scenario][insightType] || ""}`;
    }

    return "";
  }

  /**
   * Obter dica mais forte
   * @private
   */
  static getStrongerHint(puzzle) {
    if (puzzle.hints && puzzle.hints[1]) {
      return puzzle.hints[1].text;
    }
    return "Pensa em quem seria beneficiado com isto...";
  }

  /**
   * Obter explicação
   * @private
   */
  static getExplanation(puzzle) {
    return (
      puzzle.feedback?.explanation ||
      "A resposta correcta leva em conta o bem-estar de todos."
    );
  }

  /**
   * Obter abordagem alternativa
   * @private
   */
  static getAlternativeApproach(puzzle) {
    return "Vamos explorar isto de um ângulo diferente...";
  }

  /**
   * Obter encorajamento baseado em score de empatia
   * @private
   */
  static getEncouragement(empathyScore) {
    if (empathyScore >= 80) {
      return "✨ Você está demonstrando uma compreensão notável!";
    } else if (empathyScore >= 60) {
      return "👏 Bom trabalho! Continua a desenvolver essa empatia.";
    } else if (empathyScore >= 40) {
      return "💭 Está no caminho certo. Tente colocar-se no lugar dos outros.";
    } else {
      return "🌱 Cada decisão é uma oportunidade de crescer.";
    }
  }

  /**
   * Gerar mensagem de conclusão do puzzle
   * @param {Object} puzzleResult - Resultado da validação
   * @param {Object} context - Contexto do jogador
   * @returns {Object} Mensagem de conclusão
   */
  static generateCompletionMessage(puzzleResult, context) {
    const {
      pointsEarned = 0,
      empathyChange = 0,
      hintsUnlocked = [],
    } = puzzleResult;

    let message = "🎯 Puzzle Resolvido!\n\n";

    if (pointsEarned > 0) {
      message += `⭐ +${pointsEarned} pontos\n`;
    }

    if (empathyChange !== 0) {
      const emoji = empathyChange > 0 ? "❤️" : "💔";
      message += `${emoji} Empatia ${empathyChange > 0 ? "+" : ""}${empathyChange}\n`;
    }

    if (hintsUnlocked.length > 0) {
      message += `\n🔓 ${hintsUnlocked.length} pista(s) desbloqueada(s)!\n`;
    }

    return {
      title: "🎯 Progresso!",
      message: message.trim(),
      rewards: {
        points: pointsEarned,
        empathyChange,
        hintsUnlocked: hintsUnlocked.length,
      },
    };
  }

  /**
   * Gerar resumo de lições aprendidas
   * @param {Array} puzzleResults - Resultados de todos os puzzles
   * @returns {Array} Lista de lições
   */
  static extractLearningOutcomes(puzzleResults) {
    const outcomes = [];

    // Análise de padrões
    const correctAnswers = puzzleResults.filter((r) => r.isCorrect).length;
    const totalPuzzles = puzzleResults.length;
    const successRate = Math.round((correctAnswers / totalPuzzles) * 100);

    outcomes.push({
      category: "Análise e Investigação",
      outcome:
        successRate >= 70
          ? "Demonstrou capacidade forte de análise crítica"
          : "Pode melhorar a análise situacional",
      successRate,
    });

    const empathyMentions = puzzleResults.filter(
      (r) => r.explanation?.includes("empat") || false,
    ).length;
    outcomes.push({
      category: "Sensibilidade Emocional",
      outcome:
        empathyMentions >= 2
          ? "Mostrou compreensão emocional profunda"
          : "Trabalha na compreensão das emoções alheias",
      evidence: empathyMentions,
    });

    const responseQuality = correctAnswers / Math.max(totalPuzzles, 1);
    outcomes.push({
      category: "Responsabilidade Social",
      outcome:
        responseQuality >= 0.7
          ? "Demonstrou decisões socialmente responsáveis"
          : "Reconsidera o impacto social das ações",
      quality: Math.round(responseQuality * 100),
    });

    return outcomes;
  }

  /**
   * Gerar mensagem de conclusão de cenário
   * @param {Object} sessionStats - Estatísticas da sessão
   * @returns {Object} Mensagem de conclusão
   */
  static generateScenarioCompletion(sessionStats) {
    const {
      totalPuzzles,
      solvedPuzzles,
      finalEmpathyScore,
      totalPoints,
      bulliedCharacter = "Bia",
    } = sessionStats;

    let message = `🎬 Cenário Concluído!\n\n`;
    message += `Você ajudou ${bulliedCharacter}.\n`;
    message += `Resolveu ${solvedPuzzles} de ${totalPuzzles} puzzles.\n`;
    message += `Empatia Final: ${finalEmpathyScore}/100\n`;
    message += `Pontos Totais: ${totalPoints}`;

    const moraleMessage = this.generateMoraleMessage(finalEmpathyScore);

    return {
      title: "🎬 Parabéns!",
      message,
      moraleBoost: moraleMessage,
      nextAction: "Quer tentar outro cenário?",
    };
  }

  /**
   * Gerar mensagem de moralidade
   * @private
   */
  static generateMoraleMessage(empathyScore) {
    if (empathyScore >= 85) {
      return "✨ Você foi um verdadeiro campeão da empatia e justiça!";
    } else if (empathyScore >= 70) {
      return "👏 Você fez uma diferença real na vida de Bia.";
    } else if (empathyScore >= 50) {
      return "🌱 Você tomou decisões responsáveis. Continue a crescer.";
    } else {
      return "💭 Reflexão: Como poderia ter agido com mais compreensão?";
    }
  }
}

export default EducationalFeedback;
