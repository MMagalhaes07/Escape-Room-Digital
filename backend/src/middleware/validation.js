/**
 * MIDDLEWARE: validation.js
 *
 * Validação e sanitização de inputs
 * - Validação de schemas para game decisions, puzzle answers, etc.
 * - Sanitização de dados (XSS prevention)
 * - Type checking e required fields
 */

/**
 * Esquemas de validação reutilizáveis
 */
const SCHEMAS = {
  // Decisões de jogo
  gameDecision: {
    sessionId: { type: "string", required: true, minLength: 1 },
    nodeId: { type: "string", required: true, minLength: 1 },
    choiceId: { type: "string", required: true, minLength: 1 },
  },

  // Sessões de jogo
  gameSession: {
    scenario: { type: "string", required: true, minLength: 1 },
    userId: { type: "string", required: true, minLength: 1 },
  },

  // Respostas de puzzle
  puzzleAnswer: {
    sessionId: { type: "string", required: true, minLength: 1 },
    puzzleId: { type: "string", required: true, minLength: 1 },
    answer: { type: ["string", "object"], required: true },
  },

  // Requisição de pista
  hintRequest: {
    sessionId: { type: "string", required: true, minLength: 1 },
    puzzleId: { type: "string", required: true, minLength: 1 },
  },

  // Progresso narrativo
  narrativeProgress: {
    scenarioId: { type: "string", required: true, minLength: 1 },
    nodeId: { type: "string", required: true, minLength: 1 },
  },

  // Paginação
  pagination: {
    page: { type: "number", required: false, min: 1 },
    limit: { type: "number", required: false, min: 1, max: 100 },
  },
};

/**
 * Sanitizar string para prevenir XSS
 * Remove tags HTML e scripts perigosos
 *
 * @param {String} str - String a sanitizar
 * @returns {String} String sanitizada
 */
function sanitizeString(str) {
  if (typeof str !== "string") return str;

  return str
    .replace(/[<>]/g, "") // Remove < e >
    .replace(/javascript:/gi, "") // Remove javascript:
    .replace(/on\w+\s*=/gi, "") // Remove event handlers (onclick=, etc)
    .trim();
}

/**
 * Sanitizar objeto recursivamente
 *
 * @param {Object} obj - Objeto a sanitizar
 * @returns {Object} Objeto sanitizado
 */
function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") {
    return typeof obj === "string" ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
}

/**
 * Validar valor contra especificação de campo
 *
 * @param {Any} value - Valor a validar
 * @param {Object} spec - { type, required, minLength, min, max }
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateField(value, spec) {
  // Verificar required
  if (
    spec.required &&
    (value === undefined || value === null || value === "")
  ) {
    return { valid: false, error: "Campo obrigatório" };
  }

  if (!spec.required && (value === undefined || value === null)) {
    return { valid: false, error: "Campo pode ser omitido" };
  }

  // Verificar type
  const allowedTypes = Array.isArray(spec.type) ? spec.type : [spec.type];
  const actualType = Array.isArray(value) ? "array" : typeof value;

  if (!allowedTypes.includes(actualType)) {
    return {
      valid: false,
      error: `Tipo inválido: esperado ${allowedTypes.join(" ou ")}, recebido ${actualType}`,
    };
  }

  // Verificar minLength para strings
  if (
    spec.minLength &&
    typeof value === "string" &&
    value.length < spec.minLength
  ) {
    return {
      valid: false,
      error: `Comprimento mínimo: ${spec.minLength}`,
    };
  }

  // Verificar min para números
  if (spec.min && typeof value === "number" && value < spec.min) {
    return {
      valid: false,
      error: `Valor mínimo: ${spec.min}`,
    };
  }

  // Verificar max para números
  if (spec.max && typeof value === "number" && value > spec.max) {
    return {
      valid: false,
      error: `Valor máximo: ${spec.max}`,
    };
  }

  return { valid: true };
}

/**
 * Validar objeto contra schema
 *
 * @param {Object} data - Dados a validar
 * @param {Object} schema - Schema de validação
 * @returns {Object} { valid: boolean, errors?: {fieldName: string} }
 */
export function validateSchema(data, schema) {
  const errors = {};

  for (const [fieldName, spec] of Object.entries(schema)) {
    const value = data[fieldName];
    const validation = validateField(value, spec);

    if (!validation.valid) {
      errors[fieldName] = validation.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : null,
  };
}

/**
 * Middleware: Validar request body contra schema
 * Uso: router.post('/route', validate('gameDecision'), handler)
 *
 * @param {String} schemaName - Nome do schema em SCHEMAS
 * @returns {Function} Middleware
 */
export const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = SCHEMAS[schemaName];

    if (!schema) {
      return res.status(500).json({
        success: false,
        error: `Schema desconhecido: ${schemaName}`,
      });
    }

    // Combinar body, query, params
    const data = { ...req.body, ...req.query, ...req.params };

    // Validar
    const validation = validateSchema(data, schema);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: "Validação falhou",
        details: validation.errors,
      });
    }

    // Sanitizar e atualizar request
    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);

    next();
  };
};

/**
 * Middleware: Sanitizar todo o request (sem validação de schema)
 * Aplicar globalmente para segurança XSS
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 * @returns {void}
 */
export const sanitizeMiddleware = (req, res, next) => {
  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  next();
};

/**
 * Função auxiliar para criar validadores customizados
 * Permite composição de validações
 *
 * @param {Object} customSchema - Schema customizado
 * @returns {Function} Middleware
 */
export const validateCustom = (customSchema) => {
  return (req, res, next) => {
    const data = { ...req.body, ...req.query, ...req.params };

    // Combinar com sanitização
    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);

    const validation = validateSchema(data, customSchema);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: "Validação falhou",
        details: validation.errors,
      });
    }

    next();
  };
};

export default {
  SCHEMAS,
  validate,
  validateSchema,
  sanitizeMiddleware,
  sanitizeString,
  sanitizeObject,
  validateCustom,
};
