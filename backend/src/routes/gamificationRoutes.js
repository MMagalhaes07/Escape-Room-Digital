/**
 * ROUTES: Gamification Routes
 * Endpoints para gerenciar pontos, badges e progressão
 */
import express from "express";
import GamificationController from "../controllers/GamificationController.js";

const router = express.Router();

/**
 * GET /api/gamification/user/:userId
 * Obter perfil de gamificação
 */
router.get("/user/:userId", GamificationController.getUserProfile);

/**
 * GET /api/gamification/profile/:userId
 * Obter perfil de gamificação (alias para /user/:userId)
 */
router.get("/profile/:userId", GamificationController.getUserProfile);

/**
 * GET /api/gamification/leaderboard
 * Obter leaderboard global
 */
router.get("/leaderboard", GamificationController.getGlobalLeaderboard);

/**
 * GET /api/gamification/leaderboard/:grade
 * Obter leaderboard por turma
 */
router.get(
  "/leaderboard/grade/:grade",
  GamificationController.getGradeLeaderboard,
);

/**
 * GET /api/gamification/badges
 * Obter badges disponíveis
 */
router.get("/badges", GamificationController.getAvailableBadges);

export default router;
