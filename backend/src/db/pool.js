import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * Configuração da Pool de Conexões PostgreSQL
 * 
 * ARQUITETURA CAMADA DADOS (Layer 3):
 * Esta camada gerencia todas as conexões com a base de dados.
 * Usa connection pooling para melhor performance em produção.
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections in pool
  idleTimeoutMillis: 30000, // Idle connection timeout
  connectionTimeoutMillis: 2000, // Connection timeout
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Executa query na base de dados
 * @param {string} text - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise} Query result
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed:', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Obter um cliente da pool (para transações)
 */
export const getClient = () => pool.connect();

export default pool;
