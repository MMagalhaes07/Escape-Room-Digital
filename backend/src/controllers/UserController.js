/**
 * CONTROLLER: UserController
 * 
 * Gerencia autenticação e perfis de utilizadores
 */
import UserModel from '../models/UserModel.js';
import GamificationModel from '../models/GamificationModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UserController {
  /**
   * Registar novo utilizador
   */
  static async register(req, res) {
    try {
      const { name, email, password, role, grade, school } = req.body;

      // Validação básica
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      // Verificar se utilizador já existe
      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Hash da password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar utilizador
      const user = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'student',
        grade,
        school,
      });

      // Criar perfil de gamificação
      await GamificationModel.getOrCreateProfile(user.id);

      // Gerar JWT token
      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          grade: user.grade,
          school: user.school,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Buscar utilizador
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verificar password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Gerar token
      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          grade: user.grade,
          school: user.school,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obter perfil do utilizador
   */
  static async getProfile(req, res) {
    try {
      const { userId } = req.params;

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Atualizar perfil
   */
  static async updateProfile(req, res) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      // Não permitir atualização de email ou password por este endpoint
      delete updateData.email;
      delete updateData.password;

      const user = await UserModel.update(userId, updateData);

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default UserController;
