/**
 * Custom Hooks for API calls
 */
import { useState, useCallback } from "react";
import apiClient from "@/lib/apiClient";

export const useGame = () => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const startSession = useCallback(async (userId, scenario) => {
    setState({ data: null, loading: true, error: null });
    try {
      const { data } = await apiClient.post("/game/session", {
        userId,
        scenario,
      });
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  const recordDecision = useCallback(
    async (sessionId, sceneId, choiceId, userAnswer) => {
      try {
        const { data } = await apiClient.post("/game/decision", {
          sessionId,
          sceneId,
          choiceId,
          userAnswer,
        });
        return data;
      } catch (error) {
        throw error;
      }
    },
    [],
  );

  const completePuzzle = useCallback(async (sessionId, puzzleId, solution) => {
    try {
      const { data } = await apiClient.post("/game/puzzle", {
        sessionId,
        puzzleId,
        solution,
      });
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const discoverClue = useCallback(async (sessionId, clueId) => {
    try {
      const { data } = await apiClient.post("/game/clue", {
        sessionId,
        clueId,
      });
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const finishSession = useCallback(async (sessionId) => {
    try {
      const { data } = await apiClient.post("/game/finish", { sessionId });
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    state,
    startSession,
    recordDecision,
    completePuzzle,
    discoverClue,
    finishSession,
  };
};

export const useGamification = () => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const getUserProfile = useCallback(async (userId) => {
    setState({ data: null, loading: true, error: null });
    try {
      const { data } = await apiClient.get(`/gamification/user/${userId}`);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  const getLeaderboard = useCallback(async (grade = null) => {
    setState({ data: null, loading: true, error: null });
    try {
      const url = grade
        ? `/gamification/leaderboard/grade/${grade}`
        : "/gamification/leaderboard";
      const { data } = await apiClient.get(url);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  const getAvailableBadges = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/gamification/badges");
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  return { state, getUserProfile, getLeaderboard, getAvailableBadges };
};

export const useTeacher = () => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const getDashboard = useCallback(async (id, school) => {
    setState({ data: null, loading: true, error: null });
    try {
      const { data } = await apiClient.get(
        `/teachers/dashboard?teacherId=${id}&school=${school}`,
      );
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  const getStudentProfile = useCallback(async (studentId) => {
    setState({ data: null, loading: true, error: null });
    try {
      const { data } = await apiClient.get(`/teachers/student/${studentId}`);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  const getClassReport = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const { data } = await apiClient.get("/teachers/class-report");
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  const exportClassReport = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/teachers/export", {
        responseType: "blob",
      });
      // Create download link
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "class-report.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    state,
    getDashboard,
    getStudentProfile,
    getClassReport,
    exportClassReport,
  };
};
