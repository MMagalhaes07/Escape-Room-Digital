/**
 * UTILITY: PuzzleValidator
 *
 * Valida respostas de puzzles e gera feedback educativo
 * Suporta diferentes tipos de puzzles com lógica customizada
 */

export class PuzzleValidator {
  /**
   * Validar resposta de puzzle
   * @param {Object} puzzle - Definição do puzzle
   * @param {string} playerAnswer - Resposta do jogador
   * @param {Object} context - Contexto do jogador (empathy, attempts, etc)
   * @returns {Object} { isCorrect, score, feedback, hintsToUnlock }
   */
  static validate(puzzle, playerAnswer, context = {}) {
    const { type } = puzzle;

    switch (type) {
      case "multiple_choice":
        return this.validateMultipleChoice(puzzle, playerAnswer, context);
      case "text_validation":
        return this.validateTextValidation(puzzle, playerAnswer, context);
      case "ordering":
        return this.validateOrdering(puzzle, playerAnswer, context);
      case "matching":
        return this.validateMatching(puzzle, playerAnswer, context);
      default:
        throw new Error(`Unknown puzzle type: ${type}`);
    }
  }

  /**
   * Validar puzzle de escolha múltipla
   * @private
   */
  static validateMultipleChoice(puzzle, playerAnswer, context) {
    const isCorrect =
      playerAnswer.toUpperCase() ===
      puzzle.expected_answers.correct.toUpperCase();
    const score = isCorrect ? 100 : 0;

    const attempts = context.attemptCount || 1;
    const empathy = context.empathyScore || 0;

    let feedback;
    if (isCorrect) {
      feedback = this.generateCorrectFeedback(puzzle, context);
    } else {
      feedback = this.generateIncorrectFeedback(puzzle, attempts, context);
    }

    return {
      isCorrect,
      score,
      feedback,
      explanation: puzzle.feedback[isCorrect ? "correct" : "incorrect"],
      hintsToUnlock: isCorrect ? [] : this.getHintsForAttempt(puzzle, attempts),
    };
  }

  /**
   * Validar puzzle de validação de texto
   * @private
   */
  static validateTextValidation(puzzle, playerAnswer, context) {
    const sanitized = playerAnswer.toLowerCase().trim();
    const correct = puzzle.expected_answers.correct.toLowerCase().trim();

    // Comparação exata ou com tolerância (conforme config)
    const isCorrect = sanitized === correct;
    const score = isCorrect ? 100 : 0;

    const attempts = context.attemptCount || 1;
    let feedback;

    if (isCorrect) {
      feedback = this.generateCorrectFeedback(puzzle, context);
    } else {
      feedback = this.generateIncorrectFeedback(puzzle, attempts, context);
    }

    return {
      isCorrect,
      score,
      feedback,
      explanation: puzzle.feedback[isCorrect ? "correct" : "incorrect"],
      hintsToUnlock: isCorrect ? [] : this.getHintsForAttempt(puzzle, attempts),
      playerAnswer: sanitized, // Log para análise
    };
  }

  /**
   * Validar puzzle de ordenação
   * @private
   */
  static validateOrdering(puzzle, playerAnswer, context) {
    // playerAnswer deve ser array de IDs em ordem
    const isCorrect =
      JSON.stringify(playerAnswer) ===
      JSON.stringify(puzzle.expected_answers.correctOrder);
    const score = isCorrect ? 100 : 0;

    const attempts = context.attemptCount || 1;
    let feedback;

    if (isCorrect) {
      feedback = this.generateCorrectFeedback(puzzle, context);
    } else {
      feedback = this.generateIncorrectFeedback(puzzle, attempts, context);
    }

    // Calcular score parcial se houver items corretos na posição
    let partialScore = 0;
    if (!isCorrect) {
      const correctCount = playerAnswer.filter(
        (item, idx) => item === puzzle.expected_answers.correctOrder[idx],
      ).length;
      partialScore = Math.round(
        (correctCount / puzzle.expected_answers.correctOrder.length) * 100,
      );
    }

    return {
      isCorrect,
      score: isCorrect ? 100 : Math.max(partialScore, 30), // Mínimo 30 para ordem parcial
      feedback,
      explanation: puzzle.feedback[isCorrect ? "correct" : "incorrect"],
      hintsToUnlock: isCorrect ? [] : this.getHintsForAttempt(puzzle, attempts),
      partialScore,
    };
  }

  /**
   * Validar puzzle de matching
   * @private
   */
  static validateMatching(puzzle, playerAnswer, context) {
    // playerAnswer = { "1": "A", "2": "B", ... }
    const isCorrect =
      JSON.stringify(playerAnswer) ===
      JSON.stringify(puzzle.expected_answers.correctMatches);
    const score = isCorrect ? 100 : 0;

    const attempts = context.attemptCount || 1;
    let feedback;

    if (isCorrect) {
      feedback = this.generateCorrectFeedback(puzzle, context);
    } else {
      feedback = this.generateIncorrectFeedback(puzzle, attempts, context);
    }

    // Calcular score parcial
    let correctMatches = 0;
    if (!isCorrect) {
      for (const [key, value] of Object.entries(playerAnswer)) {
        if (puzzle.expected_answers.correctMatches[key] === value) {
          correctMatches++;
        }
      }
    }
    const totalMatches = Object.keys(
      puzzle.expected_answers.correctMatches,
    ).length;
    const partialScore = Math.round((correctMatches / totalMatches) * 100);

    return {
      isCorrect,
      score: isCorrect ? 100 : Math.max(partialScore, 30),
      feedback,
      explanation: puzzle.feedback[isCorrect ? "correct" : "incorrect"],
      hintsToUnlock: isCorrect ? [] : this.getHintsForAttempt(puzzle, attempts),
      correctMatches,
      totalMatches,
    };
  }

  /**
   * Gerar feedback para resposta correta
   * @private
   */
  static generateCorrectFeedback(puzzle, context) {
    const baseMessage = puzzle.feedback.correct || "Correto! Você tem razão!";

    // Adaptar baseado no contexto do jogador
    const empathy = context.empathyScore || 0;
    const isBullyingRelated = puzzle.educationalContext?.includes("bullying");

    if (isBullyingRelated && empathy < 50) {
      return `${baseMessage}\n\n💡 Dica: Considera como a vítima se sentiria nesta situação.`;
    }

    if (isBullyingRelated && empathy >= 80) {
      return `${baseMessage}\n\n✨ Excelente! Você mostrou compreensão real da situação.`;
    }

    return baseMessage;
  }

  /**
   * Gerar feedback para resposta incorreta
   * @private
   */
  static generateIncorrectFeedback(puzzle, attempts, context) {
    const baseMessage =
      puzzle.feedback.incorrect || "Não exatamente. Tenta novamente!";

    // Escalonar dicas baseadas em tentativas
    if (attempts === 1) {
      return `${baseMessage}\n\n🤔 Dica: Considera cuidadosamente...`;
    } else if (attempts === 2) {
      return `${baseMessage}\n\n📌 Dica Forte: ${puzzle.hints?.[0]?.text || "Repensa a questão..."}`;
    } else if (attempts >= 3) {
      const explanation =
        puzzle.feedback.explanation || "A resposta correta é...";
      return `${baseMessage}\n\n📚 Explicação:\n${explanation}`;
    }

    return baseMessage;
  }

  /**
   * Obter pistas a desbloquear baseado em tentativas
   * @private
   */
  static getHintsForAttempt(puzzle, attemptCount) {
    if (!puzzle.hints || puzzle.hints.length === 0) {
      return [];
    }

    // Retornar pistas cujo attemptThreshold foi atingido
    return puzzle.hints
      .filter((hint) => hint.attemptThreshold <= attemptCount)
      .map((hint) => hint.id);
  }

  /**
   * Calcular pontos baseado em performance
   * @param {Object} validation - Resultado de validação
   * @param {Object} context - Contexto (attempts, timeSpent, difficulty)
   * @returns {number} Pontos ganhos
   */
  static calculatePoints(validation, context) {
    if (!validation.isCorrect) {
      return 0; // Sem pontos para respostas incorretas
    }

    const basePoints = context.difficulty ? context.difficulty * 10 : 50;
    const attempts = context.attemptCount || 1;
    const timeSpent = context.timeSpent || 0;

    // Bónus por poucas tentativas
    let attemptBonus = 0;
    if (attempts === 1) {
      attemptBonus = basePoints * 0.5;
    } else if (attempts === 2) {
      attemptBonus = basePoints * 0.25;
    }

    // Bónus por tempo rápido (não ultra-rápido = suspeito)
    let timeBonus = 0;
    if (timeSpent >= 10 && timeSpent <= 300) {
      // Entre 10s e 5min
      timeBonus = basePoints * 0.1;
    }

    return Math.floor(basePoints + attemptBonus + timeBonus);
  }

  /**
   * Calcular mudança de empatia baseado na resposta
   * @param {Object} puzzle - Definição do puzzle
   * @param {Object} validation - Resultado de validação
   * @returns {number} Mudança de empatia (-30 a +30)
   */
  static calculateEmpathyChange(puzzle, validation) {
    if (!puzzle.educationalContext?.includes("bullying")) {
      return 0; // Sem mudança de empatia para puzzles não-educacionais
    }

    if (!validation.isCorrect) {
      return -5; // -5 empatia por resposta incorreta educacional
    }

    // +10 a +20 baseado em score
    const score = validation.score;
    if (score >= 100) return 20;
    if (score >= 80) return 15;
    if (score >= 60) return 10;
    return 5;
  }
}

export default PuzzleValidator;
