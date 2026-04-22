/**
 * Notification Component
 * Exibe notificações/toasts ao utilizador
 */
import React from 'react';
import { useUIStore } from '../store/index.js';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import './Notification.css';

export default function Notification() {
  const { notification, closeNotification } = useUIStore();

  if (!notification) return null;

  const icons = {
    success: <FiCheckCircle size={24} />,
    error: <FiAlertCircle size={24} />,
    info: <FiInfo size={24} />,
  };

  return (
    <div className={`notification notification-${notification.type}`}>
      <div className="notification-content">
        {icons[notification.type] || icons.info}
        <p className="notification-message">{notification.message}</p>
      </div>
      <button className="notification-close" onClick={closeNotification}>
        <FiX size={20} />
      </button>
    </div>
  );
}
