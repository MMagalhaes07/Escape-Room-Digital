/**
 * TESTS: Puzzle System Tests
 *
 * Testes unitários para:
 * - PuzzleValidator
 * - PuzzleModel
 * - PuzzleController
 *
 * Executa: npm test -- puzzle.test.js
 */

import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import { PuzzleValidator } from "../utils/PuzzleValidator.js";
import PuzzleModel from "../models/PuzzleModel.js";
import { PuzzleAnswerModel } from "../models/HintModel.js";

// ============================================================================
// SUITE: PuzzleValidator Tests
// ============================================================================

describe("PuzzleValidator", () => {
  describe("validateMultipleChoice", () => {
    const puzzle = {
      id: "test_multiple",
      type: "multiple_choice",
      question: "Qual é a resposta?",
      expected_answers: {
        correct: "B",
      },
      feedback: {
        correct: "Correto!",
        incorrect: "Tenta novamente.",
      },
      difficulty: 1,
      educationalContext: "bullying_investigation",
      hints: [
        { id: "hint_1", attemptThreshold: 1, text: "Pista 1" },
        { id: "hint_2", attemptThreshold: 2, text: "Pista 2" },
      ],
    };

    test("deve validar resposta correta", () => {
      const result = PuzzleValidator.validate(puzzle, "B", {});
      expect(result.isCorrect).toBe(true);
      expect(result.score).toBe(100);
    });

    test("deve invalidar resposta incorreta", () => {
      const result = PuzzleValidator.validate(puzzle, "A", {});
      expect(result.isCorrect).toBe(false);
      expect(result.score).toBe(0);
    });

    test("deve ser case-insensitive", () => {
      const result = PuzzleValidator.validate(puzzle, "b", {});
      expect(result.isCorrect).toBe(true);
    });

    test("deve desbloquear pistas para resposta incorreta com tentativas", () => {
      const result = PuzzleValidator.validate(puzzle, "A", { attemptCount: 1 });
      expect(result.hintsToUnlock).toContain(puzzle.hints[0].id);
    });
  });

  describe("validateTextValidation", () => {
    const puzzle = {
      id: "test_text",
      type: "text_validation",
      question: "Qual é o e-mail?",
      expected_answers: {
        correct: "rodrigo@schoolclub.org",
      },
      feedback: {
        correct: "Correto!",
        incorrect: "Tenta novamente.",
      },
      difficulty: 2,
      hints: [],
    };

    test("deve validar resposta correta exata", () => {
      const result = PuzzleValidator.validate(
        puzzle,
        "rodrigo@schoolclub.org",
        {},
      );
      expect(result.isCorrect).toBe(true);
    });

    test("deve ser case-insensitive", () => {
      const result = PuzzleValidator.validate(
        puzzle,
        "RODRIGO@SCHOOLCLUB.ORG",
        {},
      );
      expect(result.isCorrect).toBe(true);
    });

    test("deve ignorar espaços extras", () => {
      const result = PuzzleValidator.validate(
        puzzle,
        "  rodrigo@schoolclub.org  ",
        {},
      );
      expect(result.isCorrect).toBe(true);
    });

    test("deve rejeitar resposta parcial", () => {
      const result = PuzzleValidator.validate(puzzle, "rodrigo@school", {});
      expect(result.isCorrect).toBe(false);
    });
  });

  describe("validateOrdering", () => {
    const puzzle = {
      id: "test_ordering",
      type: "ordering",
      question: "Coloca em ordem?",
      expected_answers: {
        correctOrder: ["1", "2", "3", "4"],
      },
      feedback: {
        correct: "Correto!",
        incorrect: "Tenta novamente.",
      },
      difficulty: 2,
      hints: [],
    };

    test("deve validar ordem correta", () => {
      const result = PuzzleValidator.validate(puzzle, ["1", "2", "3", "4"], {});
      expect(result.isCorrect).toBe(true);
      expect(result.score).toBe(100);
    });

    test("deve rejeitar ordem incorreta", () => {
      const result = PuzzleValidator.validate(puzzle, ["2", "1", "3", "4"], {});
      expect(result.isCorrect).toBe(false);
    });

    test("deve dar score parcial para ordem parcialmente correta", () => {
      const result = PuzzleValidator.validate(puzzle, ["1", "2", "4", "3"], {});
      expect(result.isCorrect).toBe(false);
      expect(result.score).toBeGreaterThan(30);
      expect(result.score).toBeLessThan(100);
    });
  });

  describe("validateMatching", () => {
    const puzzle = {
      id: "test_matching",
      type: "matching",
      question: "Liga cada item?",
      expected_answers: {
        correctMatches: { 1: "A", 2: "B", 3: "C" },
      },
      feedback: {
        correct: "Correto!",
        incorrect: "Tenta novamente.",
      },
      difficulty: 2,
      hints: [],
    };

    test("deve validar matching correto", () => {
      const result = PuzzleValidator.validate(
        puzzle,
        { 1: "A", 2: "B", 3: "C" },
        {},
      );
      expect(result.isCorrect).toBe(true);
      expect(result.score).toBe(100);
    });

    test("deve rejeitar matching incorreto", () => {
      const result = PuzzleValidator.validate(
        puzzle,
        { 1: "C", 2: "B", 3: "A" },
        {},
      );
      expect(result.isCorrect).toBe(false);
    });

    test("deve dar score parcial para matching parcialmente correto", () => {
      const result = PuzzleValidator.validate(
        puzzle,
        { 1: "A", 2: "C", 3: "B" },
        {},
      );
      expect(result.isCorrect).toBe(false);
      expect(result.score).toBeGreaterThan(30);
      expect(result.correctMatches).toBe(1);
      expect(result.totalMatches).toBe(3);
    });
  });

  describe("calculatePoints", () => {
    test("deve calcular pontos para resposta correta na 1ª tentativa", () => {
      const validation = { isCorrect: true, score: 100 };
      const context = { difficulty: 2, attemptCount: 1, timeSpent: 45 };
      const points = PuzzleValidator.calculatePoints(validation, context);
      expect(points).toBeGreaterThan(20);
    });

    test("deve dar menos pontos para múltiplas tentativas", () => {
      const validation = { isCorrect: true, score: 100 };
      const context1 = { difficulty: 2, attemptCount: 1, timeSpent: 45 };
      const context2 = { difficulty: 2, attemptCount: 3, timeSpent: 45 };

      const points1 = PuzzleValidator.calculatePoints(validation, context1);
      const points2 = PuzzleValidator.calculatePoints(validation, context2);

      expect(points1).toBeGreaterThan(points2);
    });

    test("deve dar 0 pontos para resposta incorreta", () => {
      const validation = { isCorrect: false, score: 0 };
      const context = { difficulty: 2, attemptCount: 1, timeSpent: 45 };
      const points = PuzzleValidator.calculatePoints(validation, context);
      expect(points).toBe(0);
    });
  });

  describe("calculateEmpathyChange", () => {
    const puzzleEducacional = {
      id: "test",
      type: "multiple_choice",
      educationalContext: "bullying_investigation",
    };

    const puzzleGeneral = {
      id: "test",
      type: "multiple_choice",
      educationalContext: "general",
    };

    test("deve retornar 0 para puzzle não-educacional", () => {
      const validation = { isCorrect: true, score: 100 };
      const change = PuzzleValidator.calculateEmpathyChange(
        puzzleGeneral,
        validation,
      );
      expect(change).toBe(0);
    });

    test("deve reduzir empatia para resposta incorreta educacional", () => {
      const validation = { isCorrect: false, score: 0 };
      const change = PuzzleValidator.calculateEmpathyChange(
        puzzleEducacional,
        validation,
      );
      expect(change).toBeLessThan(0);
    });

    test("deve aumentar empatia para resposta correta educacional", () => {
      const validation = { isCorrect: true, score: 100 };
      const change = PuzzleValidator.calculateEmpathyChange(
        puzzleEducacional,
        validation,
      );
      expect(change).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// SUITE: PuzzleModel Tests
// ============================================================================

describe("PuzzleModel", () => {
  const testPuzzle = {
    id: "test_puzzle_model",
    scenarioId: "scenario_1",
    type: "multiple_choice",
    question: "Test question?",
    difficulty: 2,
    educationalContext: "bullying_investigation",
    expectedAnswers: { correct: "A" },
    feedback: { correct: "Right!", incorrect: "Wrong!" },
  };

  test("deve criar puzzle", async () => {
    const puzzle = await PuzzleModel.create(testPuzzle);
    expect(puzzle.id).toBe(testPuzzle.id);
    expect(puzzle.type).toBe("multiple_choice");
  });

  test("deve recuperar puzzle por ID", async () => {
    const puzzle = await PuzzleModel.getById(testPuzzle.id);
    expect(puzzle).toBeDefined();
    expect(puzzle.question).toBe(testPuzzle.question);
  });

  test("deve listar puzzles por cenário", async () => {
    const puzzles = await PuzzleModel.getByScenario("scenario_1");
    expect(Array.isArray(puzzles)).toBe(true);
  });

  test("deve atualizar puzzle", async () => {
    const updated = await PuzzleModel.update(testPuzzle.id, {
      question: "Updated question?",
    });
    expect(updated.question).toBe("Updated question?");
  });

  test("deve deletar puzzle", async () => {
    const deleted = await PuzzleModel.delete(testPuzzle.id);
    expect(deleted).toBe(true);

    // Verificar que foi deletado
    expect(async () => {
      await PuzzleModel.getById(testPuzzle.id);
    }).rejects.toThrow();
  });
});

// ============================================================================
// SUITE: PuzzleAnswerModel Tests
// ============================================================================

describe("PuzzleAnswerModel", () => {
  const testAnswer = {
    id: "test_answer_1",
    sessionId: "test_session_1",
    puzzleId: "test_puzzle_1",
    playerAnswer: "B",
    isCorrect: true,
    score: 100,
    attemptNumber: 1,
    timeSpent: 45,
    feedback: "Correct!",
  };

  test("deve criar resposta", async () => {
    const answer = await PuzzleAnswerModel.create(testAnswer);
    expect(answer.id).toBe(testAnswer.id);
    expect(answer.is_correct).toBe(true);
  });

  test("deve contar tentativas", async () => {
    const count = await PuzzleAnswerModel.countAttempts(
      testAnswer.sessionId,
      testAnswer.puzzleId,
    );
    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThan(0);
  });

  test("deve verificar se puzzle foi resolvido", async () => {
    const isSolved = await PuzzleAnswerModel.isSolved(
      testAnswer.sessionId,
      testAnswer.puzzleId,
    );
    expect(typeof isSolved).toBe("boolean");
  });

  test("deve obter estatísticas de sessão", async () => {
    const stats = await PuzzleAnswerModel.getSessionStats(testAnswer.sessionId);
    expect(stats).toHaveProperty("total_attempts");
    expect(stats).toHaveProperty("correct_answers");
    expect(stats).toHaveProperty("average_score");
  });
});

// ============================================================================
// SUITE: Edge Cases e Erros
// ============================================================================

describe("Edge Cases", () => {
  test("deve lançar erro para tipo de puzzle desconhecido", () => {
    const puzzle = {
      type: "unknown_type",
      expected_answers: {},
    };
    expect(() => PuzzleValidator.validate(puzzle, "answer", {})).toThrow();
  });

  test("deve lidar com respostas vazias", () => {
    const puzzle = {
      type: "text_validation",
      expected_answers: { correct: "answer" },
      feedback: { correct: "OK", incorrect: "NO" },
      educationalContext: "general",
      hints: [],
    };
    const result = PuzzleValidator.validate(puzzle, "", {});
    expect(result.isCorrect).toBe(false);
  });

  test("deve lidar com contexto de jogador incompleto", () => {
    const puzzle = {
      type: "multiple_choice",
      expected_answers: { correct: "A" },
      feedback: { correct: "OK", incorrect: "NO" },
      educationalContext: "general",
      hints: [],
    };
    const result = PuzzleValidator.validate(puzzle, "A", {});
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(100);
  });
});

export default {};
