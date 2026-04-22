# Documentação Técnica - Escape Room Digital

## 📋 Índice

1. [Arquitetura](#arquitetura)
2. [Camadas](#camadas-de-aplicação)
3. [Sistema de Narrativas](#sistema-de-narrativas-twine)
4. [API Endpoints](#api-endpoints)
5. [Base de Dados](#base-de-dados)
6. [Gamificação](#sistema-de-gamificação)
7. [Segurança](#segurança)

---

## 🏗️ Arquitetura

### Visão Geral - Arquitetura em 3 Camadas

```
┌─────────────────────────────────────────┐
│   CAMADA 1: APRESENTAÇÃO (Frontend)     │
│   React 18 + Vite + Zustand             │
│   Página 3000 | Components + Pages      │
└────────────────┬────────────────────────┘
                 │ HTTP/JSON
                 ↓
┌─────────────────────────────────────────┐
│   CAMADA 2: LÓGICA DE NEGÓCIO           │
│   Express.js + Controllers              │
│   Porta 5000 | Decision Engine + State  │
│   Manager (Narrative, Gamification)     │
└────────────────┬────────────────────────┘
                 │ SQL Queries
                 ↓
┌─────────────────────────────────────────┐
│   CAMADA 3: DADOS                       │
│   PostgreSQL 12+                        │
│   8 Tabelas | Índices Otimizados        │
└─────────────────────────────────────────┘
```

### Stack Técnico

**Backend**

- Node.js 16+ com Express 4.18.2
- PostgreSQL 12+ com pool de conexões
- Socket.io 4.7.2 (para real-time em futuro)
- Bcryptjs + JWT para segurança

**Frontend**

- React 18.2.0 com React Router 6.20.1
- Vite 5.0.8 (build tool)
- Zustand 4.4.7 (state management)
- Axios 1.6.5 (HTTP client)
- CSS3 com Grid/Flexbox

**Narrativas**

- Twine 2 (formato JSON/Harlowe)
- TwineParser.js (conversão)
- NarrativeManager.js (cache e carregamento)

---

## 🎯 Camadas de Aplicação

### Camada 1: Apresentação (Frontend)

**Localização**: `frontend/src/`

**Arquitetura**:

```
src/
├── pages/           # Componentes de página
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── GamePage.jsx
│   ├── ProfilePage.jsx
│   └── TeacherDashboard.jsx
│
├── components/      # Componentes reutilizáveis
│   ├── Navbar.jsx
│   ├── Notification.jsx
│   ├── SceneRenderer.jsx    # Renderiza cenas Twine
│   ├── Inventory.jsx        # Itens coletados
│   ├── PuzzleInterface.jsx  # Desafios
│   ├── SessionMetrics.jsx   # Estatísticas
│   └── TeacherDashboard.jsx # Monitoramento
│
├── store/          # Zustand stores
│   ├── authStore.js
│   ├── gameStore.js
│   ├── playerStore.js
│   └── uiStore.js
│
├── services/       # API client
│   └── api.js
│
├── styles/         # CSS global e por componente
│   ├── index.css
│   └── [Page/Component].css
│
└── App.jsx         # Roteamento principal
```

**Fluxo de Dados**:

```
User Input → Component → Zustand Store → API Call
                          ↓
                      Backend
                          ↓
API Response → Store Update → Re-render Component
```

### Camada 2: Lógica de Negócio (Backend)

**Localização**: `backend/src/`

**Módulos Principais**:

#### Controllers (Orquestração)

- **GameController.js** - Orquestra narrativas, decisões, puzzle
  - `initialize()` - Carrega narrativas Twine
  - `startSession()` - Inicia jogo
  - `recordDecision()` - Processa escolha
  - `completePuzzle()` - Valida solução
  - `finishSession()` - Finaliza e gera feedback

- **UserController.js** - Autenticação e perfil
- **MetricsController.js** - Análise de dados
- **TeacherController.js** - Dashboard de monitoramento
- **GamificationController.js** - Pontos e badges

#### Models (Acesso a Dados)

- **GameSessionModel.js** - Cria/atualiza sessões
- **GameDecisionModel.js** - Registra decisões
- **GameMetricsModel.js** - Coleta analytics
- **GamificationModel.js** - Gerencia pontos/badges
- **UserModel.js** - Perfil do usuário

#### Utils (Utilitários)

- **TwineParser.js** - Converte JSON Twine para estrutura interna
  - Valida integridade (ligações órfãs)
  - Calcula caminhos de empatia
  - Extrai puzzles e metadados

- **NarrativeManager.js** - Gerencia narrativas em runtime
  - Carrega ficheiros `.twine`
  - Cache de narrativas parseadas
  - Hot-reload em desenvolvimento
  - Validação de caminhos

#### Routes (Endpoints)

- `/api/game/*` - Todas operações de jogo
- `/api/user/*` - Autenticação e perfil
- `/api/metrics/*` - Análise de dados
- `/api/teacher/*` - Recursos de professores

---

## 📖 Sistema de Narrativas (Twine)

### O que é Twine?

**Twine** é um formato de autoria de narrativa interativa que permite:

- Edição visual ou código
- Exportação para JSON
- Suporte para lógica condicional (Harlowe)
- Separação entre conteúdo narrativo e código

### Pipeline de Narrativas

```
Ficheiro Twine (.twine JSON)
         ↓
   TwineParser.validate()
         ↓
   TwineParser.parseTwineNarrative()
         ↓
   Estrutura Interna JavaScript
         ↓
   NarrativeManager.cache()
         ↓
   GameController acessa via narrativeManager.getNarrative()
```

### Estrutura Twine

**Ficheiros**: `backend/narratives/*.twine`

```json
{
  "name": "Escape Room Digital - Cenário 1",
  "ifid": "scene-1-school",
  "format": "Harlowe",
  "passages": [
    {
      "pid": "1",
      "name": "school_intro",
      "text": "Conteúdo da cena narrado ao jogador...",
      "tags": "start, school",
      "links": [
        {
          "linkText": "Texto da escolha",
          "target": "next_scene_name",
          "empathyScore": 70,
          "risk": "low",
          "consequence": "positive"
        }
      ]
    }
  ]
}
```

### Métricas de Narrativa

Automaticamente calculadas:

```
totalEmpathyPath = Σ(empathyScore cada escolha) / nº escolhas

Faixas:
- 80-100: Comportamento altamente empático
- 60-79: Comportamento empático positivo
- 40-59: Comportamento neutro/misto
- 20-39: Comportamento evitador
- 0-19: Comportamento prejudicial
```

### Puzzles Integrados

Cada puzzle é uma passage Twine com tag `puzzle`:

```json
{
  "name": "puzzle_social_media",
  "text": "**PUZZLE: Análise de Redes Sociais**\n\nIdentifique quantas pessoas...",
  "tags": "puzzle, analytical",
  "puzzle": "social_media_analysis"
}
```

Validação de solução: `TwineParser.validatePuzzleSolution()`

- Busca palavras-chave esperadas
- Exemplo: `['pessoas', 'comentários', 'padrão']`

---

## 🔌 API Endpoints

### Autenticação

```http
POST /api/user/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@escola.pt",
  "password": "senha_segura",
  "role": "student"
}

Response: 201
{
  "success": true,
  "userId": "uuid",
  "token": "jwt_token"
}
```

```http
POST /api/user/login
Content-Type: application/json

{
  "email": "joao@escola.pt",
  "password": "senha_segura"
}

Response: 200
{
  "success": true,
  "token": "jwt_token",
  "user": { ... }
}
```

### Jogo

```http
POST /api/game/start-session
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "userId": "uuid",
  "scenario": "scenario_1"
}

Response: 201
{
  "success": true,
  "session": {
    "sessionId": "uuid",
    "narrative": {
      "title": "O Testemunho",
      "initialScene": "school_intro",
      "scenes": { ... },
      "puzzles": [ ... ]
    }
  }
}
```

```http
POST /api/game/record-decision
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "sessionId": "uuid",
  "userId": "uuid",
  "sceneId": "school_intro",
  "choiceText": "Aproximar-se para ver"
}

Response: 200
{
  "success": true,
  "consequence": {
    "empathy_score": 30,
    "impact": "neutral",
    "text": "Sua escolha: \"Aproximar-se...\""
  },
  "nextScene": "approach_scene",
  "currentEmpathy": 30
}
```

```http
POST /api/game/complete-puzzle
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "sessionId": "uuid",
  "userId": "uuid",
  "puzzleId": "social_media_analysis",
  "solution": "Encontrei 12 pessoas participando"
}

Response: 200
{
  "success": true,
  "points": 50,
  "message": "Puzzle solved!"
}
```

```http
POST /api/game/finish-session
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "sessionId": "uuid",
  "userId": "uuid",
  "finalSceneId": "game_end_hero"
}

Response: 200
{
  "success": true,
  "sessionSummary": {
    "duration": 1847,
    "choicesMade": 5,
    "puzzlesSolved": 2,
    "empathyScore": 82,
    "finalScene": "game_end_hero"
  },
  "pedagogicalFeedback": {
    "empathyReflection": "🌟 Excelente!...",
    "strategiesForIntervention": [ ... ],
    "keyLearnings": [ ... ]
  }
}
```

### Gamificação

```http
GET /api/gamification/leaderboard?limit=10
Response: 200
[
  {
    "rank": 1,
    "userId": "uuid",
    "userName": "João",
    "points": 2450,
    "badges": ["PUZZLE_MASTER", "EMPATHY_HERO"]
  }
]
```

```http
GET /api/gamification/badges/:userId
Response: 200
{
  "userId": "uuid",
  "badges": [
    {
      "id": "PUZZLE_MASTER",
      "name": "Mestre de Puzzles",
      "earnedAt": "2024-04-22T10:30:00Z"
    }
  ]
}
```

### Teacher Dashboard

```http
GET /api/teacher/monitoring
Authorization: Bearer teacher_token
Response: 200
{
  "students": [
    {
      "userId": "uuid",
      "name": "João Silva",
      "completedSessions": 2,
      "averageEmpathy": 75,
      "riskIndicators": []
    }
  ]
}
```

---

## 🗄️ Base de Dados

### Schema

#### Tabela: `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50),  -- 'student', 'teacher', 'admin'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

#### Tabela: `game_sessions`

```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  scenario VARCHAR(50),
  state JSONB,  -- Armazena estado do jogo
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP,
  status VARCHAR(50)  -- 'active', 'completed', 'abandoned'
);

CREATE INDEX idx_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_sessions_status ON game_sessions(status);
```

#### Tabela: `game_decisions`

```sql
CREATE TABLE game_decisions (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES game_sessions(id),
  user_id UUID REFERENCES users(id),
  scene_id VARCHAR(255),
  choice_text TEXT,
  consequence JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_decisions_session_id ON game_decisions(session_id);
```

#### Tabela: `game_metrics`

```sql
CREATE TABLE game_metrics (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES game_sessions(id),
  user_id UUID REFERENCES users(id),
  scenario VARCHAR(50),
  total_duration INTEGER,  -- segundos
  decisions_count INTEGER,
  puzzles_solved INTEGER,
  empathy_score INTEGER,
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_metrics_user_id ON game_metrics(user_id);
CREATE INDEX idx_metrics_recorded_at ON game_metrics(recorded_at);
```

#### Tabela: `gamification`

```sql
CREATE TABLE gamification (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  points INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_gamification_points ON gamification(points DESC);
```

#### Tabela: `game_feedbacks`

```sql
CREATE TABLE game_feedbacks (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES game_sessions(id),
  user_id UUID REFERENCES users(id),
  empathy_reflection TEXT,
  strategies TEXT,
  key_learnings TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabelas: `teacher_notifications`, `student_progress` (Para futuro)

---

## 🎮 Sistema de Gamificação

### Pontos

| Ação                          | Pontos |
| ----------------------------- | ------ |
| Completar sessão              | +100   |
| Resolver puzzle               | +50    |
| Tomar decisão                 | +25    |
| Encontrar pista               | +10    |
| Primeira vitória empatia alta | +200   |

### Badges

| Badge            | Critério                              |
| ---------------- | ------------------------------------- |
| `PUZZLE_MASTER`  | Resolver 2+ puzzles                   |
| `EMPATHY_HERO`   | Empathy score ≥ 80                    |
| `DECISION_MAKER` | 10+ decisões                          |
| `WITNESS_HERO`   | Completar Cenário 1 com empathy ≥ 70  |
| `ALLY_DEFENDER`  | Completar Cenário 2 defendendo vítima |

### Leaderboard

Ordenado por:

1. Pontos totais (descendente)
2. Empathy score médio
3. Badges conquistadas

---

## 🔐 Segurança

### Autenticação

- JWT (JSON Web Tokens) com expiração 24h
- Senhas hasheadas com bcryptjs (salt rounds: 10)
- HTTPS obrigatório em produção

### Validação

- Input validation em todos endpoints
- CORS configurado para origins permitidas
- SQL injection prevention via parameterized queries
- Rate limiting em endpoints sensíveis

### Proteção de Dados

- Dados sensíveis encriptados em repouso
- GDPR compliance para dados estudantis
- Logs de auditoria para acessos de professores

---

## 📈 Monitoramento e Logs

### Logs

- Aplicação: `logs/app.log`
- Erros: `logs/error.log`
- Narrativas carregadas: Console na inicialização

### Métricas

- Tempo de resposta API
- Taxa de sucesso/erro
- Empathy score distribution
- Taxa de conclusão de sessões

---

## 🔧 Troubleshooting

### Narrativas não carregam

```bash
# Verificar ficheiros
ls backend/narratives/

# Validar JSON
node -e "console.log(JSON.parse(require('fs').readFileSync('backend/narratives/scenario_1_school.twine', 'utf-8')))"
```

### Puzzle não funciona

- Verificar `puzzleId` existe em `narrative.puzzles`
- Verificar keywords em `validatePuzzleSolution()`
- Checar se solution contém um keyword esperado

### Session timeout

- Aumentar lifetime do JWT
- Implementar refresh tokens

---

**Última atualização**: Abril 2024
**Versão**: 2.0 (com Twine Integration)
**Autor**: Escape Room Digital Project
