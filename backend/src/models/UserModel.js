/**
 * MODEL: User
 * 
 * Estrutura de dados para utilizadores (alunos e professores)
 * CAMADA 3: DADOS
 */
import { query } from '../db/pool.js';
import { v4 as uuidv4 } from 'uuid';

export class UserModel {
  /**
   * Criar novo utilizador
   * @param {Object} userData - {name, email, password, role, grade, school}
   */
  static async create(userData) {
    const id = uuidv4();
    const createdAt = new Date();
    
    const text = `
      INSERT INTO users (id, name, email, password, role, grade, school, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, email, role, grade, school, created_at
    `;
    
    try {
      const result = await query(text, [
        id,
        userData.name,
        userData.email,
        userData.password,
        userData.role || 'student', // 'student' or 'teacher'
        userData.grade || null,
        userData.school || null,
        createdAt,
      ]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`User creation error: ${error.message}`);
    }
  }

  /**
   * Buscar utilizador por email
   */
  static async findByEmail(email) {
    const text = 'SELECT * FROM users WHERE email = $1';
    try {
      const result = await query(text, [email]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`User lookup error: ${error.message}`);
    }
  }

  /**
   * Buscar utilizador por ID
   */
  static async findById(id) {
    const text = 'SELECT id, name, email, role, grade, school, created_at FROM users WHERE id = $1';
    try {
      const result = await query(text, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`User lookup error: ${error.message}`);
    }
  }

  /**
   * Buscar todos os alunos de uma escola/turma (para dashboard do professor)
   */
  static async findBySchool(school) {
    const text = 'SELECT id, name, email, grade, created_at FROM users WHERE school = $1 AND role = $2';
    try {
      const result = await query(text, [school, 'student']);
      return result.rows;
    } catch (error) {
      throw new Error(`School users lookup error: ${error.message}`);
    }
  }

  /**
   * Atualizar dados do utilizador
   */
  static async update(id, updateData) {
    const setFields = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(updateData)];
    const text = `UPDATE users SET ${setFields} WHERE id = $1 RETURNING *`;
    
    try {
      const result = await query(text, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`User update error: ${error.message}`);
    }
  }
}

export default UserModel;
