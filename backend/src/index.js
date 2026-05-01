import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Import routes
import gameRoutes from './routes/gameRoutes.js';
import userRoutes from './routes/userRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
// FIX #1 — Rotas de puzzles e pistas estavam em falta
import puzzleRoutes from './routes/puzzleRoutes.js';
import hintRoutes from './routes/hintRoutes.js';
import { GameController } from './controllers/GameController.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ARQUITETURA DE TRÊS CAMADAS
 * 
 * CAMADA 1: APRESENTAÇÃO (Handled by React Frontend)
 * - Interface do utilizador (React components)
 * - Renderização de cenários narrativos
 * - Visualização de puzzles e escolhas
 * 
 * CAMADA 2: LÓGICA DE NEGÓCIO (Routes + Controllers)
 * - State Manager: Gerenciar estado do jogo
 * - Decision Engine: Processar escolhas e consequências
 * - Gamification Engine: Pontos, badges, progressão
 * 
 * CAMADA 3: DADOS (Database Layer)
 * - PostgreSQL database
 * - User sessions, game metrics, gamification data
 * - Export functionality (CSV/JSON)
 */

// API Routes
app.use('/api/game', gameRoutes);
app.use('/api/users', userRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/teachers', teacherRoutes);
// FIX #1 — Montar rotas de puzzles e pistas
app.use('/api/puzzles', puzzleRoutes);
app.use('/api/hints', hintRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running', timestamp: new Date().toISOString() });
});

// Socket.io for real-time events (chat simulation in Scenario 2, live notifications)
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_game_session', (data) => {
    socket.join(`game_${data.sessionId}`);
    console.log(`Client ${socket.id} joined game session ${data.sessionId}`);
  });

  socket.on('game_decision', (data) => {
    // Broadcast decision to other players in same session (for collaborative features)
    io.to(`game_${data.sessionId}`).emit('decision_made', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

await GameController.initialize();

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`\n🎮 Escape Room Digital - Backend Running on port ${PORT}`);
  console.log(`📊 Architecture: Three-layer system (Presentation, Business Logic, Data)`);
  console.log(`🔄 Real-time support enabled (Socket.io)`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN}`);
  console.log('\n--- Endpoints ---');
  console.log('GET  /api/health           - Server health check');
  console.log('POST /api/users/register   - Register new user');
  console.log('POST /api/users/login      - User login');
  console.log('POST /api/game/session     - Start new game session');
  console.log('POST /api/game/decision    - Record player decision');
  console.log('GET  /api/metrics/export   - Export session metrics');
  console.log('GET  /api/gamification/user - Get user achievements');
  console.log('GET  /api/teachers/dashboard - Teacher monitoring dashboard');
  console.log('\n');
});

export { io };
