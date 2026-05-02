/**
 * Auth Store - Zustand store for authentication state
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "@/lib/apiClient";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Login
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apiClient.post("/users/login", {
            email,
            password,
          });
          set({
            user: data.user,
            token: data.token,
            isLoading: false,
          });
          localStorage.setItem("authToken", data.token);
          return data;
        } catch (err) {
          const message = err.response?.data?.message || "Login failed";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      // Register
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apiClient.post("/users/register", userData);
          set({
            user: data.user,
            token: data.token,
            isLoading: false,
          });
          localStorage.setItem("authToken", data.token);
          return data;
        } catch (err) {
          const message = err.response?.data?.message || "Registration failed";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      // Logout
      logout: () => {
        set({ user: null, token: null, error: null });
        localStorage.removeItem("authToken");
      },

      // Update profile
      updateProfile: async (userId, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apiClient.put(`/users/${userId}`, updates);
          set({
            user: data.user,
            isLoading: false,
          });
          return data;
        } catch (err) {
          const message = err.response?.data?.message || "Update failed";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      // Get profile
      getProfile: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apiClient.get(`/users/${userId}`);
          set({
            user: data.user,
            isLoading: false,
          });
          return data;
        } catch (err) {
          const message =
            err.response?.data?.message || "Failed to fetch profile";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
);
