/**
 * RegisterPage Component
 * Página de registro de novo utilizador
 */
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore, useUIStore } from "../store/index.js";
import { API } from "../services/api.js";
import "./AuthPages.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const { setLoading, showNotification } = useUIStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "student",
    grade: "8º",
    school: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate password strength
  const getPasswordStrength = () => {
    const pass = formData.password;
    if (!pass) return { level: "none", label: "", color: "transparent" };

    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;

    if (strength <= 2)
      return { level: "weak", label: "Fraca", color: "var(--empathy-low)" };
    if (strength <= 3)
      return {
        level: "medium",
        label: "Média",
        color: "var(--empathy-medium)",
      };
    return { level: "strong", label: "Forte", color: "var(--empathy-high)" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validação
    if (formData.password !== formData.passwordConfirm) {
      setError("As passwords não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const { passwordConfirm, ...registerData } = formData;
      const response = await API.auth.register(registerData);
      const { user, token } = response.data;

      setToken(token);
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      showNotification(`Bem-vindo, ${user.name}!`, "success");
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.error || "Erro ao registar";
      setError(message);
      showNotification(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🎮 Escape Room Digital</h1>
          <p>Registar Nova Conta</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Seu Nome"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.pt"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            {formData.password && (
              <div className="password-strength-container">
                <div className="password-strength-bar">
                  <div
                    className={`strength-fill strength-${getPasswordStrength().level}`}
                    style={{
                      width: `${getPasswordStrength().level === "none" ? 0 : getPasswordStrength().level === "weak" ? 33 : getPasswordStrength().level === "medium" ? 66 : 100}%`,
                      backgroundColor: getPasswordStrength().color,
                    }}
                  ></div>
                </div>
                <span
                  className="password-strength-text"
                  style={{ color: getPasswordStrength().color }}
                >
                  Força: {getPasswordStrength().label}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Password</label>
            <input
              type="password"
              name="passwordConfirm"
              className="form-input"
              value={formData.passwordConfirm}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tipo de Utilizador</label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="student">Aluno</option>
              <option value="teacher">Professor</option>
            </select>
          </div>

          {formData.role === "student" && (
            <div className="form-group">
              <label className="form-label">Turma</label>
              <select
                name="grade"
                className="form-select"
                value={formData.grade}
                onChange={handleChange}
              >
                <option value="7º">7º Ano</option>
                <option value="8º">8º Ano</option>
                <option value="9º">9º Ano</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Escola</label>
            <input
              type="text"
              name="school"
              className="form-input"
              value={formData.school}
              onChange={handleChange}
              placeholder="Nome da Escola"
              required
            />
          </div>

          <button
            type="submit"
            className="button button-primary"
            style={{ width: "100%" }}
          >
            Registar
          </button>
        </form>

        <div className="auth-footer">
          <p>Já tem conta?</p>
          <Link to="/login" className="auth-link">
            Iniciar sessão
          </Link>
        </div>
      </div>
    </div>
  );
}
