/**
 * Inventory.jsx
 *
 * Painel com pistas/evidências recolhidas
 * Ícones por tipo de pista; detalhes ao clicar
 *
 * Props:
 * - items: [{ id, name, description, type, timestamp }]
 * - onItemClick: (itemId) => void
 */

import React, { useState } from "react";
import PropTypes from "prop-types";

const Inventory = ({ items = [], onItemClick = () => {} }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!items || items.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-700 text-sm">
          🎒 Inventário vazio - Recolha pistas durante o jogo
        </p>
      </div>
    );
  }

  /**
   * Obter ícone baseado no tipo de pista
   */
  const getTypeIcon = (type) => {
    const icons = {
      message: "💬",
      photo: "📸",
      evidence: "🔍",
      clue: "🧩",
      document: "📄",
      audio: "🎵",
      default: "📌",
    };
    return icons[type?.toLowerCase()] || icons.default;
  };

  /**
   * Formatar data
   */
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("pt-PT", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-between"
      >
        <span>🎒 Inventário ({items.length})</span>
        <span
          className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {/* Conteúdo expansível */}
      {isExpanded && (
        <div className="p-4">
          {/* Grid de itens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  onItemClick(item.id);
                }}
                className={`
                  p-3 rounded-lg border-2 transition-all text-left
                  ${
                    selectedItem?.id === item.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-gray-50 hover:border-blue-300"
                  }
                `}
              >
                <div className="flex items-start gap-2">
                  <span className="text-2xl flex-shrink-0">
                    {getTypeIcon(item.type)}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">
                      {item.name}
                    </p>
                    {item.timestamp && (
                      <p className="text-xs text-gray-500">
                        {formatDate(item.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Painel de detalhes */}
          {selectedItem && (
            <div className="mt-4 pt-4 border-t-2 border-gray-200 bg-gray-50 rounded-lg p-4">
              <div className="mb-3">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">
                    {getTypeIcon(selectedItem.type)}
                  </span>
                  {selectedItem.name}
                </h3>
                {selectedItem.type && (
                  <p className="text-xs text-gray-600 mt-1">
                    Tipo:{" "}
                    <span className="font-semibold">{selectedItem.type}</span>
                  </p>
                )}
                {selectedItem.timestamp && (
                  <p className="text-xs text-gray-600">
                    Recolhido em: {formatDate(selectedItem.timestamp)}
                  </p>
                )}
              </div>

              <p className="text-gray-700 text-sm leading-relaxed">
                {selectedItem.description || "Sem descrição adicional"}
              </p>

              {/* Contexto/sugestão */}
              {selectedItem.context && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    💡 Sugestão:
                  </p>
                  <p className="text-xs text-gray-700">
                    {selectedItem.context}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

Inventory.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      type: PropTypes.string,
      timestamp: PropTypes.string,
      context: PropTypes.string,
    }),
  ),
  onItemClick: PropTypes.func,
};

export default Inventory;
