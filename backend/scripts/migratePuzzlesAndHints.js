/**
 * DATABASE MIGRATION: Add Puzzles and Hints Tables
 *
 * Executa: npm run db:migrate:puzzles
 *
 * Esta migração cria as tabelas necessárias para o sistema de puzzles e pistas:
 * - puzzles: Definições dos puzzles
 * - puzzle_answers: Respostas dos jogadores
 * - hints: Definições das pistas
 * - player_hints: Rastreamento de pistas desbloqueadas
 */

import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const migratePuzzlesAndHints = async () => {
  try {
    console.log("🔧 Migrando: Adicionando tabelas de Puzzles e Hints...\n");

    const createTablesSQL = `
      -- Tabela de Puzzles
      CREATE TABLE IF NOT EXISTS puzzles (
        id VARCHAR(100) PRIMARY KEY,
        scenario_id VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL, -- multiple_choice, text_validation, ordering, matching
        question TEXT NOT NULL,
        difficulty INTEGER DEFAULT 1, -- 1-5 scale
        educational_context VARCHAR(100), -- bullying_investigation, cyberbullying_recognition, etc
        expected_answers JSONB, -- { correct: "A", alternatives: [...] } ou { correctOrder: [...] }
        hints JSONB DEFAULT '[]', -- Array de pistas por tier
        feedback JSONB, -- { correct: "...", incorrect: "..." }
        metadata JSONB DEFAULT '{}', -- Dados customizados
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de Respostas de Puzzles
      CREATE TABLE IF NOT EXISTS puzzle_answers (
        id UUID PRIMARY KEY,
        session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
        puzzle_id VARCHAR(100) NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
        player_answer TEXT, -- A resposta do jogador (serializada)
        is_correct BOOLEAN NOT NULL,
        score INTEGER, -- 0-100
        attempt_number INTEGER DEFAULT 1,
        time_spent INTEGER, -- segundos
        feedback TEXT, -- Feedback exibido ao jogador
        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de Pistas (Hints)
      CREATE TABLE IF NOT EXISTS hints (
        id VARCHAR(100) PRIMARY KEY,
        puzzle_id VARCHAR(100) NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
        tier INTEGER DEFAULT 1, -- Nível de progressão (1=primeira, 2=segunda, etc)
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL, -- Conteúdo da pista
        unlock_conditions JSONB, -- { attemptThreshold: 2, timeThreshold: 60, ... }
        priority INTEGER DEFAULT 1, -- Para ordenação
        bullying_context VARCHAR(100), -- Contexto educativo
        educational_value JSONB DEFAULT '{}', -- { learningOutcome: "...", pedagogicalNote: "..." }
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabela de Pistas Desbloqueadas do Jogador
      CREATE TABLE IF NOT EXISTS player_hints (
        id UUID PRIMARY KEY,
        player_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        hint_id VARCHAR(100) NOT NULL REFERENCES hints(id) ON DELETE CASCADE,
        puzzle_id VARCHAR(100) NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
        unlocked_by VARCHAR(50), -- 'puzzle_solved', 'struggle_assistance', 'time_passed', etc
        context JSONB, -- Contexto de quando foi desbloqueado
        was_viewed BOOLEAN DEFAULT false,
        viewed_at TIMESTAMP,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Índices para Performance
      CREATE INDEX IF NOT EXISTS idx_puzzles_scenario_id ON puzzles(scenario_id);
      CREATE INDEX IF NOT EXISTS idx_puzzles_type ON puzzles(type);
      CREATE INDEX IF NOT EXISTS idx_puzzle_answers_session_id ON puzzle_answers(session_id);
      CREATE INDEX IF NOT EXISTS idx_puzzle_answers_puzzle_id ON puzzle_answers(puzzle_id);
      CREATE INDEX IF NOT EXISTS idx_puzzle_answers_is_correct ON puzzle_answers(is_correct);
      CREATE INDEX IF NOT EXISTS idx_hints_puzzle_id ON hints(puzzle_id);
      CREATE INDEX IF NOT EXISTS idx_hints_tier ON hints(tier);
      CREATE INDEX IF NOT EXISTS idx_player_hints_player_id ON player_hints(player_id);
      CREATE INDEX IF NOT EXISTS idx_player_hints_hint_id ON player_hints(hint_id);
      CREATE INDEX IF NOT EXISTS idx_player_hints_puzzle_id ON player_hints(puzzle_id);
      CREATE INDEX IF NOT EXISTS idx_player_hints_was_viewed ON player_hints(was_viewed);
    `;

    await pool.query(createTablesSQL);
    console.log("✅ Tabelas criadas com sucesso!");

    // Inserir puzzles de exemplo
    const examplePuzzlesSQL = `
      INSERT INTO puzzles (id, scenario_id, type, question, difficulty, educational_context, expected_answers, feedback, hints) VALUES
      (
        'exif_metadata',
        'scenario_1',
        'multiple_choice',
        'Com base nos metadados EXIF, quem é o suspeito principal?',
        2,
        'bullying_investigation',
        '{
          "correct": "B",
          "alternatives": [
            { "id": "A", "text": "Tiago - porque ele sai da aula" },
            { "id": "B", "text": "Lucas - porque tem acesso técnico" },
            { "id": "C", "text": "Catarina - porque está perto" }
          ]
        }'::jsonb,
        '{
          "correct": "Correto! Lucas tem acesso técnico a todos os computadores.",
          "incorrect": "Reconsidera: quem teria acesso técnico para criar um perfil falso?"
        }'::jsonb,
        '[
          { "tier": 1, "text": "A hora e localização dos metadados são cruciais." },
          { "tier": 2, "text": "Quem na escola tem acesso técnico a todos os computadores?" }
        ]'::jsonb
      ),
      (
        'caesar_cipher',
        'scenario_1',
        'text_validation',
        'Descriptografe o e-mail usando Cifra de César: Emojhsdoh@hfkrrvwrfoxe.iurj',
        3,
        'cyberbullying_recognition',
        '{ "correct": "rodrigo@schoolclub.org" }'::jsonb,
        '{
          "correct": "Excelente! Você descobriu o e-mail associado ao perfil falso.",
          "incorrect": "Tenta diferentes deslocamentos (1-25 na Cifra de César)."
        }'::jsonb,
        '[
          { "tier": 1, "text": "Tenta deslocamento 3 (A→D, B→E, C→F)" },
          { "tier": 2, "text": "O resultado deve terminar em @...club.org" },
          { "tier": 3, "text": "Deslocamento correto: -3 (ou +23)" }
        ]'::jsonb
      )
      ON CONFLICT (id) DO NOTHING;
    `;

    await pool.query(examplePuzzlesSQL);
    console.log("✅ Puzzles de exemplo inseridos!");

    // Inserir pistas de exemplo
    const exampleHintsSQL = `
      INSERT INTO hints (id, puzzle_id, tier, title, content, unlock_conditions, bullying_context, educational_value) VALUES
      (
        'hint_exif_1',
        'exif_metadata',
        1,
        'Entender Metadados',
        'Metadados incluem hora, localização e dispositivo. Estes detalhes revelam quem estava onde.',
        '{ "attemptThreshold": 1 }'::jsonb,
        'bullying_investigation',
        '{ "learningOutcome": "Compreender que informação digital deixa rastros" }'::jsonb
      ),
      (
        'hint_exif_2',
        'exif_metadata',
        2,
        'Análise de Acesso',
        'Lucas é o técnico da escola - ele tem acesso a todos os computadores e pode criar perfis falsos facilmente.',
        '{ "attemptThreshold": 2 }'::jsonb,
        'cyberbullying_recognition',
        '{ "learningOutcome": "Reconhecer posições de poder e responsabilidade" }'::jsonb
      ),
      (
        'hint_caesar_1',
        'caesar_cipher',
        1,
        'Conceito de Cifra de César',
        'Uma Cifra de César desloca cada letra por um número fixo. Se A→D, é deslocamento 3.',
        '{ "attemptThreshold": 1, "timeThreshold": 30 }'::jsonb,
        'cyberbullying_recognition',
        '{ "learningOutcome": "Compreender encriptação básica e padrões" }'::jsonb
      ),
      (
        'hint_caesar_2',
        'caesar_cipher',
        2,
        'Dica de Deslocamento',
        'Tenta deslocamento 3 inverso (ou -3). Cada letra vai para trás no alfabeto.',
        '{ "attemptThreshold": 2 }'::jsonb,
        'cyberbullying_recognition',
        '{ "learningOutcome": "Pensamento sistemático e resolução de problemas" }'::jsonb
      )
      ON CONFLICT (id) DO NOTHING;
    `;

    await pool.query(exampleHintsSQL);
    console.log("✅ Pistas de exemplo inseridas!");

    console.log("\n🎉 Migração completada com sucesso!");
    console.log("\nTábuas criadas:");
    console.log("  - puzzles");
    console.log("  - puzzle_answers");
    console.log("  - hints");
    console.log("  - player_hints");
    console.log("\nPróximos passos:");
    console.log("1. Revisar dados de exemplo em cada tabela");
    console.log("2. Adicionar mais puzzles e pistas conforme necessário");
    console.log("3. Atualizar aplicação para usar estas tabelas");
  } catch (error) {
    console.error("❌ Erro ao migrar:", error);
    process.exit(1);
  }
};

migratePuzzlesAndHints().then(() => process.exit(0));
