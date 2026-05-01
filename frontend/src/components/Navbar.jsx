/**
 * Navbar Component
 * Barra de navegação com menu e informações do utilizador
 */
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/index.js";
import { FiLogOut, FiUser, FiHome } from "react-icons/fi";
import { PiGameController } from "react-icons/pi";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isTeacher = user?.role === "teacher";

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <PiGameController size={24} />
          <span>Escape Room</span>
        </Link>

        {/* Menu */}
        <ul className="navbar-menu">
          <li>
            <Link to="/dashboard" className="nav-link">
              <FiHome size={20} />
              Dashboard
            </Link>
          </li>

          {!isTeacher && (
            <li className="dropdown">
              <button className="nav-link dropdown-trigger">
                <PiGameController size={20} />
                Cenários
              </button>
              <ul className="dropdown-menu">
                <li>
                  <Link to="/game/scenario_1">Cenário 1: Testemunha</Link>
                </li>
                <li>
                  <Link to="/game/scenario_2">Cenário 2: Agressor</Link>
                </li>
              </ul>
            </li>
          )}

          {isTeacher && (
            <li>
              <Link to="/teacher-dashboard" className="nav-link">
                📊 Monitorização
              </Link>
            </li>
          )}

          {/* Perfil Link */}
          <li>
            <Link to="/profile" className="nav-link">
              <FiUser size={20} />
              Perfil
            </Link>
          </li>

          {/* Perfil do Utilizador */}
          <li className="navbar-user">
            <span className="user-badge">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
            <div className="user-info">
              <p className="user-name">{user?.name}</p>
              <p className="user-role">{isTeacher ? "Professor" : "Aluno"}</p>
            </div>
          </li>

          {/* Botão de Logout */}
          <li>
            <button className="nav-link logout-btn" onClick={handleLogout}>
              <FiLogOut size={20} />
              Sair
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
