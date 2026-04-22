/**
 * SCRIPT: seedDatabase.js
 * 
 * Popula a base de dados com dados de teste/demo
 * Executa: npm run db:seed
 */
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const seedDatabase = async () => {
  try {
    console.log('🌱 Populando base de dados com dados de teste...\n');

    // Criar utilizadores de teste
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);

    const teacherId = uuidv4();
    const student1Id = uuidv4();
    const student2Id = uuidv4();
    const student3Id = uuidv4();

    // Inserir professor
    await pool.query(
      `INSERT INTO users (id, name, email, password, role, grade, school) VALUES
       ($1, $2, $3, $4, $5, $6, $7)`,
      [teacherId, 'Dr. Silva', 'professor.silva@escola.pt', teacherPassword, 'teacher', null, 'Escola Secundária Central']
    );

    // Inserir alunos
    const students = [
      {
        id: student1Id,
        name: 'João Santos',
        email: 'joao.santos@email.pt',
        grade: '8º',
      },
      {
        id: student2Id,
        name: 'Maria Oliveira',
        email: 'maria.oliveira@email.pt',
        grade: '8º',
      },
      {
        id: student3Id,
        name: 'Pedro Costa',
        email: 'pedro.costa@email.pt',
        grade: '9º',
      },
    ];

    for (const student of students) {
      await pool.query(
        `INSERT INTO users (id, name, email, password, role, grade, school) VALUES
         ($1, $2, $3, $4, $5, $6, $7)`,
        [
          student.id,
          student.name,
          student.email,
          studentPassword,
          'student',
          student.grade,
          'Escola Secundária Central',
        ]
      );
    }

    console.log('✅ Utilizadores criados com sucesso!');

    // Criar perfis de gamificação
    for (const student of students) {
      const profileId = uuidv4();
      await pool.query(
        `INSERT INTO gamification_profiles (id, user_id, points, level, experience) VALUES
         ($1, $2, $3, $4, $5)`,
        [profileId, student.id, Math.floor(Math.random() * 500), Math.floor(Math.random() * 5) + 1, Math.floor(Math.random() * 500)]
      );
    }

    console.log('✅ Perfis de gamificação criados!');

    // Criar sessões de jogo de teste
    const session1Id = uuidv4();
    const session2Id = uuidv4();

    await pool.query(
      `INSERT INTO game_sessions (id, user_id, scenario, start_time, end_time, state) VALUES
       ($1, $2, $3, $4, $5, $6)`,
      [
        session1Id,
        student1Id,
        'scenario_1',
        new Date(Date.now() - 3600000),
        new Date(),
        JSON.stringify({
          currentScene: 'game_end',
          inventory: ['clue_1', 'clue_2'],
          choices_made: [
            { sceneId: 'school_intro', choiceId: 'approach' },
            { sceneId: 'bullying_scene', choiceId: 'intervene_direct' },
          ],
          puzzles_solved: ['social_media_analysis'],
          discovered_clues: ['social_media_dm', 'witness_testimony'],
          game_active: false,
        }),
      ]
    );

    console.log('✅ Sessões de jogo criadas!');

    // Criar métricas
    const metricId = uuidv4();
    await pool.query(
      `INSERT INTO game_metrics (id, session_id, user_id, scenario, total_duration, decisions_count, puzzles_solved, clues_found, empathy_score, final_choice, completion_status) VALUES
       ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        metricId,
        session1Id,
        student1Id,
        'scenario_1',
        1800, // 30 minutos
        2,
        1,
        2,
        75,
        'intervene_direct',
        'completed',
      ]
    );

    console.log('✅ Métricas registadas!');

    // Atribuir badges
    const badgeId = uuidv4();
    await pool.query(
      `INSERT INTO user_badges (id, user_id, badge_id, description) VALUES
       ($1, $2, $3, $4)`,
      [badgeId, student1Id, 'first_game', 'Completou o primeiro jogo!']
    );

    console.log('✅ Badges atribuídas!');

    console.log('\n🎉 Base de dados populada com sucesso!');
    console.log('\n📝 Credenciais de teste:');
    console.log('   Professor: professor.silva@escola.pt / teacher123');
    console.log('   Aluno 1:   joao.santos@email.pt / student123');
    console.log('   Aluno 2:   maria.oliveira@email.pt / student123');
    console.log('   Aluno 3:   pedro.costa@email.pt / student123');
  } catch (error) {
    console.error('❌ Erro ao popular base de dados:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seedDatabase();
