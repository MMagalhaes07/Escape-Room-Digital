/**
 * API Client - Axios instance com retry logic e auth header
 *
 * Features:
 * - JWT authentication
 * - Retry automático com exponential backoff
 * - Tratamento de erros de rede
 * - Timeout configurável
 */
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Configuração de Retry
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  // Códigos de status que disparam retry
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
  // Métodos HTTP que são retentáveis
  retryMethods: ["GET", "HEAD", "PUT", "DELETE", "OPTIONS", "TRACE"],
};

/**
 * Calcular delay com exponential backoff
 */
const calculateBackoffDelay = (retryCount, initialDelay, multiplier) => {
  const delay = initialDelay * Math.pow(multiplier, retryCount - 1);
  // Adicionar jitter aleatório (±10%)
  const jitter = delay * (0.9 + Math.random() * 0.2);
  return Math.min(jitter, RETRY_CONFIG.maxDelayMs);
};

/**
 * Interceptor de Request - Adicionar token JWT
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Configurar retry count
    config.retryCount = config.retryCount || 0;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Interceptor de Response - Retry e Error Handling
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log de sucesso em desenvolvimento
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✓ ${response.config.method?.toUpperCase()} ${response.config.url}`,
      );
    }
    return response;
  },
  async (error) => {
    const config = error.config;

    // Se não há config, rejeitar
    if (!config) {
      return Promise.reject(error);
    }

    // Verificar se deve fazer retry
    const shouldRetry =
      config.retryCount < RETRY_CONFIG.maxRetries &&
      (RETRY_CONFIG.retryStatusCodes.includes(error.response?.status) ||
        error.code === "ECONNABORTED" ||
        error.message === "Network Error" ||
        !error.response); // Erro de rede

    const isRetryableMethod = RETRY_CONFIG.retryMethods.includes(
      config.method?.toUpperCase(),
    );

    // Não retry para POST/PATCH se já tem dados (não é idempotent)
    if (!isRetryableMethod && !shouldRetry) {
      // Tratamento de erro final
      if (error.response?.status === 401) {
        // Unauthorized - limpar auth e redirecionar
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }

      if (process.env.NODE_ENV === "development") {
        console.error(
          `✗ ${config.method?.toUpperCase()} ${config.url}`,
          error.response?.status,
          error.message,
        );
      }

      return Promise.reject(error);
    }

    if (shouldRetry && isRetryableMethod) {
      config.retryCount++;

      // Calcular delay
      const delay = calculateBackoffDelay(
        config.retryCount,
        RETRY_CONFIG.initialDelayMs,
        RETRY_CONFIG.backoffMultiplier,
      );

      if (process.env.NODE_ENV === "development") {
        console.warn(
          `⟳ Retry ${config.retryCount}/${RETRY_CONFIG.maxRetries} após ${delay}ms: ${config.method?.toUpperCase()} ${config.url}`,
        );
      }

      // Esperar delay
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Fazer retry
      return apiClient(config);
    }

    // Se chegou aqui, é um erro definitivo
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    if (process.env.NODE_ENV === "development") {
      console.error(
        `✗ ${config.method?.toUpperCase()} ${config.url}`,
        error.response?.status || error.code,
        error.message,
      );
    }

    return Promise.reject(error);
  },
);

/**
 * Utilitário: Check conectividade
 */
export const isOnline = async () => {
  try {
    const response = await axios.get("https://httpbin.org/status/200", {
      timeout: 5000,
    });
    return response.status === 200;
  } catch {
    return false;
  }
};

/**
 * Utilitário: Retry manual
 */
export const retryRequest = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
  } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const delay = calculateBackoffDelay(
        attempt,
        initialDelay,
        backoffMultiplier,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export default apiClient;
export { RETRY_CONFIG };
