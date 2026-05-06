/**
 * SessionMetrics.jsx
 *
 * HUD durante o jogo com:
 * - timer
 * - score de empatia (barra progressiva)
 * - decisões tomadas
 * - puzzles resolvidos/total
 *
 * Props:
 * - metrics: { empathy, score, decisionsCount, puzzlesCount, puzzlesTotal }
 * - sessionData: { startTime, duration }
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const SessionMetrics = ({ metrics = {}, sessionData = {} }) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer
  useEffect(() => {
    if (!sessionData.startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionData.startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionData.startTime]);

  /**
   * Formatar tempo em MM:SS
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  /**
   * Obter cor de empatia
   */
  const getEmpathyColor = (empathy = 50) => {
    if (empathy >= 70) return "bg-green-500";
    if (empathy >= 50) return "bg-blue-500";
    if (empathy >= 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  /**
   * Obter label de empatia
   */
  const getEmpathyLabel = (empathy = 50) => {
    if (empathy >= 70) return "Excelente empatia 😊";
    if (empathy >= 50) return "Boa empatia 😐";
    if (empathy >= 30) return "Empatia baixa 😕";
    return "Pouca empatia 😞";
  };

  const {
    empathy = 50,
    score = 0,
    decisionsCount = 0,
    puzzlesCount = 0,
    puzzlesTotal = 0,
  } = metrics;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-b from-slate-900 to-slate-800 text-white z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Grid de métricas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {/* Timer */}
          <div className="bg-slate-700 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-300 mb-1 uppercase">
              ⏱️ Tempo
            </p>
            <p className="text-xl md:text-2xl font-mono font-bold text-blue-400">
              {formatTime(elapsedTime)}
            </p>
          </div>

          {/* Score */}
          <div className="bg-slate-700 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-300 mb-1 uppercase">
              ⭐ Pontuação
            </p>
            <p className="text-xl md:text-2xl font-bold text-yellow-400">
              {score}
            </p>
          </div>

          {/* Decisões */}
          <div className="bg-slate-700 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-300 mb-1 uppercase">
              🎯 Decisões
            </p>
            <p className="text-xl md:text-2xl font-bold text-purple-400">
              {decisionsCount}
            </p>
          </div>

          {/* Puzzles */}
          <div className="bg-slate-700 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-300 mb-1 uppercase">
              🧩 Puzzles
            </p>
            <p className="text-xl md:text-2xl font-bold text-green-400">
              {puzzlesCount}/{puzzlesTotal}
            </p>
          </div>

          {/* Empatia Label */}
          <div className="bg-slate-700 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-300 mb-1 uppercase">
              💚 Empatia
            </p>
            <p className="text-sm font-semibold truncate">
              {getEmpathyLabel(empathy)}
            </p>
          </div>
        </div>

        {/* Barra de Empatia (full width) */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-gray-400">
              Score de Empatia
            </span>
            <span
              className={`text-lg font-bold ${getEmpathyColor(empathy)} bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-red-400`}
            >
              {empathy.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getEmpathyColor(empathy)}`}
              style={{ width: `${empathy}%` }}
            ></div>
          </div>
          {/* Marcadores de faixa */}
          <div className="flex justify-between mt-1 text-xs text-gray-500 px-1">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

SessionMetrics.propTypes = {
  metrics: PropTypes.shape({
    empathy: PropTypes.number,
    score: PropTypes.number,
    decisionsCount: PropTypes.number,
    puzzlesCount: PropTypes.number,
    puzzlesTotal: PropTypes.number,
  }),
  sessionData: PropTypes.shape({
    startTime: PropTypes.number,
    duration: PropTypes.number,
  }),
};

export default SessionMetrics;
