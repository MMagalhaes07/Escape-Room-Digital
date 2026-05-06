/**
 * PuzzleInterface.jsx
 *
 * Interface para resolver puzzles
 * Suporta: multiple_choice, text_validation, ordering, matching
 *
 * Props:
 * - puzzleData: { id, type, title, description, options, answer }
 * - onSubmit: (answer) => void
 * - onHintRequest: () => void
 * - sessionId: string
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const PuzzleInterface = ({
  puzzleData,
  onSubmit,
  onHintRequest,
  sessionId,
  isLoading = false,
}) => {
  const [answer, setAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const MAX_ATTEMPTS = 3;
  const maxAttemptsReached = attempts >= MAX_ATTEMPTS;

  if (!puzzleData) {
    return null;
  }

  const {
    type = "multiple_choice",
    title,
    description,
    options = [],
    hint,
  } = puzzleData;

  /**
   * Handler para submeter resposta
   */
  const handleSubmit = () => {
    if (answer === null) {
      setFeedback({
        type: "warning",
        message: "Seleciona uma resposta",
      });
      return;
    }

    setAttempts(attempts + 1);
    onSubmit(answer);
  };

  /**
   * Handler para solicitar pista
   */
  const handleRequestHint = async () => {
    setShowHint(true);
    if (onHintRequest) {
      await onHintRequest();
    }
  };

  /**
   * Renderizar componente baseado no tipo de puzzle
   */
  const renderPuzzle = () => {
    switch (type) {
      case "multiple_choice":
        return (
          <div className="space-y-3">
            {options.map((option, index) => (
              <label
                key={index}
                className={`
                  flex items-center p-4 rounded-lg border-2 cursor-pointer
                  transition-all hover:border-blue-400
                  ${
                    answer === index
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white"
                  }
                `}
              >
                <input
                  type="radio"
                  name="puzzle-option"
                  value={index}
                  checked={answer === index}
                  onChange={() => setAnswer(index)}
                  disabled={maxAttemptsReached}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case "text_validation":
        return (
          <div>
            <input
              type="text"
              placeholder="Escreve a tua resposta..."
              value={answer || ""}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={maxAttemptsReached}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        );

      case "ordering":
        return (
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              Arrasta os itens para ordenar
            </p>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="bg-white p-3 rounded border-2 border-gray-300 cursor-move hover:border-blue-400"
                >
                  <span className="font-semibold mr-2">{index + 1}.</span>
                  {option}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              ℹ️ Esta funcionalidade requer drag-and-drop (implementar)
            </p>
          </div>
        );

      case "matching":
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-sm mb-3">Esquerda</p>
              {options.left?.map((item, index) => (
                <div
                  key={index}
                  className="bg-blue-50 p-3 rounded mb-2 border border-blue-200"
                >
                  {item}
                </div>
              ))}
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Direita</p>
              {options.right?.map((item, index) => (
                <div
                  key={index}
                  className="bg-green-50 p-3 rounded mb-2 border border-green-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-gray-600 italic">
            Tipo de puzzle desconhecido: {type}
          </div>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-lg p-6 md:p-8 my-6 border-2 border-purple-200">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-purple-900 mb-2">
          🧩 {title || "Puzzle"}
        </h2>
        <p className="text-gray-700">{description}</p>

        {/* Info de tentativas */}
        <div className="mt-3 flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Tentativas:</span> {attempts}/
            {MAX_ATTEMPTS}
          </div>
          {maxAttemptsReached && (
            <div className="text-sm font-semibold text-red-600">
              ❌ Limite de tentativas atingido!
            </div>
          )}
        </div>
      </div>

      {/* Puzzle interface */}
      <div className="mb-6 bg-white rounded-lg p-6 border border-gray-200">
        {renderPuzzle()}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`
            mb-6 p-4 rounded-lg font-semibold
            ${
              feedback.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : feedback.type === "warning"
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                  : "bg-red-100 text-red-800 border border-red-300"
            }
          `}
        >
          {feedback.type === "success"
            ? "✓ "
            : feedback.type === "warning"
              ? "⚠️ "
              : "✗ "}
          {feedback.message}
        </div>
      )}

      {/* Hint */}
      {showHint && hint && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-yellow-900 font-semibold">💡 Pista:</p>
          <p className="text-yellow-800 mt-2">{hint}</p>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleSubmit}
          disabled={isLoading || maxAttemptsReached}
          className={`
            px-6 py-2 rounded-lg font-semibold transition-all
            ${
              isLoading || maxAttemptsReached
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
            }
          `}
        >
          {isLoading ? "⏳ Processando..." : "✓ Submeter"}
        </button>

        <button
          onClick={handleRequestHint}
          disabled={isLoading || !hint}
          className={`
            px-6 py-2 rounded-lg font-semibold transition-all
            ${
              isLoading || !hint
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-yellow-500 text-white hover:bg-yellow-600 active:scale-95"
            }
          `}
        >
          💡 Pista
        </button>

        <button
          onClick={() => {
            setAnswer(null);
            setFeedback(null);
          }}
          disabled={isLoading}
          className="px-6 py-2 rounded-lg font-semibold bg-gray-300 text-gray-700 hover:bg-gray-400 transition-all active:scale-95"
        >
          🔄 Limpar
        </button>
      </div>

      {/* Info adicional */}
      <p className="text-xs text-gray-600 mt-4">
        ℹ️ Se não conseguires resolver, podes voltar a tentar depois ou pedir
        ajuda ao professor.
      </p>
    </div>
  );
};

PuzzleInterface.propTypes = {
  puzzleData: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.oneOf([
      "multiple_choice",
      "text_validation",
      "ordering",
      "matching",
    ]),
    title: PropTypes.string,
    description: PropTypes.string,
    options: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.arrayOf(PropTypes.object),
      PropTypes.shape({
        left: PropTypes.array,
        right: PropTypes.array,
      }),
    ]),
    hint: PropTypes.string,
    answer: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  onSubmit: PropTypes.func.isRequired,
  onHintRequest: PropTypes.func,
  sessionId: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default PuzzleInterface;
