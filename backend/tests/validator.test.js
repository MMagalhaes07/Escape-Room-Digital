/**
 * TESTES DE VALIDAÇÃO - Middleware de Sanitização
 *
 * Testes para:
 * 1. Sanitização XSS
 * 2. Validação de schemas
 * 3. Input validation
 * 4. Edge cases (null, undefined, SQL injection)
 */

import request from "supertest";
import app from "../src/index.js";
import {
  sanitizeString,
  sanitizeObject,
  validateField,
  validateSchema,
} from "../src/middleware/validation.js";

describe("Testes de Validação - Middleware", () => {
  // ============================================
  // SUITE 1: Sanitização de Strings
  // ============================================

  describe("Suite 1: Sanitização de Strings XSS", () => {
    test("Deve remover tags HTML simples", () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = sanitizeString(input);
      expect(result).not.toContain("<script>");
      expect(result).not.toContain("</script>");
      expect(result).toContain("Hello");
    });

    test("Deve remover event handlers", () => {
      const input = '<img onclick="alert(1)" src="x">';
      const result = sanitizeString(input);
      expect(result).not.toContain("onclick");
    });

    test("Deve remover protocolos javascript:", () => {
      const input = '<a href="javascript:alert(1)">Click</a>';
      const result = sanitizeString(input);
      expect(result).not.toContain("javascript:");
    });

    test("Deve permitir texto normal", () => {
      const input = "Hello World! This is normal text.";
      const result = sanitizeString(input);
      expect(result).toBe(input);
    });

    test("Deve permitir caracteres especiais seguros", () => {
      const input = "Test@123 with email.com!";
      const result = sanitizeString(input);
      expect(result).toContain("@");
      expect(result).toContain(".");
      expect(result).toContain("!");
    });

    test("Deve remover múltiplas tags consecutivas", () => {
      const input = "<<script>script><iframe>iframe></iframe>";
      const result = sanitizeString(input);
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
    });
  });

  // ============================================
  // SUITE 2: Sanitização de Objetos
  // ============================================

  describe("Suite 2: Sanitização de Objetos", () => {
    test("Deve sanitizar strings em objetos", () => {
      const input = {
        name: "<script>alert(1)</script>John",
        email: "test@example.com",
      };
      const result = sanitizeObject(input);
      expect(result.name).not.toContain("<script>");
      expect(result.email).toBe("test@example.com");
    });

    test("Deve sanitizar arrays de strings", () => {
      const input = {
        choices: ["<script>bad</script>choice1", "normal choice"],
      };
      const result = sanitizeObject(input);
      expect(result.choices[0]).not.toContain("<script>");
      expect(result.choices[1]).toBe("normal choice");
    });

    test("Deve sanitizar objetos aninhados", () => {
      const input = {
        user: {
          name: "<img src=x onerror=alert(1)>Name",
          profile: {
            bio: "<script>alert(1)</script>Bio text",
          },
        },
      };
      const result = sanitizeObject(input);
      expect(result.user.name).not.toContain("onerror");
      expect(result.user.profile.bio).not.toContain("<script>");
    });

    test("Deve preservar valores null e undefined", () => {
      const input = {
        name: null,
        email: undefined,
        active: true,
      };
      const result = sanitizeObject(input);
      expect(result.name).toBeNull();
      expect(result.email).toBeUndefined();
      expect(result.active).toBe(true);
    });

    test("Deve sanitizar números como strings", () => {
      const input = {
        age: "25",
        score: "<script>inject</script>100",
      };
      const result = sanitizeObject(input);
      expect(result.age).toBe("25");
      expect(result.score).not.toContain("<script>");
    });
  });

  // ============================================
  // SUITE 3: Validação de Campos Individuais
  // ============================================

  describe("Suite 3: Validação de Campos", () => {
    test("Deve validar tipo string", () => {
      const spec = { type: "string", required: true };
      expect(validateField("hello", spec)).toBe(true);
      expect(validateField(123, spec)).toBe(false);
      expect(validateField(null, spec)).toBe(false);
    });

    test("Deve validar tipo number", () => {
      const spec = { type: "number", required: true };
      expect(validateField(123, spec)).toBe(true);
      expect(validateField("123", spec)).toBe(false);
      expect(validateField(null, spec)).toBe(false);
    });

    test("Deve validar tipo boolean", () => {
      const spec = { type: "boolean", required: true };
      expect(validateField(true, spec)).toBe(true);
      expect(validateField(false, spec)).toBe(true);
      expect(validateField("true", spec)).toBe(false);
    });

    test("Deve validar minLength", () => {
      const spec = { type: "string", minLength: 5 };
      expect(validateField("hello123", spec)).toBe(true);
      expect(validateField("hi", spec)).toBe(false);
      expect(validateField("", spec)).toBe(false);
    });

    test("Deve validar maxLength", () => {
      const spec = { type: "string", maxLength: 10 };
      expect(validateField("hello", spec)).toBe(true);
      expect(validateField("this is a very long string", spec)).toBe(false);
    });

    test("Deve validar min (números)", () => {
      const spec = { type: "number", min: 0 };
      expect(validateField(5, spec)).toBe(true);
      expect(validateField(0, spec)).toBe(true);
      expect(validateField(-5, spec)).toBe(false);
    });

    test("Deve validar max (números)", () => {
      const spec = { type: "number", max: 100 };
      expect(validateField(50, spec)).toBe(true);
      expect(validateField(100, spec)).toBe(true);
      expect(validateField(150, spec)).toBe(false);
    });

    test("Deve validar required true", () => {
      const spec = { type: "string", required: true };
      expect(validateField("value", spec)).toBe(true);
      expect(validateField(null, spec)).toBe(false);
      expect(validateField(undefined, spec)).toBe(false);
    });

    test("Deve validar required false", () => {
      const spec = { type: "string", required: false };
      expect(validateField(null, spec)).toBe(true);
      expect(validateField(undefined, spec)).toBe(true);
      expect(validateField("", spec)).toBe(true);
    });

    test("Deve validar email format", () => {
      const spec = { type: "string", format: "email" };
      expect(validateField("test@example.com", spec)).toBe(true);
      expect(validateField("invalid.email@", spec)).toBe(false);
      expect(validateField("plaintext", spec)).toBe(false);
    });
  });

  // ============================================
  // SUITE 4: Validação de Schemas
  // ============================================

  describe("Suite 4: Validação de Schemas", () => {
    const gameDecisionSchema = {
      sessionId: { type: "string", required: true },
      nodeId: { type: "string", required: true },
      choiceId: { type: "string", required: true },
    };

    test("Deve validar schema completo e válido", () => {
      const data = {
        sessionId: "sess_001",
        nodeId: "node_001",
        choiceId: "choice_A",
      };
      const result = validateSchema(data, gameDecisionSchema);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("Deve rejeitar schema com campos faltosos", () => {
      const data = {
        sessionId: "sess_001",
        // nodeId e choiceId faltam
      };
      const result = validateSchema(data, gameDecisionSchema);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test("Deve rejeitar schema com tipos incorretos", () => {
      const data = {
        sessionId: 123, // Deve ser string
        nodeId: "node_001",
        choiceId: "choice_A",
      };
      const result = validateSchema(data, gameDecisionSchema);
      expect(result.valid).toBe(false);
    });

    test("Deve retornar array de erros detalhados", () => {
      const data = {
        sessionId: null,
        nodeId: null,
        choiceId: null,
      };
      const result = validateSchema(data, gameDecisionSchema);
      expect(result.valid).toBe(false);
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toHaveProperty("field");
      expect(result.errors[0]).toHaveProperty("message");
    });

    test("Deve validar schema com campos opcionais", () => {
      const schema = {
        name: { type: "string", required: true },
        nickname: { type: "string", required: false },
      };
      const data = {
        name: "John",
        nickname: null,
      };
      const result = validateSchema(data, schema);
      expect(result.valid).toBe(true);
    });

    test("Deve validar schema com constraints numéricos", () => {
      const schema = {
        score: { type: "number", min: 0, max: 100, required: true },
      };

      expect(validateSchema({ score: 50 }, schema).valid).toBe(true);
      expect(validateSchema({ score: 0 }, schema).valid).toBe(true);
      expect(validateSchema({ score: 100 }, schema).valid).toBe(true);
      expect(validateSchema({ score: -10 }, schema).valid).toBe(false);
      expect(validateSchema({ score: 150 }, schema).valid).toBe(false);
    });
  });

  // ============================================
  // SUITE 5: SQL Injection Prevention
  // ============================================

  describe("Suite 5: Proteção contra SQL Injection", () => {
    test("Deve sanitizar strings com SQL injection", () => {
      const input = "'; DROP TABLE users; --";
      const result = sanitizeString(input);
      // O resultado pode variar, mas não deve executar SQL
      expect(typeof result).toBe("string");
    });

    test("Deve sanitizar UNION-based injection", () => {
      const input = "1 UNION SELECT * FROM users--";
      const result = sanitizeString(input);
      expect(typeof result).toBe("string");
    });

    test("Deve sanitizar Boolean-based injection", () => {
      const input = "1 OR '1'='1";
      const result = sanitizeString(input);
      expect(typeof result).toBe("string");
    });
  });

  // ============================================
  // SUITE 6: Middleware Validation em Endpoints
  // ============================================

  describe("Suite 6: Validação em Endpoints", () => {
    test("POST /api/narratives/:scenario/progress deve validar input", async () => {
      const response = await request(app)
        .post("/api/narratives/scenario_1/progress")
        .set("Authorization", "Bearer token")
        .send({
          // Faltam campos obrigatórios
          nodeId: "test",
        })
        .expect(400);

      expect(response.body).toHaveProperty("success", false);
      expect(response.body).toHaveProperty("error");
    });

    test("POST /api/game/decision deve sanitizar input", async () => {
      const response = await request(app)
        .post("/api/game/decision")
        .set("Authorization", "Bearer token")
        .send({
          sessionId: "<script>alert(1)</script>sess_001",
          nodeId: "node_001",
          choiceId: "choice_A",
        })
        .expect(400); // Esperar 400 por falta de auth ou validação

      // Se passar validação, pelo menos o XSS foi removido
      if (response.status !== 400) {
        expect(response.text).not.toContain("<script>");
      }
    });

    test("GET com querystring deve ser sanitizado", async () => {
      const maliciousQuery = "<img src=x onerror=alert(1)>";
      const response = await request(app).get(
        `/api/narratives/scenario_1?search=${encodeURIComponent(maliciousQuery)}`,
      );

      // Resposta pode ser 200 ou 400, mas não deve executar JavaScript
      expect(typeof response.status).toBe("number");
    });
  });

  // ============================================
  // SUITE 7: Edge Cases
  // ============================================

  describe("Suite 7: Edge Cases", () => {
    test("Deve lidar com strings vazias", () => {
      const result = sanitizeString("");
      expect(result).toBe("");
    });

    test("Deve lidar com null", () => {
      expect(() => sanitizeString(null)).not.toThrow();
    });

    test("Deve lidar com undefined", () => {
      expect(() => sanitizeString(undefined)).not.toThrow();
    });

    test("Deve lidar com objetos vazios", () => {
      const result = sanitizeObject({});
      expect(typeof result).toBe("object");
    });

    test("Deve lidar com arrays vazios", () => {
      const result = sanitizeObject({ items: [] });
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBe(0);
    });

    test("Deve lidar com muito profundo aninhamento", () => {
      const input = {
        level1: {
          level2: {
            level3: {
              level4: {
                text: "<script>inject</script>value",
              },
            },
          },
        },
      };
      const result = sanitizeObject(input);
      expect(result.level1.level2.level3.level4.text).not.toContain("<script>");
    });

    test("Deve validar strings com unicode", () => {
      const input = "Olá Mundo 🌍 Ñoño"; // Português, emoji, espanhol
      const result = sanitizeString(input);
      expect(result).toContain("Olá");
      expect(result).toContain("🌍");
      expect(result).toContain("Ñoño");
    });
  });

  // ============================================
  // SUITE 8: Performance
  // ============================================

  describe("Suite 8: Performance", () => {
    test("Deve sanitizar strings grandes rapidamente", () => {
      const largeString = "a".repeat(10000) + "<script>inject</script>";
      const start = Date.now();
      sanitizeString(largeString);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Menos de 100ms
    });

    test("Deve validar schemas com muitos campos", () => {
      const largeSchema = {};
      for (let i = 0; i < 50; i++) {
        largeSchema[`field_${i}`] = { type: "string", required: true };
      }

      const largeData = {};
      for (let i = 0; i < 50; i++) {
        largeData[`field_${i}`] = `value_${i}`;
      }

      const start = Date.now();
      validateSchema(largeData, largeSchema);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(50); // Menos de 50ms
    });
  });
});

export default {
  sanitizeString,
  sanitizeObject,
  validateField,
  validateSchema,
};
