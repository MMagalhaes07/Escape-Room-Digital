/**
 * UI Store - Zustand store para UI state
 *
 * Estado:
 * - loading, error, notifications, modals
 *
 * Actions:
 * - showNotification, hideNotification, setLoading, setError, openModal, closeModal
 */

import { create } from "zustand";

export const useUIStore = create((set, get) => ({
  // === STATE ===

  // Loading global
  isLoading: false,
  loadingMessage: "",

  // Erro global
  error: null,
  errorDetails: null,

  // Notificações (toast-like)
  notifications: [], // Array de {id, type, message, duration, timestamp}

  // Modals
  modals: {}, // {modalName: {open, data}}

  // UI flags
  sidebarOpen: true,
  mobileMenuOpen: false,
  theme: "light", // light or dark

  // === ACTIONS ===

  /**
   * Mostrar notificação
   * @param {string} message
   * @param {string} type - 'success', 'error', 'warning', 'info'
   * @param {number} duration - em ms (0 = manual dismiss)
   * @returns {string} notification ID
   */
  showNotification: (message, type = "info", duration = 5000) => {
    const id = `notif_${Date.now()}_${Math.random()}`;

    const notification = {
      id,
      message,
      type, // success, error, warning, info
      timestamp: new Date().toISOString(),
      duration,
    };

    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    // Auto-remove após duration
    if (duration > 0) {
      setTimeout(() => {
        get().hideNotification(id);
      }, duration);
    }

    return id;
  },

  /**
   * Esconder notificação
   * @param {string} notificationId
   */
  hideNotification: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== notificationId),
    }));
  },

  /**
   * Limpar todas as notificações
   */
  clearNotifications: () => {
    set({
      notifications: [],
    });
  },

  /**
   * Definir loading
   * @param {boolean} isLoading
   * @param {string} message (opcional)
   */
  setLoading: (isLoading, message = "") => {
    set({
      isLoading,
      loadingMessage: message,
    });
  },

  /**
   * Definir erro
   * @param {string} error
   * @param {Object} details (opcional)
   */
  setError: (error, details = null) => {
    set({
      error,
      errorDetails: details,
    });

    // Mostrar notificação de erro
    if (error) {
      get().showNotification(error, "error", 7000);
    }
  },

  /**
   * Limpar erro
   */
  clearError: () => {
    set({
      error: null,
      errorDetails: null,
    });
  },

  /**
   * Abrir modal
   * @param {string} modalName
   * @param {Object} data (opcional)
   */
  openModal: (modalName, data = null) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: {
          open: true,
          data,
        },
      },
    }));
  },

  /**
   * Fechar modal
   * @param {string} modalName
   */
  closeModal: (modalName) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: {
          open: false,
          data: null,
        },
      },
    }));
  },

  /**
   * Verificar se modal está aberto
   * @param {string} modalName
   * @returns {boolean}
   */
  isModalOpen: (modalName) => {
    return get().modals[modalName]?.open ?? false;
  },

  /**
   * Obter dados do modal
   * @param {string} modalName
   * @returns {Object}
   */
  getModalData: (modalName) => {
    return get().modals[modalName]?.data ?? null;
  },

  /**
   * Toggle sidebar
   */
  toggleSidebar: () => {
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    }));
  },

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu: () => {
    set((state) => ({
      mobileMenuOpen: !state.mobileMenuOpen,
    }));
  },

  /**
   * Set theme
   * @param {string} theme - 'light' or 'dark'
   */
  setTheme: (theme) => {
    set({
      theme,
    });

    // Salvar em localStorage
    localStorage.setItem("theme", theme);

    // Atualizar documento
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },

  /**
   * Toggle theme
   */
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      get().setTheme(newTheme);
      return { theme: newTheme };
    });
  },

  /**
   * Inicializar tema do localStorage
   */
  initTheme: () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    get().setTheme(savedTheme);
  },

  /**
   * Mostrar sucesso
   * @param {string} message
   */
  showSuccess: (message) => {
    get().showNotification(message, "success", 5000);
  },

  /**
   * Mostrar erro
   * @param {string} message
   */
  showError: (message, details = null) => {
    get().setError(message, details);
  },

  /**
   * Mostrar aviso
   * @param {string} message
   */
  showWarning: (message) => {
    get().showNotification(message, "warning", 5000);
  },

  /**
   * Mostrar info
   * @param {string} message
   */
  showInfo: (message) => {
    get().showNotification(message, "info", 5000);
  },

  /**
   * Reset UI
   */
  reset: () => {
    set({
      isLoading: false,
      loadingMessage: "",
      error: null,
      errorDetails: null,
      notifications: [],
      modals: {},
      sidebarOpen: true,
      mobileMenuOpen: false,
    });
  },
}));

export default useUIStore;
