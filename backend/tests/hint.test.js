/**
 * TESTS: Hint System Tests
 *
 * Testes unitários para:
 * - HintEngine
 * - HintModel
 * - PlayerHintModel
 *
 * Executa: npm test -- hint.test.js
 */

import { describe, test, expect, beforeAll } from "@jest/globals";
import { HintEngine } from "../utils/HintEngine.js";
import HintModel, { PlayerHintModel } from "../models/HintModel.js";

// ============================================================================
// SUITE: HintModel Tests
// ============================================================================

describe("HintModel", () => {
  const testHint = {
    id: "test_hint_1",
    puzzleId: "test_puzzle_1",
    tier: 1,
    title: "Test Hint",
    content: "This is a test hint",
    unblockConditions: { attemptThreshold: 1 },
    priority: 1,
    bullying_context: "bullying_investigation",
    educational_value: { learningOutcome: "Test outcome" },
  };

  test("deve criar pista", async () => {
    const hint = await HintModel.create(testHint);
    expect(hint.id).toBe(testHint.id);
    expect(hint.title).toBe(testHint.title);
  });

  test("deve recuperar pista por ID", async () => {
    const hint = await HintModel.getById(testHint.id);
    expect(hint).toBeDefined();
    expect(hint.content).toBe(testHint.content);
  });

  test("deve listar pistas por puzzle", async () => {
    const hints = await HintModel.getByPuzzle(testHint.puzzleId);
    expect(Array.isArray(hints)).toBe(true);
  });

  test("deve obter progressão de pistas por tier", async () => {
    const hints = await HintModel.getProgression(testHint.puzzleId, 2);
    expect(Array.isArray(hints)).toBe(true);
    hints.forEach((h) => {
      expect(h.tier).toBeLessThanOrEqual(2);
    });
  });

  test("deve atualizar pista", async () => {
    const updated = await HintModel.update(testHint.id, {
      title: "Updated Hint",
    });
    expect(updated.title).toBe("Updated Hint");
  });

  test("deve deletar pista", async () => {
    const deleted = await HintModel.delete(testHint.id);
    expect(deleted).toBe(true);
  });
});

// ============================================================================
// SUITE: HintEngine Tests
// ============================================================================

describe("HintEngine", () => {
  describe("checkUnlockConditions", () => {
    test("deve desbloquear pista sem condições", () => {
      const hint = { id: "test", unlock_conditions: {} };
      const result = HintEngine.checkUnlockConditions(hint, {});
      expect(result).toBe(true);
    });

    test("deve desbloquear pista quando attemptThreshold atingido", () => {
      const hint = {
        id: "test",
        unlock_conditions: { attempt_threshold: 2 },
      };
      const result = HintEngine.checkUnlockConditions(hint, {
        attemptCount: 2,
      });
      expect(result).toBe(true);
    });

    test("não deve desbloquear pista quando attemptThreshold não atingido", () => {
      const hint = {
        id: "test",
        unlock_conditions: { attempt_threshold: 3 },
      };
      const result = HintEngine.checkUnlockConditions(hint, {
        attemptCount: 1,
      });
      expect(result).toBe(false);
    });

    test("deve desbloquear pista quando timeThreshold atingido", () => {
      const hint = {
        id: "test",
        unlock_conditions: { time_threshold: 60 },
      };
      const result = HintEngine.checkUnlockConditions(hint, {
        timeSpent: 60,
      });
      expect(result).toBe(true);
    });

    test("não deve desbloquear pista quando timeThreshold não atingido", () => {
      const hint = {
        id: "test",
        unlock_conditions: { time_threshold: 120 },
      };
      const result = HintEngine.checkUnlockConditions(hint, {
        timeSpent: 30,
      });
      expect(result).toBe(false);
    });

    test("deve desbloquear pista quando empathyThreshold atingido", () => {
      const hint = {
        id: "test",
        unlock_conditions: { empathy_threshold: 60 },
      };
      const result = HintEngine.checkUnlockConditions(hint, {
        empathyScore: 70,
      });
      expect(result).toBe(true);
    });

    test("não deve desbloquear pista quando empathyThreshold não atingido", () => {
      const hint = {
        id: "test",
        unlock_conditions: { empathy_threshold: 80 },
      };
      const result = HintEngine.checkUnlockConditions(hint, {
        empathyScore: 50,
      });
      expect(result).toBe(false);
    });

    test("deve desbloquear pista quando puzzlesSolvedThreshold atingido", () => {
      const hint = {
        id: "test",
        unlock_conditions: { puzzles_solved_threshold: 2 },
      };
      const result = HintEngine.checkUnlockConditions(hint, {
        puzzlesSolved: 3,
      });
      expect(result).toBe(true);
    });

    test("deve respeitar múltiplas condições (AND logic)", () => {
      const hint = {
        id: "test",
        unlock_conditions: {
          attempt_threshold: 2,
          time_threshold: 60,
          empathy_threshold: 50,
        },
      };

      // Todas as condições atingidas
      const result1 = HintEngine.checkUnlockConditions(hint, {
        attemptCount: 2,
        timeSpent: 60,
        empathyScore: 50,
      });
      expect(result1).toBe(true);

      // Uma condição não atingida
      const result2 = HintEngine.checkUnlockConditions(hint, {
        attemptCount: 2,
        timeSpent: 30, // Não atingido
        empathyScore: 50,
      });
      expect(result2).toBe(false);
    });
  });

  describe("getSuggestion", () => {
    test("deve sugerir ajuda após múltiplas tentativas", () => {
      const suggestion = HintEngine.getSuggestion({
        attemptCount: 3,
        timeSpent: 100,
        empathyScore: 50,
      });
      expect(suggestion).toBeTruthy();
      expect(suggestion).toContain("tentou");
    });

    test("deve sugerir ajuda após tempo longo", () => {
      const suggestion = HintEngine.getSuggestion({
        attemptCount: 1,
        timeSpent: 200, // Entre 3-4 min
        empathyScore: 50,
      });
      expect(suggestion).toBeTruthy();
    });

    test("deve sugerir reflexão sobre empatia se score baixo", () => {
      const suggestion = HintEngine.getSuggestion({
        attemptCount: 1,
        timeSpent: 30,
        empathyScore: 20,
      });
      expect(suggestion).toBeTruthy();
      expect(suggestion).toContain("empatia");
    });

    test("deve retornar null se nenhuma sugestão aplicável", () => {
      const suggestion = HintEngine.getSuggestion({
        attemptCount: 1,
        timeSpent: 10,
        empathyScore: 80,
      });
      expect(suggestion).toBeNull();
    });
  });

  describe("groupHintsByTier", () => {
    test("deve agrupar pistas por tier", () => {
      const hints = [
        { tier: 1, id: "h1", was_viewed: true },
        { tier: 1, id: "h2", was_viewed: false },
        { tier: 2, id: "h3", was_viewed: true },
      ];

      const grouped = HintEngine.groupHintsByTier(hints);

      expect(grouped[1]).toHaveLength(2);
      expect(grouped[2]).toHaveLength(1);
      expect(grouped[1][0].id).toBe("h1");
    });

    test("deve incluir status de visualização", () => {
      const hints = [
        { tier: 1, id: "h1", was_viewed: true },
        { tier: 1, id: "h2", was_viewed: false },
      ];

      const grouped = HintEngine.groupHintsByTier(hints);

      expect(grouped[1][0].viewed).toBe(true);
      expect(grouped[1][1].viewed).toBe(false);
    });
  });
});

// ============================================================================
// SUITE: PlayerHintModel Tests
// ============================================================================

describe("PlayerHintModel", () => {
  const testUnlock = {
    id: "test_unlock_1",
    playerId: "player_1",
    hintId: "hint_1",
    puzzleId: "puzzle_1",
    unlockedBy: "puzzle_solved",
  };

  test("deve desbloquear pista", async () => {
    const record = await PlayerHintModel.unlock(testUnlock);
    expect(record.id).toBe(testUnlock.id);
    expect(record.was_viewed).toBe(false);
  });

  test("deve verificar se pista está desbloqueada", async () => {
    const isUnlocked = await PlayerHintModel.isUnlocked(
      testUnlock.playerId,
      testUnlock.hintId,
    );
    expect(typeof isUnlocked).toBe("boolean");
  });

  test("deve marcar pista como vista", async () => {
    const marked = await PlayerHintModel.markViewed(
      testUnlock.playerId,
      testUnlock.hintId,
    );
    expect(marked.was_viewed).toBe(true);
  });

  test("deve listar pistas desbloqueadas por jogador", async () => {
    const hints = await PlayerHintModel.getUnlocked(testUnlock.playerId);
    expect(Array.isArray(hints)).toBe(true);
  });

  test("deve listar pistas não vistas", async () => {
    const unviewed = await PlayerHintModel.getUnviewed(testUnlock.playerId);
    expect(Array.isArray(unviewed)).toBe(true);
  });

  test("deve listar pistas por puzzle", async () => {
    const hints = await PlayerHintModel.getByPuzzle(
      testUnlock.playerId,
      testUnlock.puzzleId,
    );
    expect(Array.isArray(hints)).toBe(true);
  });
});

// ============================================================================
// SUITE: Edge Cases
// ============================================================================

describe("Hint System Edge Cases", () => {
  test("deve lidar com pista sem condições de desbloqueio", async () => {
    const hint = { id: "test", unlock_conditions: null };
    const result = HintEngine.checkUnlockConditions(hint, {});
    expect(result).toBe(true);
  });

  test("deve lidar com contexto de jogador vazio", () => {
    const hint = {
      id: "test",
      unlock_conditions: { attempt_threshold: 2 },
    };
    const result = HintEngine.checkUnlockConditions(hint, {
      attemptCount: undefined,
    });
    expect(result).toBe(false);
  });

  test("deve validar progressão de tiers", async () => {
    const hints = [
      { tier: 1, id: "h1" },
      { tier: 2, id: "h2" },
      { tier: 3, id: "h3" },
    ];

    // Simular ordenação
    const sorted = hints.sort((a, b) => a.tier - b.tier);
    expect(sorted[0].tier).toBe(1);
    expect(sorted[2].tier).toBe(3);
  });
});

// ============================================================================
// SUITE: Integration Tests
// ============================================================================

describe("Hint System Integration", () => {
  test("fluxo completo: puzzle → pistas → desbloqueio", async () => {
    // Simular fluxo
    const playerContext = {
      playerId: "player_1",
      puzzleId: "puzzle_1",
      attemptCount: 2,
      timeSpent: 45,
      empathyScore: 60,
      puzzlesSolved: 1,
    };

    // Verificar se pistas devem ser desbloqueadas
    const hints = [
      { id: "h1", unlock_conditions: { attempt_threshold: 1 } },
      { id: "h2", unlock_conditions: { attempt_threshold: 2 } },
      { id: "h3", unlock_conditions: { attempt_threshold: 3 } },
    ];

    const shouldUnlock = hints.filter((h) =>
      HintEngine.checkUnlockConditions(h, playerContext),
    );

    expect(shouldUnlock).toHaveLength(2); // h1 e h2
  });

  test("contexto educativo influencia desbloqueio de pistas", () => {
    const hint = {
      id: "empathy_hint",
      unlock_conditions: { empathy_threshold: 70 },
    };

    const lowEmpathyContext = { empathyScore: 50 };
    const highEmpathyContext = { empathyScore: 80 };

    const shouldUnlock1 = HintEngine.checkUnlockConditions(
      hint,
      lowEmpathyContext,
    );
    const shouldUnlock2 = HintEngine.checkUnlockConditions(
      hint,
      highEmpathyContext,
    );

    expect(shouldUnlock1).toBe(false);
    expect(shouldUnlock2).toBe(true);
  });
});

export default {};
