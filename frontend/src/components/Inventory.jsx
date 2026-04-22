/**
 * Inventory Component
 * Exibe pistas e itens recolhidos durante o jogo
 */
import React from 'react';
import { useGameStore } from '../store/index.js';
import { FiInbox } from 'react-icons/fi';
import './GameComponents.css';

export default function Inventory() {
  const { gameState } = useGameStore();

  const clues = gameState?.inventory || [];

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <FiInbox size={20} />
        <h3>Pistas & Itens ({clues.length})</h3>
      </div>

      <div className="inventory-items">
        {clues.length === 0 ? (
          <p className="inventory-empty">Nenhuma pista recolhida ainda</p>
        ) : (
          clues.map((clue, idx) => (
            <div key={idx} className="inventory-item">
              <div className="item-icon">📌</div>
              <div className="item-details">
                <h4>{clue.name}</h4>
                <p className="item-description">{clue.description}</p>
                {clue.discoveredAt && (
                  <span className="item-time">Recolhido em: Cena {clue.discoveredAt}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats do inventário */}
      <div className="inventory-stats">
        <div className="stat">
          <span>Pistas Encontradas:</span>
          <strong>{clues.filter(c => c.type === 'clue').length}</strong>
        </div>
        <div className="stat">
          <span>Itens:</span>
          <strong>{clues.filter(c => c.type === 'item').length}</strong>
        </div>
      </div>
    </div>
  );
}
