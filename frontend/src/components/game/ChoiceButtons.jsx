/**
 * ChoiceButtons.jsx
 *
 * Botões de escolha com suporte a escolhas condicionais
 * Indica escolhas já visitadas
 * Animação hover/active
 *
 * Props:
 * - choices: [{ text, nextScene, empathyScore, risk }]
 * - onSelect: (choiceIndex) => void
 * - disabled: boolean
 * - gameState: { choices_made: [...] }
 */

import React from "react";
import PropTypes from "prop-types";

const ChoiceButtons = ({
  choices = [],
  onSelect,
  disabled = false,
  gameState = {},
}) => {
  if (!choices || choices.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-800 font-semibold">
          Fim da narrativa - Clique para regressar ou ver resultados
        </p>
      </div>
    );
  }

  // Obter IDs de escolhas já feitas para desabilitar duplicatas
  const choicesMade = gameState.choices_made || [];

  /**
   * Determinar classe de estilo baseado na empatia
   * Escolhas com empatia alta (>60) = verde
   * Escolhas neutras (40-60) = amarelo
   * Escolhas com pouca empatia (<40) = vermelho
   */
  const getEmpathyClass = (empathyScore) => {
    const score = empathyScore || 50;
    if (score >= 65)
      return "border-green-400 bg-green-50 hover:bg-green-100 text-green-900";
    if (score <= 35)
      return "border-red-400 bg-red-50 hover:bg-red-100 text-red-900";
    return "border-yellow-400 bg-yellow-50 hover:bg-yellow-100 text-yellow-900";
  };

  /**
   * Obter ícone baseado no risco
   */
  const getRiskIcon = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return "⚠️";
      case "medium":
        return "⚡";
      case "low":
        return "✓";
      default:
        return "→";
    }
  };

  return (
    <div className="sticky bottom-0 bg-gradient-to-t from-slate-900 via-slate-800 to-transparent p-6 pt-12">
      <div className="max-w-4xl mx-auto">
        <p className="text-gray-300 text-sm font-semibold mb-4 uppercase tracking-wide">
          O que fazer?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => onSelect(index)}
              disabled={disabled}
              className={`
                relative overflow-hidden
                p-4 rounded-lg border-2 transition-all duration-200
                font-semibold text-base text-left
                ${
                  disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer transform hover:scale-105 active:scale-95"
                }
                ${getEmpathyClass(choice.empathyScore)}
              `}
            >
              {/* Background animation */}
              <div className="absolute inset-0 opacity-0 hover:opacity-20 bg-white transition-opacity duration-300"></div>

              {/* Conteúdo */}
              <div className="relative flex items-start gap-3">
                {/* Ícone */}
                <span className="text-xl flex-shrink-0 mt-1">
                  {getRiskIcon(choice.risk)}
                </span>

                {/* Texto */}
                <div className="flex-1 text-left">
                  <p className="font-semibold leading-tight">{choice.text}</p>

                  {/* Detalhes secundários */}
                  <div className="flex gap-3 mt-2 text-xs opacity-75">
                    {choice.empathyScore !== undefined && (
                      <span>
                        💚 {choice.empathyScore > 50 ? "+" : ""}
                        {choice.empathyScore - 50}
                      </span>
                    )}
                    {choice.risk && (
                      <span className="capitalize">Risco: {choice.risk}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Indicador de já visitado */}
              {choicesMade.some((c) => c.choiceIndex === index) && (
                <div className="absolute top-2 right-2 bg-gray-400 text-white text-xs px-2 py-1 rounded">
                  ✓ Já visitado
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Legenda de empatia */}
        <div className="mt-6 text-xs text-gray-400 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Alta empatia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span>Empatia neutra</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span>Baixa empatia</span>
          </div>
        </div>
      </div>
    </div>
  );
};

ChoiceButtons.propTypes = {
  choices: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      nextScene: PropTypes.string,
      empathyScore: PropTypes.number,
      risk: PropTypes.oneOf(["high", "medium", "low"]),
      consequence: PropTypes.string,
    }),
  ),
  onSelect: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  gameState: PropTypes.shape({
    choices_made: PropTypes.array,
  }),
};

export default ChoiceButtons;
