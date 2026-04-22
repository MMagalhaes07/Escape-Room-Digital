/**
 * LoginPage Component
 * Página de login
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, useUIStore } from '../store/index.js';
import { API } from '../services/api.js';
import './AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const { setLoading, showNotification } = useUIStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.auth.login({ email, password });
      const { user, token } = response.data;

      setToken(token);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));

      showNotification(`Bem-vindo, ${user.name}!`, 'success');

      // Redirecionar baseado no role
      if (user.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Erro ao fazer login';
      setError(message);
      showNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🎮 Escape Room Digital</h1>
          <p>Prevenção de Bullying e Cyberbullying</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Iniciar Sessão</h2>

          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.pt"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="button button-primary" style={{ width: '100%' }}>
            Entrar
          </button>
        </form>

        <div className="auth-footer">
          <p>Não tem conta?</p>
          <Link to="/register" className="auth-link">
            Registar aqui
          </Link>
        </div>

        {/* Credenciais de Teste */}
        <div className="test-credentials">
          <h4>📝 Credenciais de Teste</h4>
          <p>
            <strong>Professor:</strong> professor.silva@escola.pt / teacher123
          </p>
          <p>
            <strong>Aluno:</strong> joao.santos@email.pt / student123
          </p>
        </div>
      </div>
    </div>
  );
}
