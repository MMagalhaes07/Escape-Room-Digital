# 📁 Estrutura Completa do Projeto

## Visão Geral

```
Escape-Room-Digital/
├── backend/                                    # API Node.js/Express
├── frontend/                                   # Frontend React/Vite
├── docs/                                       # Documentação técnica
├── README.md                                   # Documentação principal
└── ROADMAP.md                                  # Plano de desenvolvimento
```

---

## Backend (`/backend`)

### Estrutura Completa

```
backend/
│
├── src/
│   ├── index.js
│   │   └── Arquivo principal do servidor Express
│   │       - Configuração de middleware
│   │       - Mounting de rotas
│   │       - Socket.io para real-time
│   │       - Error handling global
│   │       - Documentação de 3-layer architecture
│   │
│   ├── db/
│   │   └── pool.js
│   │       - Conexão PostgreSQL com pooling
│   │       - Query executor com error handling
│   │       - Gerenciamento de transações
│   │
│   ├── models/
│   │   ├── UserModel.js
│   │   │   - Métodos CRUD para users
│   │   │   - findByEmail, findById, findBySchool
│   │   │   - create, update, delete
│   │   │
│   │   ├── GameSessionModel.js
│   │   │   - Gerenciar estado da sessão de jogo
│   │   │   - State Manager (persistência)
│   │   │   - create, updateState, finalize
│   │   │
│   │   ├── GameDecisionModel.js
│   │   │   - Registar decisões do jogador
│   │   │   - Decision Engine (histórico de escolhas)
│   │   │   - record, getSessionDecisions, getPatterns
│   │   │
│   │   ├── GameMetricsModel.js
│   │   │   - Big Data Analytics
│   │   │   - Métricas pedagógicas
│   │   │   - recordSessionMetrics, getUserStatistics
│   │   │   - getLargeScaleAnalytics, exportMetricsCSV
│   │   │
│   │   └── GamificationModel.js
│   │       - Sistema de pontos e badges
│   │       - Leaderboards e progressão
│   │       - getOrCreateProfile, addPoints, awardBadge
│   │       - getLeaderboard, getGradeLeaderboard
│   │
│   ├── controllers/
│   │   ├── GameController.js
│   │   │   - Lógica principal do jogo
│   │   │   - startSession, recordDecision
│   │   │   - completePuzzle, discoverClue
│   │   │   - finishSession, generateFeedback
│   │   │   - GAME_NARRATIVES (definiçção de cenários)
│   │   │
│   │   ├── MetricsController.js
│   │   │   - Análise e exportação de dados
│   │   │   - getUserStats, exportMetricsCSV
│   │   │   - getLargeScaleAnalytics
│   │   │
│   │   ├── GamificationController.js
│   │   │   - Gerenciar gamificação
│   │   │   - getUserProfile, getLeaderboard
│   │   │   - getAvailableBadges
│   │   │
│   │   ├── TeacherController.js
│   │   │   - Dashboard de professor
│   │   │   - getDashboard, getStudentProfile
│   │   │   - getClassReport, generateRecommendations
│   │   │
│   │   └── UserController.js
│   │       - Autenticação e perfil
│   │       - register, login, getProfile, updateProfile
│   │
│   ├── routes/
│   │   ├── gameRoutes.js
│   │   │   - POST /session (initiar jogo)
│   │   │   - POST /decision (registar decisão)
│   │   │   - POST /puzzle (completar puzzle)
│   │   │   - POST /clue (recolher pista)
│   │   │   - POST /finish (terminar sessão)
│   │   │
│   │   ├── userRoutes.js
│   │   │   - POST /register
│   │   │   - POST /login
│   │   │   - GET /:userId (getProfile)
│   │   │   - PUT /:userId (updateProfile)
│   │   │
│   │   ├── metricsRoutes.js
│   │   │   - GET /user/:userId
│   │   │   - GET /export
│   │   │   - GET /analytics
│   │   │
│   │   ├── gamificationRoutes.js
│   │   │   - GET /user/:userId
│   │   │   - GET /leaderboard
│   │   │   - GET /leaderboard/:grade
│   │   │   - GET /badges
│   │   │
│   │   └── teacherRoutes.js
│   │       - GET /dashboard
│   │       - GET /student/:studentId
│   │       - GET /class-report
│   │       - GET /export
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   │   - Verificação de JWT
│   │   │   - Extração de user do token
│   │   │
│   │   └── validation.js
│   │       - Validação de input
│   │       - Sanitização de dados
│   │
│   └── utils/
│       ├── errorHandler.js
│       │   - Formatação de erros
│       │   - Respostas padronizadas
│       │
│       └── jwt.js
│           - Geração de tokens
│           - Verificação de assinatura
│
├── scripts/
│   ├── setupDatabase.js
│   │   - Criar todas as tabelas
│   │   - Índices otimizados
│   │   - Seed de badges
│   │   - Executar com: npm run db:setup
│   │
│   └── seedDatabase.js
│       - Criar dados de teste
│       - 1 professor + 3 alunos
│       - Sample game sessions
│       - Executar com: npm run db:seed
│
├── package.json
│   - Dependências Node.js
│   - Scripts de build/dev
│   - Versões do Express, pg, Socket.io, etc
│
├── .env.example
│   - Template de variáveis de ambiente
│   - DATABASE_URL, JWT_SECRET, CORS_ORIGIN, etc
│
└── README.md
    - Documentação de setup
    - Instruções de instalação
    - Endpoints disponíveis
```

---

## Frontend (`/frontend`)

### Estrutura Completa

```
frontend/
│
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   │   - Autenticação de utilizadores
│   │   │   - Formulário de login
│   │   │   - Exibe credenciais de teste
│   │   │
│   │   ├── RegisterPage.jsx
│   │   │   - Registo de novos utilizadores
│   │   │   - Seleção de role (student/teacher)
│   │   │   - Validação de password
│   │   │
│   │   ├── AuthPages.css
│   │   │   - Estilos compartilhados de autenticação
│   │   │   - Auth card design
│   │   │   - Test credentials box
│   │   │
│   │   ├── DashboardPage.jsx
│   │   │   - Dashboard do aluno
│   │   │   - Stats (sessões, empatia, pontos, nível)
│   │   │   - Seleção de cenários
│   │   │   - Display de badges
│   │   │
│   │   ├── Dashboard.css
│   │   │   - Grid layout de stats
│   │   │   - Scenario cards
│   │   │   - Badge display
│   │   │
│   │   ├── GamePage.jsx
│   │   │   - Container principal do jogo
│   │   │   - Inicializa GameSession
│   │   │   - Renderiza componentes de jogo
│   │   │   - Estrutura para SceneRenderer, Inventory, etc
│   │   │
│   │   ├── GamePage.css
│   │   │   - Game container layout
│   │   │   - Scene container
│   │   │   - Sidebar para inventory
│   │   │
│   │   ├── ProfilePage.jsx
│   │   │   - Perfil do utilizador
│   │   │   - Display de informações
│   │   │   - Edição de dados
│   │   │
│   │   ├── Profile.css
│   │   │   - Profile card styling
│   │   │   - Edit form
│   │   │
│   │   ├── TeacherDashboard.jsx
│   │   │   - Dashboard para professores
│   │   │   - Analytics gerais
│   │   │   - Lista de alunos em risco
│   │   │   - Top performers
│   │   │   - Modal de detalhes
│   │   │
│   │   └── TeacherDashboard.css
│   │       - Analytics section styling
│   │       - Student list cards
│   │       - Leaderboard styling
│   │
│   ├── components/
│   │   ├── Navbar.jsx
│   │   │   - Navegação principal
│   │   │   - Menu de cenários
│   │   │   - Perfil do utilizador
│   │   │   - Dropdown menu
│   │   │
│   │   ├── Navbar.css
│   │   │   - Navbar styling
│   │   │   - Dropdown interactions
│   │   │
│   │   ├── Notification.jsx
│   │   │   - Sistema de notificações
│   │   │   - Toast messages
│   │   │   - Auto-dismiss
│   │   │
│   │   ├── Notification.css
│   │   │   - Toast styling
│   │   │   - Animations
│   │   │
│   │   ├── SceneRenderer.jsx
│   │   │   - Renderiza cena do jogo
│   │   │   - Narrativa e descrição
│   │   │   - Botões de escolha
│   │   │   - Progress bar
│   │   │
│   │   ├── Inventory.jsx
│   │   │   - Exibe pistas recolhidas
│   │   │   - Itens inventário
│   │   │   - Stats de itens
│   │   │
│   │   ├── PuzzleInterface.jsx
│   │   │   - Interface de puzzle
│   │   │   - Suporta: text input, multiple choice, ordering
│   │   │   - Validação e feedback
│   │   │
│   │   ├── SessionMetrics.jsx
│   │   │   - Métricas da sessão em tempo real
│   │   │   - Score de empatia
│   │   │   - Tempo decorrido
│   │   │   - Decisões registadas
│   │   │
│   │   └── GameComponents.css
│   │       - Estilos para todos os componentes de jogo
│   │       - Scene styling
│   │       - Choice buttons
│   │       - Inventory layout
│   │       - Puzzle interface
│   │       - Metrics display
│   │
│   ├── store/
│   │   └── index.js
│   │       - useAuthStore (autenticação)
│   │       - useGameStore (estado do jogo)
│   │       - usePlayerStore (gamificação e stats)
│   │       - useUIStore (estado da UI)
│   │       - Todas as actions e getters
│   │
│   ├── services/
│   │   └── api.js
│   │       - Axios client com JWT injection
│   │       - API.auth (login, register, profile)
│   │       - API.game (session, decision, puzzle, clue)
│   │       - API.metrics (stats, export, analytics)
│   │       - API.gamification (profile, leaderboard, badges)
│   │       - API.teacher (dashboard, student, report)
│   │
│   ├── styles/
│   │   └── global.css
│   │       - Design system completo
│   │       - CSS variables (cores, spacing, raios)
│   │       - Componentes base (.button, .card, .badge, etc)
│   │       - Animations e utilities
│   │       - Media queries responsivas
│   │
│   ├── App.jsx
│   │   - Componente raiz
│   │   - Routing com React Router
│   │   - Protected routes
│   │   - Layout base
│   │
│   └── main.jsx
│       - Entry point React
│       - React StrictMode
│       - Root mounting
│
├── index.html
│   - HTML entry point
│   - Meta tags
│   - Root div
│   - Script imports
│
├── vite.config.js
│   - Configuração Vite
│   - Port 3000
│   - Proxy para API
│
├── package.json
│   - Dependências React
│   - Scripts (dev, build, test)
│   - Versões de Vite, React Router, Zustand, etc
│
└── README.md
    - Documentação de setup
    - Instruções de instalação
    - Descrição de componentes
    - Guia de state management
```

---

## Documentação (`/docs`)

```
docs/
│
├── TECHNICAL_DOCUMENTATION.md
│   - Arquitetura detalhada
│   - Stack tecnológico
│   - Database schema
│   - API endpoints referência
│   - Segurança e performance
│   - Deployment info
│
├── API_DOCUMENTATION.md (futuro)
│   - Referência completa de endpoints
│   - Request/Response examples
│   - Error codes
│   - Rate limiting
│
└── ARCHITECTURE.md (futuro)
    - Diagramas visuais
    - Data flow
    - Component hierarchy
    - State management flow
```

---

## Arquivos Principais do Projeto Root

```
Escape-Room-Digital/
│
├── README.md
│   - Documentação principal do projeto
│   - Visão geral, objetivos pedagógicos
│   - Stack tecnológico
│   - Início rápido (backend/frontend)
│   - Funcionalidades implementadas
│   - Alinhamento com relatório de proposta
│
├── ROADMAP.md
│   - Próximos passos de desenvolvimento
│   - Fases de implementação
│   - Timeline sugerida
│   - Checklist pré-launch
│   - Links úteis
│
└── Proposta_de_projeto_LEI_-_Mafalda_Magalhães.docx
    - Relatório original da proposta
    - Especificação pedagógica
    - Requisitos funcionais
    - Referências bibliográficas
```

---

## Árvore Completa

```
.
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── db/pool.js
│   │   ├── models/
│   │   │   ├── UserModel.js
│   │   │   ├── GameSessionModel.js
│   │   │   ├── GameDecisionModel.js
│   │   │   ├── GameMetricsModel.js
│   │   │   └── GamificationModel.js
│   │   ├── controllers/
│   │   │   ├── GameController.js
│   │   │   ├── MetricsController.js
│   │   │   ├── GamificationController.js
│   │   │   ├── TeacherController.js
│   │   │   └── UserController.js
│   │   ├── routes/
│   │   │   ├── gameRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── metricsRoutes.js
│   │   │   ├── gamificationRoutes.js
│   │   │   └── teacherRoutes.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   └── utils/
│   │       ├── errorHandler.js
│   │       └── jwt.js
│   ├── scripts/
│   │   ├── setupDatabase.js
│   │   └── seedDatabase.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── AuthPages.css
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── Dashboard.css
│   │   │   ├── GamePage.jsx
│   │   │   ├── GamePage.css
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── Profile.css
│   │   │   ├── TeacherDashboard.jsx
│   │   │   └── TeacherDashboard.css
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Navbar.css
│   │   │   ├── Notification.jsx
│   │   │   ├── Notification.css
│   │   │   ├── SceneRenderer.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── PuzzleInterface.jsx
│   │   │   ├── SessionMetrics.jsx
│   │   │   └── GameComponents.css
│   │   ├── store/
│   │   │   └── index.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
│
├── docs/
│   ├── TECHNICAL_DOCUMENTATION.md
│   ├── API_DOCUMENTATION.md (futuro)
│   └── ARCHITECTURE.md (futuro)
│
├── README.md
├── ROADMAP.md
├── Proposta_de_projeto_LEI_-_Mafalda_Magalhães.docx
└── .gitignore
```

---

## Resumo de Arquivo Counts

- **Backend**: ~30 arquivos (src + scripts)
- **Frontend**: ~25 arquivos (src + config)
- **Documentation**: ~5 arquivos
- **Root**: 4 arquivos
- **Total**: ~64 arquivos

---

## Convenções de Nomeação

### Backend

- **Controllers**: `{Entity}Controller.js`
- **Models**: `{Entity}Model.js`
- **Routes**: `{entity}Routes.js`
- **Middleware**: `{function}.js`

### Frontend

- **Pages**: `{EntityName}Page.jsx` + `{EntityName}Page.css`
- **Components**: `{ComponentName}.jsx` + `.css`
- **Stores**: Zustand em `store/index.js`
- **Services**: Axios em `services/api.js`

### General

- Imports em order: React imports, project imports, styles
- Comentários em português para documentação pedagógica
- JSDoc para functions públicas

---

**Estrutura criada com cuidado para manutenibilidade e escalabilidade**
