# 🎮 Escape Room Digital - Frontend

**Interface React para Serious Game de Prevenção de Bullying**

## 📋 Visão Geral

Frontend React que implementa:

- **Autenticação**: Login e Registro de utilizadores
- **Dashboard de Alunos**: Visualização de cenários e progresso
- **Interface de Jogo**: Renderização de narrativas interativas
- **Gamificação**: Leaderboards, badges, pontos
- **Dashboard de Professor**: Monitorização pedagógica

## 🏗️ Arquitetura

```
Frontend (React)
├── Pages (componentes de rota)
├── Components (componentes reutilizáveis)
├── Store (Zustand - gerenciamento de estado)
├── Services (API client)
└── Styles (CSS moderno e responsivo)
```

## 🚀 Instalação

### 1. Pré-requisitos

- Node.js 16+
- npm

### 2. Instalar Dependências

```bash
npm install
```

### 3. Variáveis de Ambiente

Criar arquivo `.env.local`:

```
VITE_API_URL=http://localhost:5000/api
```

### 4. Executar em Desenvolvimento

```bash
npm run dev
```

Acesso em `http://localhost:3000`

## 📱 Componentes Principais

### Páginas (Pages)

- **LoginPage**: Autenticação de utilizadores
- **RegisterPage**: Registo de novos utilizadores
- **DashboardPage**: Dashboard do aluno com cenários
- **GamePage**: Interface do jogo (em desenvolvimento)
- **ProfilePage**: Perfil do utilizador
- **TeacherDashboard**: Monitorização pedagógica

### Componentes Reutilizáveis

- **Navbar**: Barra de navegação
- **Notification**: Sistema de notificações
- Componentes de jogo (em desenvolvimento):
  - SceneRenderer
  - ChoiceButtons
  - Inventory
  - PuzzleInterface

### State Management (Zustand)

```javascript
// Armazenam estado global:
useAuthStore; // Autenticação e perfil do utilizador
useGameStore; // Estado atual do jogo
usePlayerStore; // Dados do jogador (gamificação, estatísticas)
useUIStore; // Estado da UI (loading, notificações, modals)
```

## 🎨 Design System

### Cores

- **Primária**: `#6366f1` (Indigo)
- **Empatia Alta**: `#10b981` (Verde)
- **Empatia Média**: `#f59e0b` (Amarelo)
- **Empatia Baixa**: `#ef4444` (Vermelho)

### Componentes CSS

Componentes CSS globais disponíveis:

- `.button` - Botões
- `.card` - Cards/Cartões
- `.badge` - Badges
- `.form-*` - Elementos de forma
- `.grid` - Layouts em grid

## 📡 Integração API

Cliente Axios configurado em `src/services/api.js`:

```javascript
// Exemplo de uso:
const { data } = await API.game.startSession(userId, scenario);
const leaderboard = await API.gamification.getLeaderboard();
```

## 🎮 Fluxo de Jogo (Em Desenvolvimento)

1. Aluno seleciona cenário no Dashboard
2. Sistema cria nova GameSession no backend
3. React renderiza SceneRenderer com a narrativa
4. Aluno toma decisões (ChoiceButtons)
5. Sistema registra decisões e atualiza estado
6. Ao fim, relatório pedagógico personalizado

## 🏗️ Estrutura de Pastas

```
frontend/
├── src/
│   ├── pages/          # Componentes de rota
│   ├── components/     # Componentes reutilizáveis
│   ├── store/          # Zustand stores
│   ├── services/       # API client
│   ├── styles/         # CSS global
│   ├── App.jsx         # Componente raiz
│   └── main.jsx        # Ponto de entrada
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 🛠️ Desenvolvimento

### Adicionar Nova Página

1. Criar arquivo em `src/pages/MyPage.jsx`
2. Adicionar rota em `src/App.jsx`
3. Criar estilos em `src/pages/MyPage.css`

### Usar Zustand Store

```javascript
import { useAuthStore } from "./store/index.js";

const { user, setUser } = useAuthStore();
```

## 📦 Build para Produção

```bash
npm run build
```

Gera pasta `dist/` pronta para deploy.

## 🔍 Testing

```bash
npm run test
```

(Configurar Jest/Vitest conforme necessário)

## 📱 Responsividade

Layout totalmente responsivo para:

- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🔐 Segurança

- JWT tokens armazenados em localStorage
- CORS configurado no backend
- Input validation em formulários
- XSS protection com React

## 📈 Performance

- Lazy loading de componentes
- Otimização de renderização
- Minificação automática (Vite)
- Cache de dados locais

## 🤝 Contribuição

Melhorias e sugestões são bem-vindas!

## 📄 Licença

MIT License
