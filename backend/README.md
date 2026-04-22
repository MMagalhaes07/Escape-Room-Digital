# 🎮 Escape Room Digital - Backend

**Sistema pedagógico interativo para prevenção de bullying e cyberbullying**

## 📋 Visão Geral

Backend REST API desenvolvido em Node.js + Express que suporta:

- **CAMADA 1 (Apresentação)**: Interface do React (frontend)
- **CAMADA 2 (Lógica de Negócio)**: Controllers com State Manager e Decision Engine
- **CAMADA 3 (Dados)**: PostgreSQL com modelos ORM customizados

## 🏗️ Arquitetura em Três Camadas

```
┌─────────────────────────────────────────────┐
│  CAMADA 1: APRESENTAÇÃO (React Frontend)    │
│  - Interfaces dos cenários                   │
│  - Visualização de puzzles e escolhas       │
└──────────────┬──────────────────────────────┘
               │ HTTP/WebSocket
┌──────────────▼──────────────────────────────┐
│  CAMADA 2: LÓGICA DE NEGÓCIO                │
│  - State Manager (gerencia estado do jogo)  │
│  - Decision Engine (processa escolhas)      │
│  - Gamification Engine (pontos, badges)     │
│  - Analytics Engine (Big Data)              │
└──────────────┬──────────────────────────────┘
               │ Pool de Conexões
┌──────────────▼──────────────────────────────┐
│  CAMADA 3: DADOS (PostgreSQL)               │
│  - Users, Sessions, Decisions               │
│  - Metrics, Gamification, Leaderboards      │
└─────────────────────────────────────────────┘
```

## 🚀 Instalação e Execução

### 1. Pré-requisitos

- Node.js 16+
- PostgreSQL 12+
- npm

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Editar `.env` com suas credenciais PostgreSQL:

```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/escape_room_db
NODE_ENV=development
JWT_SECRET=seu-secret-aleatorio-aqui
CORS_ORIGIN=http://localhost:3000
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Configurar Base de Dados

```bash
# Criar tabelas
npm run db:setup

# Popular com dados de teste
npm run db:seed
```

### 5. Iniciar Servidor

```bash
# Modo desenvolvimento (com hot-reload)
npm run dev

# Modo produção
npm start
```

Servidor estará disponível em `http://localhost:5000`

## 📚 API Endpoints

### Autenticação (Users)

```
POST   /api/users/register        - Registar novo utilizador
POST   /api/users/login           - Login
GET    /api/users/:userId         - Obter perfil
PUT    /api/users/:userId         - Atualizar perfil
```

### Jogo (Game)

```
POST   /api/game/session          - Iniciar nova sessão
POST   /api/game/decision         - Registar decisão
POST   /api/game/puzzle           - Completar puzzle
POST   /api/game/clue             - Descobrir pista
POST   /api/game/finish           - Finalizar sessão
```

### Métricas (Metrics)

```
GET    /api/metrics/user/:userId  - Estatísticas do utilizador
GET    /api/metrics/export        - Exportar em CSV
GET    /api/metrics/analytics     - Big Data Analytics
```

### Gamificação (Gamification)

```
GET    /api/gamification/user/:userId           - Perfil de gamificação
GET    /api/gamification/leaderboard            - Leaderboard global
GET    /api/gamification/leaderboard/:grade     - Leaderboard por turma
GET    /api/gamification/badges                 - Badges disponíveis
```

### Dashboard do Professor (Teacher)

```
GET    /api/teachers/dashboard          - Dashboard principal
GET    /api/teachers/student/:studentId - Perfil de aluno
GET    /api/teachers/class-report       - Relatório de classe
GET    /api/teachers/export             - Exportar relatório CSV
```

## 🎯 Funcionalidades Pedagógicas

### State Manager

Gerencia o estado completo do jogo para cada sessão:

- Cena atual
- Inventário de pistas
- Escolhas realizadas
- Puzzles resolvidos
- Progresso geral

### Decision Engine

Processa decisões do jogador e calcula:

- Consequências diretas
- Impacto na empatia (0-100)
- Desbloqueio de cenários alternativos
- Feedback pedagógico personalizado

### Gamification Engine

Sistema de motivação com:

- **Pontos**: Por ações (decisão: 25, puzzle: 30, pista: 10)
- **Níveis**: 100 XP por nível (máximo 10)
- **Badges**: 8 badges diferentes (empatia, investigação, etc.)
- **Leaderboard**: Global e por turma

### Big Data Analytics

Análise em larga escala:

- Padrões de decisão entre utilizadores
- Tendências pedagógicas por cenário
- Identificação de alunos em risco (empathy score < 40)
- Exportação de dados em CSV/JSON

## 🔐 Segurança

- **Autenticação**: JWT (JSON Web Tokens)
- **Passwords**: Bcrypt com salt 10
- **CORS**: Configurável por variável de ambiente
- **Validação**: Input validation em todos os endpoints

## 🌐 Real-time (WebSocket)

Socket.io configurado para:

- Notificações em tempo real
- Chat simulado (Cenário 2)
- Sincronização de progresso entre devices

## 📊 Base de Dados

### Tabelas Principais

**users**: Utilizadores (alunos e professores)
**game_sessions**: Sessões de jogo (estado completo)
**game_decisions**: Histórico de decisões
**game_metrics**: Métricas de performance e aprendizagem
**gamification_profiles**: Pontos, níveis, experiência
**user_badges**: Badges obtidas
**points_transactions**: Log de todas as transações de pontos

Índices otimizados para queries frequentes de analytics.

## 🛠️ Desenvolvimento

### Estrutura de Pastas

```
backend/
├── src/
│   ├── index.js                 # Entrada principal
│   ├── controllers/             # Lógica de negócio
│   ├── models/                  # Camada de dados
│   ├── routes/                  # Endpoints da API
│   ├── middleware/              # Autenticação, validação
│   ├── db/                      # Configuração PostgreSQL
│   └── utils/                   # Funções auxiliares
├── scripts/
│   ├── setupDatabase.js         # Criar tabelas
│   └── seedDatabase.js          # Popular com dados de teste
├── package.json
├── .env.example
└── README.md
```

### Adicionar Novo Endpoint

1. Criar método no Controller correspondente (`src/controllers/`)
2. Adicionar rota em `src/routes/`
3. Se precisar persistência, criar/usar Model em `src/models/`
4. Testar com cURL ou Postman

## 📈 Escalabilidade

Sistema projetado para:

- Connection pooling PostgreSQL (20 conexões máximo)
- Índices otimizados para queries analíticas
- Possibilidade de migração para cache (Redis)
- Suporte a múltiplos cenários e extensões futuras

## 📝 Relatório Técnico

Ver `docs/TECHNICAL_REPORT.md` para documentação completa sobre:

- Decisões arquiteturais
- Modelos pedagógicos implementados
- Fluxo de dados
- Casos de uso detalhados

## 👨‍🎓 Credenciais de Teste

Após `npm run db:seed`:

```
Professor:
- Email: professor.silva@escola.pt
- Password: teacher123

Alunos:
- Email: joao.santos@email.pt / student123
- Email: maria.oliveira@email.pt / student123
- Email: pedro.costa@email.pt / student123
```

## 🤝 Contribuição

Este é um projeto de Engenharia Informática. Melhorias e sugestões são bem-vindas!

## 📄 Licença

MIT License - Ver LICENSE.md para detalhes
