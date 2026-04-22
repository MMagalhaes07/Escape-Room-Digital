/**
 * App.jsx
 * Componente raiz da aplicação
 * Gerencia routing e estado global
 */
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/index.js';

// Páginas
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import GamePage from './pages/GamePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

// Componentes
import Navbar from './components/Navbar.jsx';
import Notification from './components/Notification.jsx';

// Estilos
import './styles/global.css';

/**
 * Componente de rota protegida
 * Redireciona para login se não autenticado
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  const { token, setToken, user, setUser } = useAuthStore();

  // Verificar token ao carregar
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [setToken, setUser]);

  return (
    <Router>
      <div className="app">
        {token && <Navbar />}
        <Notification />

        <main className="main-content">
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Rotas Protegidas - Alunos */}
            <Route
              path="/game/:scenario"
              element={
                <ProtectedRoute>
                  <GamePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Rotas Protegidas - Professores */}
            <Route
              path="/teacher-dashboard"
              element={
                <ProtectedRoute>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />

            {/* Rota Padrão */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
