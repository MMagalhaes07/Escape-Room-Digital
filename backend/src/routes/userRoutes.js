/**
 * ROUTES: User Routes
 * Endpoints para autenticação e gerenciamento de perfil
 */
import express from 'express';
import UserController from '../controllers/UserController.js';

const router = express.Router();

/**
 * POST /api/users/register
 * Registar novo utilizador
 */
router.post('/register', UserController.register);

/**
 * POST /api/users/login
 * Login
 */
router.post('/login', UserController.login);

/**
 * GET /api/users/:userId
 * Obter perfil
 */
router.get('/:userId', UserController.getProfile);

/**
 * PUT /api/users/:userId
 * Atualizar perfil
 */
router.put('/:userId', UserController.updateProfile);

export default router;
