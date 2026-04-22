/**
 * ChatInterface Component
 * Simula interface de chat tipo Discord/WhatsApp
 * Usado no Scenario 2: Perspetiva do agressor com simulação em tempo real
 */

import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/index.js';
import './ChatInterface.css';

export default function ChatInterface({ 
  onChoiceSelected, 
  gameState,
  currentPressure = 0 
}) {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingIndicator, setTypingIndicator] = useState(null);
  const [isChoiceActive, setIsChoiceActive] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const messagesEndRef = useRef(null);
  const messageTimersRef = useRef([]);

  // Auto-scroll para mensagens novas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simular chegada de mensagens em tempo real
  useEffect(() => {
    if (!gameState || !gameState.messageQueue) return;

    gameState.messageQueue.forEach((message) => {
      if (!message.displayed && message.timestamp <= Date.now()) {
        // Limpar timers anteriores do mesmo timer
        if (messageTimersRef.current[message.id]) {
          clearTimeout(messageTimersRef.current[message.id]);
        }

        const delay = message.timestamp - Date.now();
        
        if (delay <= 0) {
          // Mensagem deve aparecer agora
          displayMessage(message);
        } else {
          // Agendar para aparecer no futuro
          const timerId = setTimeout(() => {
            displayMessage(message);
          }, delay);
          messageTimersRef.current[message.id] = timerId;
        }
      }
    });

    // Cleanup
    return () => {
      Object.values(messageTimersRef.current).forEach(timerId => {
        if (timerId) clearTimeout(timerId);
      });
    };
  }, [gameState]);

  const displayMessage = (message) => {
    // Mostrar indicador de digitação brevemente
    setTypingIndicator(message.sender);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        ...message,
        displayTime: new Date().toLocaleTimeString('pt-PT', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }]);
      setUnreadCount(prev => prev + 1);
      setTypingIndicator(null);
    }, 800);
  };

  const handleChoiceClick = (choice) => {
    // User responde à pergunta
    const userMessage = {
      id: `user_${Date.now()}`,
      sender: 'Você',
      content: choice.text,
      isUser: true,
      displayTime: new Date().toLocaleTimeString('pt-PT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };

    setMessages(prev => [...prev, userMessage]);
    setSelectedChoice(choice);
    setIsChoiceActive(false);
    setUnreadCount(0);

    // Callback para GameController processar a escolha
    onChoiceSelected(choice);
  };

  const handleReaction = (emoji, messageId) => {
    // Adicionar reação a uma mensagem
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            reactions: [...(msg.reactions || []), emoji]
          };
        }
        return msg;
      })
    );
  };

  // Indicador de pressão visual
  const getPressureLevel = () => {
    if (currentPressure >= 75) return 'high';
    if (currentPressure >= 50) return 'medium';
    return 'low';
  };

  return (
    <div className="chat-interface">
      {/* Header do Chat */}
      <div className="chat-header">
        <div className="chat-header-info">
          <h3># grupo-gaming</h3>
          <span className="members-count">7 membros online</span>
        </div>
        <div className="chat-header-actions">
          <button className="icon-button" title="Silenciar grupo">🔔</button>
          <button className="icon-button" title="Informações">ℹ️</button>
        </div>
      </div>

      {/* Aviso de Pressão (se ativo) */}
      {currentPressure > 0 && (
        <div className={`pressure-warning pressure-${getPressureLevel()}`}>
          <span className="pressure-icon">⚡</span>
          <span className="pressure-text">
            Pressão do Grupo: {currentPressure}%
          </span>
        </div>
      )}

      {/* Área de Mensagens */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <p>Sem mensagens anteriores</p>
            <small>As mensagens começarão a chegar...</small>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`chat-message ${msg.isUser ? 'user-message' : 'other-message'}`}
            >
              {/* Avatar + Nome do Sender */}
              {!msg.isUser && (
                <div className="message-avatar">
                  {msg.sender.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Conteúdo da Mensagem */}
              <div className="message-bubble">
                {!msg.isUser && (
                  <div className="message-sender">{msg.sender}</div>
                )}
                <div className="message-content">
                  {msg.content}
                </div>
                
                {/* Reações */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="message-reactions">
                    {msg.reactions.map((emoji, i) => (
                      <span key={i} className="reaction">{emoji}</span>
                    ))}
                  </div>
                )}

                <span className="message-time">{msg.displayTime}</span>
              </div>

              {/* Botões de Reação */}
              {!msg.isUser && (
                <div className="message-reactions-bar">
                  <button
                    className="reaction-button"
                    onClick={() => handleReaction('😂', msg.id)}
                    title="Risada"
                  >
                    😂
                  </button>
                  <button
                    className="reaction-button"
                    onClick={() => handleReaction('💀', msg.id)}
                    title="Morrer de riso"
                  >
                    💀
                  </button>
                  <button
                    className="reaction-button"
                    onClick={() => handleReaction('🔥', msg.id)}
                    title="Fogo"
                  >
                    🔥
                  </button>
                  <button
                    className="reaction-button"
                    onClick={() => handleReaction('👁️', msg.id)}
                    title="Ver"
                  >
                    👁️
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        {/* Indicador de Digitação */}
        {typingIndicator && (
          <div className="chat-message other-message typing-indicator">
            <div className="message-avatar">
              {typingIndicator.charAt(0).toUpperCase()}
            </div>
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Escolhas/Respostas Disponíveis */}
      {isChoiceActive && (
        <div className="chat-choices">
          <div className="choices-prompt">Como você reage?</div>
          <div className="choices-buttons">
            {selectedChoice?.options?.map((option, idx) => (
              <button
                key={idx}
                className="choice-button choice-chat"
                onClick={() => handleChoiceClick(option)}
              >
                {option.emoji && <span className="choice-emoji">{option.emoji}</span>}
                <span className="choice-text">{option.text}</span>
                {option.consequence && (
                  <small className="choice-consequence">{option.consequence}</small>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input de Mensagem (Desabilitado - apenas respostas de choice) */}
      <div className="chat-input-area">
        <div className="chat-input-placeholder">
          Aguardando mensagens do grupo...
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} novas</span>
          )}
        </div>
      </div>

      {/* Status de Bia (Scenario 2 específico) */}
      {gameState?.biaStatus && (
        <div className={`bia-status-indicator status-${gameState.biaStatus}`}>
          <span className="status-label">Bia está</span>
          <span className="status-value">
            {gameState.biaStatus === 'normal' && '🟢 online'}
            {gameState.biaStatus === 'offline' && '⚫ offline'}
            {gameState.biaStatus === 'desperate' && '🔴 desesperada'}
            {gameState.biaStatus === 'intervention' && '🆘 em crise'}
          </span>
        </div>
      )}
    </div>
  );
}
