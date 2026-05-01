/**
 * ChoiceButtons Component
 * Botões de decisão para a cena atual
 */
import React from 'react';
import './GameComponents.css';

export default function ChoiceButtons({ choices = [], disabled = false, onSelect }) {
  if (!choices || choices.length === 0) return null;

  return (
    <div className="choice-buttons">
      <p className="choices-label">O que faz?</p>
      <div className="choices-list">
        {choices.map((choice, idx) => (
          <button
            key={`${choice.text}-${idx}`}
            className="choice-button"
            onClick={() => onSelect?.(choice, idx)}
            disabled={disabled}
            title={
              typeof choice.empathyScore === 'number'
                ? `Consequência: Empatia ${choice.empathyScore > 0 ? '+' : ''}${choice.empathyScore}`
                : undefined
            }
          >
            <span className="choice-text">{choice.text}</span>
            {typeof choice.empathyScore === 'number' && (
              <span className="choice-consequence">
                Empatia: {choice.empathyScore > 0 ? '+' : ''}
                {choice.empathyScore}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

