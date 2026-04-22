/**
 * ProfilePage Component
 * Página de perfil do utilizador
 */
import React, { useEffect, useState } from 'react';
import { useAuthStore, usePlayerStore } from '../store/index.js';
import { API } from '../services/api.js';
import './Profile.css';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const { profile, setProfile } = usePlayerStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await API.auth.updateProfile(user.id, formData);
      setUser(response.data.user);
      setProfile(response.data.user);
      setEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h1>{user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-role">
              {user?.role === 'teacher' ? '👨‍🏫 Professor' : '👨‍🎓 Aluno'}
            </p>
          </div>
          <button
            className="button button-secondary"
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancelar' : 'Editar Perfil'}
          </button>
        </div>

        {editing && (
          <div className="profile-edit">
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {formData.grade && (
              <div className="form-group">
                <label>Turma</label>
                <select
                  name="grade"
                  value={formData.grade || ''}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="7º">7º Ano</option>
                  <option value="8º">8º Ano</option>
                  <option value="9º">9º Ano</option>
                </select>
              </div>
            )}

            <button
              className="button button-primary"
              onClick={handleSave}
              style={{ width: '100%' }}
            >
              Guardar Alterações
            </button>
          </div>
        )}

        <div className="profile-details">
          <h3>Informações da Conta</h3>
          <div className="detail-row">
            <span>Email:</span>
            <strong>{user?.email}</strong>
          </div>
          {user?.grade && (
            <div className="detail-row">
              <span>Turma:</span>
              <strong>{user.grade}</strong>
            </div>
          )}
          {user?.school && (
            <div className="detail-row">
              <span>Escola:</span>
              <strong>{user.school}</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
