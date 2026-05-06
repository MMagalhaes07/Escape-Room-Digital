/**
 * MIDDLEWARE: auth.js
 *
 * Autenticação e autorização de endpoints
 * - Verificação JWT em Authorization: Bearer <token>
 * - Extração de utilizador do token
 * - Verificação de roles (student/teacher)
 * - Rate limiting básico
 */

import jwt from "jsonwebtoken";

/**
 * Rate limiter simples em memória
 * Mapeia IP/userID para timestamp de requisições
 */
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const RATE_LIMIT_MAX_REQUESTS = 100; // max 100 requisições por minuto

/**
 * Middleware: Verificar JWT e extrair user
 * Adiciona `req.user` ao request
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 * @returns {void}
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error:
          "Autenticação obrigatória. Envie token no header: Authorization: Bearer <token>",
      });
    }

    const token = authHeader.slice(7); // Remove "Bearer "

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adicionar user ao request
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expirado. Faça login novamente.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Token inválido.",
      });
    }

    res.status(500).json({
      success: false,
      error: "Erro ao validar token.",
    });
  }
};

/**
 * Middleware: Verificar role específica
 * Uso: router.get('/teacher-only', requireRole('teacher'), handler)
 *
 * @param {String} allowedRole - Role permitida ('student' ou 'teacher')
 * @returns {Function} Middleware function
 */
export const requireRole = (allowedRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Autenticação obrigatória.",
      });
    }

    if (req.user.role !== allowedRole) {
      return res.status(403).json({
        success: false,
        error: `Acesso negado. Esta operação requer role: ${allowedRole}`,
      });
    }

    next();
  };
};

/**
 * Middleware: Verificar se um dos roles é permitido
 * Uso: router.get('/any', requireAnyRole(['student', 'teacher']), handler)
 *
 * @param {Array<String>} allowedRoles - Roles permitidas
 * @returns {Function} Middleware function
 */
export const requireAnyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Autenticação obrigatória.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Acesso negado. Roles permitidas: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * Middleware: Rate limiting baseado em IP ou userID
 * Limita a 100 requisições por minuto
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 * @returns {void}
 */
export const rateLimitMiddleware = (req, res, next) => {
  // Usar userID se autenticado, caso contrário usar IP
  const identifier = req.user?.id || req.ip;
  const now = Date.now();

  // Inicializar ou obter registro
  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, []);
  }

  let requestTimestamps = rateLimitStore.get(identifier);

  // Remover requisições fora da janela de tempo
  requestTimestamps = requestTimestamps.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW,
  );

  // Verificar limite
  if (requestTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: "Limite de requisições atingido. Tente novamente em 1 minuto.",
      retryAfter: RATE_LIMIT_WINDOW / 1000,
    });
  }

  // Adicionar timestamp e atualizar
  requestTimestamps.push(now);
  rateLimitStore.set(identifier, requestTimestamps);

  // Limpar cache antigos a cada 100 operações (otimização)
  if (rateLimitStore.size > 10000) {
    const keysToDelete = [];
    for (const [key, timestamps] of rateLimitStore.entries()) {
      const validTimestamps = timestamps.filter(
        (ts) => now - ts < RATE_LIMIT_WINDOW,
      );
      if (validTimestamps.length === 0) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => rateLimitStore.delete(key));
  }

  next();
};

/**
 * Middleware: Opcional - requer autenticação mas falha silenciosamente se não houver token
 * Útil para endpoints que têm conteúdo público mas com bonus de autenticado
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 * @returns {void}
 */
export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: decoded.userId,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // Falha silenciosa - continua sem autenticação
    next();
  }
};

export default {
  authMiddleware,
  requireRole,
  requireAnyRole,
  rateLimitMiddleware,
  optionalAuthMiddleware,
};
