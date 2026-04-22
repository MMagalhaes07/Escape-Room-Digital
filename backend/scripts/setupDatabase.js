/**
 * SCRIPT: setupDatabase.js
 * 
 * Configura a estrutura da base de dados PostgreSQL
 * Executa: npm run db:setup
 */
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const setupDatabase = async () => {
  try {
    console.log('🔧 Configurando base de dados...\n');

    // Criar tabelas
    const createTablesSQL = `
      -- Tabela de Utilizadores
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student', -- 'student' ou 'teacher'
        grade VARCHAR(50), -- 7º, 8º, 9º, etc.
        school VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de Sessões de Jogo
      CREATE TABLE IF NOT EXISTS game_sessions (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scenario VARCHAR(50) NOT NULL, -- 'scenario_1' ou 'scenario_2'
        start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP,
        state JSONB DEFAULT '{}', -- Estado do jogo (cena atual, inventário, etc.)
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de Decisões do Jogador
      CREATE TABLE IF NOT EXISTS game_decisions (
        id UUID PRIMARY KEY,
        session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scene_id VARCHAR(100) NOT NULL,
        choice_id VARCHAR(100) NOT NULL,
        consequence JSONB DEFAULT '{}', -- Consequências da escolha
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de Métricas de Jogo
      CREATE TABLE IF NOT EXISTS game_metrics (
        id UUID PRIMARY KEY,
        session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        scenario VARCHAR(50) NOT NULL,
        total_duration INTEGER, -- segundos
        decisions_count INTEGER,
        puzzles_solved INTEGER,
        clues_found INTEGER,
        empathy_score FLOAT, -- 0-100
        final_choice VARCHAR(100),
        completion_status VARCHAR(50), -- 'completed', 'abandoned', 'in_progress'
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        raw_data JSONB DEFAULT '{}'
      );

      -- Tabela de Perfil de Gamificação
      CREATE TABLE IF NOT EXISTS gamification_profiles (
        id UUID PRIMARY KEY,
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        points INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de Badges
      CREATE TABLE IF NOT EXISTS badges (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        icon_url VARCHAR(255)
      );

      -- Tabela de Badges do Utilizador
      CREATE TABLE IF NOT EXISTS user_badges (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        badge_id VARCHAR(100) NOT NULL REFERENCES badges(id),
        awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        description TEXT
      );

      -- Tabela de Transações de Pontos
      CREATE TABLE IF NOT EXISTS points_transactions (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        points INTEGER NOT NULL,
        reason VARCHAR(255),
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Índices para Performance
      CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_game_sessions_scenario ON game_sessions(scenario);
      CREATE INDEX IF NOT EXISTS idx_game_decisions_session_id ON game_decisions(session_id);
      CREATE INDEX IF NOT EXISTS idx_game_decisions_user_id ON game_decisions(user_id);
      CREATE INDEX IF NOT EXISTS idx_game_metrics_user_id ON game_metrics(user_id);
      CREATE INDEX IF NOT EXISTS idx_game_metrics_scenario ON game_metrics(scenario);
      CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
      CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
    `;

    await pool.query(createTablesSQL);
    console.log('✅ Tabelas criadas com sucesso!');

    // Inserir badges padrão
    const badgesSQL = `
      INSERT INTO badges (id, name) VALUES
        ('first_game', 'Primeiro Jogo'),
        ('empathy_champion', 'Campeão da Empatia'),
        ('puzzle_master', 'Mestre dos Puzzles'),
        ('decision_maker', 'Tomador de Decisões'),
        ('exploration_expert', 'Explorador Experto'),
        ('speedrunner', 'Speedrunner'),
        ('collector', 'Colecionador'),
        ('three_endings', 'Todas as Terminações')
      ON CONFLICT (id) DO NOTHING;
    `;

    await pool.query(badgesSQL);
    console.log('✅ Badges inseridas com sucesso!');

    console.log('\n🎉 Base de dados configurada com sucesso!');
    console.log('\nPróximos passos:');
    console.log('1. npm install (instalar dependências)');
    console.log('2. npm run db:seed (popular com dados de teste)');
    console.log('3. npm run dev (iniciar servidor)');
  } catch (error) {
    console.error('❌ Erro ao configurar base de dados:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

setupDatabase();
