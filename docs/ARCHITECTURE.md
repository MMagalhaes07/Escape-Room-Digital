# Arquitetura Completa - Escape Room Digital

## 1. Visão Geral do Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ESCAPE ROOM DIGITAL - ARQUITETURA                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CAMADA 1: APRESENTAÇÃO (React Frontend)                                    │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Components:                                                            │ │
│  │  - NarrativeRenderer (renderiza nós Twine)                            │ │
│  │  - PuzzleInterface (exibe desafios interativos)                       │ │
│  │  - HintSystem (mostra pistas desbloqueadas)                           │ │
│  │  - FeedbackDisplay (exibe feedback educativo)                         │ │
│  │  - ProgressTracker (mostra progresso do jogador)                      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                ▲                             │
│                                API HTTP + Axios                              │
│                                                ▼                             │
│  CAMADA 2: LÓGICA DE NEGÓCIO (Express + Controllers)                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Routes: /api/game, /api/puzzles, /api/hints, /api/narratives           │ │
│  │                                                                        │ │
│  │ Controllers:                                                         │ │
│  │  - GameController (orquestra jogo)                                  │ │
│  │  - PuzzleController (valida respostas de puzzles)                   │ │
│  │  - HintController (gerencia desbloqueio de pistas)                  │ │
│  │  - NarrativeController (serve nós Twine)                            │ │
│  │                                                                      │ │
│  │ Engines:                                                            │ │
│  │  - NarrativeManager (carrega e cache Twine)                         │ │
│  │  - PuzzleValidator (valida respostas)                               │ │
│  │  - HintEngine (decide pistas a desbloquear)                         │ │
│  │  - EducationalFeedback (gera feedback contextualizado)              │ │
│  │  - StateManager (rastreia estado do jogador)                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                ▲                             │
│                                Query SQL                                     │
│                                                ▼                             │
│  CAMADA 3: DADOS (PostgreSQL)                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Tabelas:                                                              │ │
│  │  - users (utilizadores)                                              │ │
│  │  - game_sessions (sessões de jogo)                                   │ │
│  │  - game_decisions (escolhas do jogador)                              │ │
│  │  - puzzles (definições de puzzles - NOVA)                            │ │
│  │  - puzzle_answers (respostas de puzzles - NOVA)                      │ │
│  │  - hints (definições de pistas - NOVA)                               │ │
│  │  - player_hints (pistas desbloqueadas - NOVA)                        │ │
│  │  - player_hint_interactions (interações com pistas - NOVA)           │ │
│  │  - game_metrics (métricas de jogo)                                   │ │
│  │  - gamification_profiles (perfis de gamificação)                     │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  FICHEIROS ESTÁTICOS (Narrativas Twine):                                    │
│  - backend/narratives/scenario_1_echo_codigo.twine (JSON)                   │
│  - backend/narratives/scenario_2_clout_crueldade.twine (JSON)               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Fluxo de Dados - Exemplo: Resolver um Puzzle

```
┌──────────────────────────────────────────────────────────────────────────┐
│ FLUXO: Jogador Resolve um Puzzle e Desbloqueia Pistas                   │
└──────────────────────────────────────────────────────────────────────────┘

1. FRONTEND - Jogador submete resposta ao puzzle
   ┌─────────────────────────────────────┐
   │ POST /api/puzzles/solve              │
   │ {                                    │
   │   sessionId: "abc-123",              │
   │   puzzleId: "exif_metadata",         │
   │   answer: "B"                        │
   │ }                                    │
   └─────────────────────────────────────┘
                      ▼
2. BACKEND - PuzzleController.solvePuzzle()
   ┌─────────────────────────────────────┐
   │ 1. Validar entrada                   │
   │ 2. Recuperar sessão do jogador       │
   │ 3. Recuperar definição do puzzle     │
   │ 4. Chamar PuzzleValidator            │
   └─────────────────────────────────────┘
                      ▼
3. VALIDATOR - PuzzleValidator.validate()
   ┌─────────────────────────────────────┐
   │ 1. Comparar resposta com gabarito    │
   │ 2. Calcular score (0-100%)           │
   │ 3. Gerar feedback educativo          │
   │    - Se correto: "Parabéns! Você     │
   │      descobriu que..."               │
   │    - Se incorreto: "Considere que... │
   │      Tente novamente."               │
   │ 4. Retornar: {                       │
   │      isCorrect: true,                │
   │      score: 100,                     │
   │      feedback: "...",                │
   │      hintsUnlocked: [...]            │
   │    }                                 │
   └─────────────────────────────────────┘
                      ▼
4. HINT ENGINE - HintEngine.unlock()
   ┌─────────────────────────────────────┐
   │ 1. Recuperar todas as pistas         │
   │ 2. Verificar condições de unlock:    │
   │    - puzzlesSolved >= threshold?     │
   │    - playerScore >= minimum?         │
   │    - scenarioProgress >= stage?      │
   │    - empathyScore >= required?       │
   │ 3. Desbloquear pistas elegíveis      │
   │ 4. Retornar lista de pistas novas    │
   └─────────────────────────────────────┘
                      ▼
5. DATABASE - Persistir dados
   ┌─────────────────────────────────────┐
   │ INSERT INTO puzzle_answers (...);    │
   │ UPDATE game_sessions SET state=...; │
   │ INSERT INTO player_hints (...);      │
   │ UPDATE gamification_profiles ...;   │
   │ INSERT INTO points_transactions ...; │
   └─────────────────────────────────────┘
                      ▼
6. FRONTEND - Exibir resultados
   ┌─────────────────────────────────────┐
   │ {                                    │
   │   success: true,                     │
   │   isCorrect: true,                   │
   │   score: 100,                        │
   │   feedback: "Excelente! ...",        │
   │   hintsUnlocked: [{                  │
   │     id: "hint_1",                    │
   │     title: "Verificar alibis",       │
   │     content: "Todos os suspeitos..." │
   │   }],                                │
   │   pointsEarned: 50,                  │
   │   totalPoints: 250,                  │
   │   empathyChange: +10                 │
   │ }                                    │
   └─────────────────────────────────────┘
```

---

## 3. Tipos de Puzzles Suportados

### 3.1 Puzzle: Escolha Múltipla

```javascript
{
  id: "exif_metadata",
  type: "multiple_choice",
  question: "Com base nos metadados, quem é o suspeito?",
  options: [
    { id: "A", text: "Tiago" },
    { id: "B", text: "Lucas" },
    { id: "C", text: "Catarina" }
  ],
  correctAnswer: "B",
  feedback: {
    correct: "Correto! Lucas tem acesso técnico...",
    incorrect: "Considera que o agressor tinha acesso técnico..."
  },
  difficulty: 2,
  scene: "puzzle_exif_metadata"
}
```

### 3.2 Puzzle: Resposta Aberta/Validação

```javascript
{
  id: "caesar_cipher",
  type: "text_validation",
  question: "Descriptografe: Emojhsdoh@hfkrrvwrfoxe.iurj",
  correctAnswer: "rodrigo@schoolclub.org",
  validator: "caesar_cipher", // função customizada
  feedback: {
    correct: "Perfeito! Você descobriu o e-mail...",
    incorrect: "Pensa em deslocamentos de 1-25..."
  },
  hints: [
    { attemptThreshold: 1, text: "Tenta deslocamento 3" },
    { attemptThreshold: 3, text: "Resultado termina em @..." }
  ],
  difficulty: 3,
  scene: "puzzle_caesar_cipher"
}
```

### 3.3 Puzzle: Ordenação

```javascript
{
  id: "sequence_events",
  type: "ordering",
  question: "Coloca em ordem cronológica:",
  items: [
    { id: "1", text: "Bia isolada na escola" },
    { id: "2", text: "Criação de perfil falso" },
    { id: "3", text: "Mensagens ofensivas" },
    { id: "4", text: "Mural Digital bloqueado" }
  ],
  correctOrder: ["1", "2", "3", "4"],
  feedback: {
    correct: "Correto! Esta é a sequência temporal...",
    incorrect: "Reconsidera a ordem dos eventos..."
  },
  difficulty: 2,
  scene: "puzzle_sequence"
}
```

### 3.4 Puzzle: Matching/Ligação

```javascript
{
  id: "match_suspects",
  type: "matching",
  question: "Liga cada suspeito ao seu motivo:",
  left: [
    { id: "1", text: "Tiago" },
    { id: "2", text: "Lucas" },
    { id: "3", text: "Catarina" }
  ],
  right: [
    { id: "A", text: "Ciúmes de Bia" },
    { id: "B", text: "Acesso técnico" },
    { id: "C", text: "Bullying de grupo" }
  ],
  correctMatches: { "1": "A", "2": "B", "3": "C" },
  difficulty: 2,
  scene: "puzzle_suspects"
}
```

---

## 4. Sistema de Pistas (Hints)

### 4.1 Arquitetura de Pistas

```
┌─────────────────────────────────────────────────┐
│ HINT SYSTEM - Desbloqueio Progressivo           │
├─────────────────────────────────────────────────┤
│                                                 │
│ Tipos de Condições de Desbloqueio:              │
│                                                 │
│ 1. PROGRESS-BASED                               │
│    Requisito: puzzlesSolved >= 2                │
│    "Após resolver 2 puzzles..."                 │
│                                                 │
│ 2. SCORE-BASED                                  │
│    Requisito: empathyScore >= 70                │
│    "Quando sua empatia atingir 70..."           │
│                                                 │
│ 3. ATTEMPT-BASED                                │
│    Requisito: attemptCount >= 2                 │
│    "Após 2 tentativas falhadas..."              │
│                                                 │
│ 4. TIME-BASED                                   │
│    Requisito: timeSpent >= 300s                 │
│    "Após 5 minutos neste puzzle..."             │
│                                                 │
│ 5. CONTEXT-BASED                                │
│    Requisito: scenarioPhase === "mid"           │
│    "No meio da investigação..."                 │
│                                                 │
│ 6. RELATIONSHIP-BASED                           │
│    Requisito: otherPuzzleSolved === true        │
│    "Depois de resolver o puzzle X..."           │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 4.2 Exemplo: Pista em Camadas

```javascript
{
  id: "hint_caesar_1",
  puzzleId: "caesar_cipher",
  tier: 1, // Primeira pista
  title: "Dica de Deslocamento",
  content: "Uma Cifra de César usa deslocamento fixo. "+
           "Tenta valores entre 1 e 10.",

  unblockConditions: {
    attemptThreshold: 1, // Após 1 tentativa
    timeThreshold: 60,   // Após 60 segundos
    // OU
    puzzlesSolvedThreshold: 1
  }
}
```

---

## 5. Feedback Educativo Contextualizado

```
┌──────────────────────────────────────────────────────────────┐
│ EDUCATIONAL FEEDBACK ENGINE                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Função: generateFeedback(puzzleId, answer, playerContext)   │
│                                                              │
│ Entradas:                                                   │
│  - puzzleId: Qual puzzle foi respondido                    │
│  - answer: A resposta do jogador                           │
│  - playerContext: {                                        │
│      empathyScore: 60,                                     │
│      puzzlesSolved: 2,                                     │
│      scenarioPhase: "mid",                                 │
│      bulliedCharacter: "Bia"                               │
│    }                                                       │
│                                                              │
│ Saídas Adaptadas:                                           │
│                                                              │
│ SE resposta correcta E empathyScore baixa:                 │
│   "Correto! Mas pensa na Bia. Como ela se sentiu           │
│    quando viu esta mensagem?"                              │
│                                                              │
│ SE resposta correcta E empathyScore alto:                  │
│   "Excelente! Você não só resolveu o puzzle, como          │
│    mantém a empatia por Bia em mente."                     │
│                                                              │
│ SE resposta incorrecta (1ª tentativa):                      │
│   "Não exatamente. Dica: considera que..."                 │
│                                                              │
│ SE resposta incorrecta (2ª tentativa):                      │
│   "Ainda não. Pensa assim... [pista mais explícita]"      │
│                                                              │
│ SE resposta incorrecta (3ª+ tentativa):                     │
│   "Tenta esta estratégia... [explica solução parcial]"    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Estrutura de Diretórios - Backend

```
backend/
├── src/
│   ├── controllers/
│   │   ├── GameController.js (existente)
│   │   ├── PuzzleController.js (NOVO)
│   │   ├── HintController.js (NOVO)
│   │   └── NarrativeController.js (NOVO)
│   │
│   ├── models/
│   │   ├── GameSessionModel.js (existente)
│   │   ├── PuzzleModel.js (NOVO)
│   │   ├── HintModel.js (NOVO)
│   │   ├── PuzzleAnswerModel.js (NOVO)
│   │   ├── PlayerHintModel.js (NOVO)
│   │   └── UserModel.js (existente)
│   │
│   ├── utils/
│   │   ├── NarrativeManager.js (existente)
│   │   ├── StateManager.js (existente)
│   │   ├── PuzzleValidator.js (NOVO)
│   │   ├── HintEngine.js (NOVO)
│   │   ├── EducationalFeedback.js (NOVO)
│   │   └── BullyingContext.js (NOVO)
│   │
│   ├── routes/
│   │   ├── gameRoutes.js (existente)
│   │   ├── puzzleRoutes.js (NOVO)
│   │   ├── hintRoutes.js (NOVO)
│   │   └── narrativeRoutes.js (NOVO)
│   │
│   └── index.js
│
├── tests/
│   ├── puzzle.test.js (NOVO)
│   ├── hint.test.js (NOVO)
│   ├── validator.test.js (NOVO)
│   └── integration.test.js (NOVO)
│
├── narratives/
│   ├── scenario_1_echo_codigo.twine
│   └── scenario_2_clout_crueldade.twine
│
└── docs/
    ├── ARCHITECTURE.md (este ficheiro)
    ├── PUZZLE_SYSTEM.md
    ├── HINT_SYSTEM.md
    └── DATABASE_SCHEMA.md
```

---

## 7. Fluxo Completo: Sessão do Jogador

```
┌─────────────────────────────────────────────────────────────────────────┐
│ SESSÃO COMPLETA DO JOGADOR                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ 1. AUTENTICAÇÃO & INICIALIZAÇÃO                                        │
│    POST /api/auth/login                                                │
│    → JWT token guardado no localStorage                                │
│    → Frontend pronto                                                   │
│                                                                         │
│ 2. INICIAR JOGO                                                         │
│    POST /api/game/start                                                │
│    {                                                                   │
│      userId: "user-123",                                               │
│      scenario: "scenario_1"                                            │
│    }                                                                   │
│    → game_sessions created                                             │
│    → gameState initialized                                             │
│    → NarrativeManager loads scenario_1                                 │
│    Response: { sessionId, initialScene, state }                        │
│                                                                         │
│ 3. RENDERIZAR CENA INICIAL                                              │
│    GET /api/narratives/scenario_1/inicio                               │
│    ← { text, links, state, availableHints }                            │
│    Frontend renderiza NarrativeRenderer                                │
│                                                                         │
│ 4. JOGADOR ESCOLHE CAMINHO → PUZZLE                                     │
│    POST /api/game/decisions                                            │
│    {                                                                   │
│      sessionId,                                                        │
│      choiceId: "merger_analysis_technical"                             │
│    }                                                                   │
│    ← Frontend navega para puzzle_exif_metadata                          │
│                                                                         │
│ 5. APRESENTAR PUZZLE                                                    │
│    GET /api/puzzles/exif_metadata                                      │
│    ← { question, options, difficulty, availableHints }                 │
│    Frontend exibe PuzzleInterface                                       │
│                                                                         │
│ 6. JOGADOR SUBMETE RESPOSTA                                             │
│    POST /api/puzzles/solve                                             │
│    { sessionId, puzzleId, answer, timeSpent, attemptCount }            │
│    → Backend executa PuzzleValidator.validate()                        │
│    → Backend executa HintEngine.unlock()                               │
│    ← { isCorrect, feedback, hintsUnlocked, pointsEarned }              │
│    Frontend exibe FeedbackDisplay                                      │
│                                                                         │
│ 7. PISTAS DESBLOQUEADAS                                                 │
│    GET /api/hints/available                                            │
│    ← Lista de pistas agora desbloqueadas                               │
│    Frontend renderiza HintSystem                                       │
│                                                                         │
│ 8. PROGRESSO PERSISTIDO                                                 │
│    Database atualizada:                                                │
│    - puzzle_answers (resposta guardada)                                │
│    - player_hints (pistas desbloqueadas)                               │
│    - game_sessions (estado atualizado)                                 │
│    - gamification_profiles (pontos aumentados)                         │
│    - points_transactions (transação registrada)                        │
│                                                                         │
│ 9. CONTINUAR PARA PRÓXIMA CENA                                          │
│    POST /api/game/nextScene                                            │
│    → Repete ciclo a partir do passo 3                                  │
│                                                                         │
│ 10. FINAL DO JOGO                                                       │
│     POST /api/game/end                                                 │
│     → Calcula métricas finais                                          │
│     → Gera relatório educativo                                         │
│     → Premia badges/achievements                                       │
│     ← { finalScore, learningOutcomes, badges }                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Integração com Narrativas Twine

### 8.1 Estrutura de Passagem com Puzzle

```json
{
  "pid": "3",
  "name": "puzzle_exif_metadata",
  "text": "# Puzzle 1: O Detetive de Metadados\n\n...[enunciado do puzzle]...",
  "tags": "puzzle, investigation",

  "puzzle": {
    "id": "exif_metadata",
    "type": "multiple_choice",
    "embedded": true,
    "scenarioId": "scenario_1",
    "educationalContext": "cyberbullying_investigation"
  },

  "links": [
    {
      "linkText": "Responder com análise",
      "target": "puzzle_exif_result",
      "empathyScore": 75,
      "conditional": "puzzle_exif_metadata.solved"
    }
  ]
}
```

### 8.2 NarrativeManager Integration

```javascript
const narrative = narrativeManager.getNarrative("scenario_1");
const scene = narrativeManager.getScene("scenario_1", "puzzle_exif_metadata");

// scene.puzzle contém ID do puzzle para carregar
if (scene.puzzle) {
  const puzzle = await PuzzleModel.getById(scene.puzzle.id);
  // Passar para frontend
}
```

---

## 9. Fluxo de Dados: Dados Persistidos

```
┌──────────────────────────────────────────────────────────────┐
│ DADOS PERSISTIDOS EM CADA CHECKPOINT                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ game_sessions:                                              │
│  {                                                          │
│    id: "session-123",                                       │
│    user_id: "user-456",                                     │
│    scenario: "scenario_1",                                  │
│    state: {                                                 │
│      currentScene: "puzzle_exif_metadata",                  │
│      puzzlesSolved: 1,                                      │
│      hintsUnlocked: ["hint_1", "hint_2"],                   │
│      empathyScore: 65,                                      │
│      cloutScore: 40,                                        │
│      pointsEarned: 150                                      │
│    },                                                       │
│    last_updated: "2024-05-01T14:32:00Z"                     │
│  }                                                          │
│                                                              │
│ puzzle_answers:                                             │
│  {                                                          │
│    id: "answer-789",                                        │
│    session_id: "session-123",                               │
│    puzzle_id: "exif_metadata",                              │
│    player_answer: "B",                                      │
│    is_correct: true,                                        │
│    score: 100,                                              │
│    attempt_number: 1,                                       │
│    time_spent: 47,     // segundos                          │
│    feedback: "Correto! Lucas tem acesso técnico...",        │
│    answered_at: "2024-05-01T14:32:00Z"                      │
│  }                                                          │
│                                                              │
│ player_hints:                                               │
│  {                                                          │
│    id: "ph-111",                                            │
│    player_id: "user-456",                                   │
│    hint_id: "hint_1",                                       │
│    puzzle_id: "exif_metadata",                              │
│    unlocked_at: "2024-05-01T14:32:00Z",                     │
│    unlocked_by: "puzzle_solved",  // Razão                  │
│    was_viewed: true                                         │
│  }                                                          │
│                                                              │
│ points_transactions:                                        │
│  {                                                          │
│    id: "pt-222",                                            │
│    user_id: "user-456",                                     │
│    points: 50,                                              │
│    reason: "puzzle_solved:exif_metadata:perfect",          │
│    transaction_date: "2024-05-01T14:32:00Z"                 │
│  }                                                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. Mecanismos de Segurança e Validação

### 10.1 Validação de Entrada

```javascript
// Validação em 3 camadas
1. FRONTEND - Validação básica (UX)
   - Verificar que resposta não é vazia
   - Verificar limite de caracteres

2. ROUTE MIDDLEWARE - Validação estrutural
   - Verificar JWT token
   - Verificar sessionId pertence ao user
   - Verificar puzzleId é válido

3. CONTROLLER - Validação de lógica
   - Verificar puzzle existe na DB
   - Verificar player ainda não resolveu (se regra aplicável)
   - Verificar resposta é formato esperado
```

### 10.2 Prevenção de Fraude

```javascript
{
  // 1. Verificação de Tempo
  timeSpent: 2,  // Responder em 2 segundos = suspeito
  // → Sinalizar se tempo < minThreshold

  // 2. Verificação de Tentativas
  attemptCount: 100,  // 100 tentativas = suspeito
  // → Bloquear depois de N tentativas

  // 3. Verificação de Padrão
  lastAnswersCorrect: 100,  // Todas corretas = suspeito?
  // → Incrementar dificuldade progressivamente

  // 4. Rate Limiting
  // → Máximo 1 resposta a cada 3 segundos
}
```

---

## 11. Extensibilidade: Adicionar Novo Puzzle

```
PASSOS PARA ADICIONAR UM NOVO PUZZLE:

1. Criar entrada em puzzles table (SQL script)
   INSERT INTO puzzles (id, scenario_id, type, ...)

2. Adicionar validador em PuzzleValidator.js
   case 'novo_tipo':
     return this.validateNovoTipo(answer, correctAnswer);

3. (Opcional) Criar pistas em hints table
   INSERT INTO hints (id, puzzle_id, ...)

4. Adicionar passagem ao ficheiro Twine
   {
     "name": "puzzle_novo",
     "puzzle": { "id": "novo_puzzle_id" }
   }

5. Testar com teste unitário
   describe('Novo Puzzle', () => {
     test('should validate correct answer', () => {
```

---

## 12. Stack Técnica Recomendada

| Camada        | Tecnologia | Versão | Propósito         |
| ------------- | ---------- | ------ | ----------------- |
| Backend       | Node.js    | 18+    | Runtime           |
| Web Framework | Express    | 4.18+  | HTTP Server       |
| Database      | PostgreSQL | 13+    | Persistência      |
| Frontend      | React      | 18+    | UI                |
| HTTP Client   | Axios      | 1.x    | API Calls         |
| Testing       | Jest       | 29+    | Unit Tests        |
| Logging       | Winston    | 3.x    | Logs              |
| Auth          | JWT        | 9.x    | Autenticação      |
| Validation    | Joi        | 17+    | Schema Validation |

---

## 13. Roadmap de Implementação

```
FASE 1 (Este documento) - Arquitetura & Base
✓ Arquitetura completa
✓ Estrutura de dados
✓ Fluxo de dados

FASE 2 - Implementação Backend
[ ] Modelos (Puzzle, Hint, PuzzleAnswer, PlayerHint)
[ ] Controllers (PuzzleController, HintController)
[ ] Validador de Puzzles
[ ] Engine de Pistas
[ ] Engine de Feedback Educativo
[ ] Routes (puzzleRoutes, hintRoutes)
[ ] Migrations de Base de Dados

FASE 3 - Testes & Validação
[ ] Testes unitários (models, validador, engine)
[ ] Testes de integração (API endpoints)
[ ] Testes de carga

FASE 4 - Frontend
[ ] Componente PuzzleInterface
[ ] Componente HintSystem
[ ] Integração com GamePage
[ ] Estados de loading/error

FASE 5 - Documentação & Exemplos
[ ] Guia de uso para educators
[ ] Exemplos de extensão
[ ] Troubleshooting guide

FASE 6 - Produção
[ ] Deployment script
[ ] Monitoring setup
[ ] Backup strategy
```

---

**Próximo Passo**: Implementar os modelos e controllers (FASE 2)
