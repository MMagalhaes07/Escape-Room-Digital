/**
 * GameCompletion.jsx
 *
 * Resumo das escolhas e final alcançado
 * Feedback pedagógico personalizado
 * Exportação CSV e retorno ao dashboard
 *
 * Props:
 * - sessionResults: { scenario, finalType, empathy, score, time, choices, puzzles }
 * - onExport: () => Promise<Blob>
 * - onRestart: () => void
 */

import React, { useState } from "react";
import PropTypes from "prop-types";

const GameCompletion = ({ sessionResults = {}, onExport, onRestart }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  /**
   * Obter ícone e cor baseado no tipo de final
   */
  const getFinalTypeStyle = (finalType) => {
    const styles = {
      positive: {
        icon: "😊",
        color: "green",
        title: "Final Positivo",
        description: "Excelente trabalho! Demonstraste muita empatia.",
      },
      neutral: {
        icon: "😐",
        color: "yellow",
        title: "Final Neutro",
        description:
          "Fizeste algumas escolhas boas, mas tens margem para melhorar.",
      },
      negative: {
        icon: "😞",
        color: "red",
        title: "Final Negativo",
        description: "Reflete sobre as tuas escolhas e tenta novamente.",
      },
    };

    return (
      styles[finalType?.toLowerCase()] || {
        icon: "❓",
        color: "gray",
        title: "Final Desconhecido",
        description: "Obrigado por jogares!",
      }
    );
  };

  /**
   * Formatar tempo em MM:SS
   */
  const formatTime = (ms) => {
    if (!ms) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /**
   * Descarregar CSV
   */
  const handleExport = async () => {
    if (!onExport) return;

    setIsExporting(true);
    try {
      const blob = await onExport();

      // Criar URL de download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sessao_${sessionResults.sessionId}_${new Date().getTime()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao exportar:", error);
      alert("Erro ao exportar CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const {
    scenario = "Cenário desconhecido",
    finalType = "neutral",
    empathy = 50,
    score = 0,
    time = 0,
    choices = [],
    puzzles = {},
  } = sessionResults;

  const finalStyle = getFinalTypeStyle(finalType);
  const colorClass =
    {
      green: "from-green-500 to-green-600",
      yellow: "from-yellow-500 to-yellow-600",
      red: "from-red-500 to-red-600",
      gray: "from-gray-500 to-gray-600",
    }[finalStyle.color] || "from-gray-500 to-gray-600";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header com gradiente */}
          <div
            className={`bg-gradient-to-r ${colorClass} p-8 text-white text-center`}
          >
            <div className="text-6xl mb-4">{finalStyle.icon}</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {finalStyle.title}
            </h1>
            <p className="text-lg opacity-90">{finalStyle.description}</p>
          </div>

          {/* Conteúdo */}
          <div className="p-8">
            {/* Cenário */}
            <div className="mb-6 pb-6 border-b">
              <h2 className="text-sm uppercase text-gray-600 font-semibold mb-1">
                Cenário
              </h2>
              <p className="text-xl text-gray-800">{scenario}</p>
            </div>

            {/* Estatísticas principais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b">
              {/* Tempo */}
              <div className="text-center">
                <p className="text-gray-600 text-xs uppercase font-semibold mb-2">
                  ⏱️ Tempo
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatTime(time)}
                </p>
              </div>

              {/* Pontuação */}
              <div className="text-center">
                <p className="text-gray-600 text-xs uppercase font-semibold mb-2">
                  ⭐ Pontuação
                </p>
                <p className="text-2xl font-bold text-yellow-600">{score}</p>
              </div>

              {/* Empatia */}
              <div className="text-center">
                <p className="text-gray-600 text-xs uppercase font-semibold mb-2">
                  💚 Empatia
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {empathy.toFixed(0)}%
                </p>
              </div>

              {/* Decisões */}
              <div className="text-center">
                <p className="text-gray-600 text-xs uppercase font-semibold mb-2">
                  🎯 Decisões
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {choices.length}
                </p>
              </div>
            </div>

            {/* Barra de Empatia */}
            <div className="mb-8 pb-8 border-b">
              <h3 className="text-sm uppercase text-gray-600 font-semibold mb-3">
                Evolução de Empatia
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                    empathy >= 70
                      ? "from-green-400 to-green-500"
                      : empathy >= 50
                        ? "from-yellow-400 to-yellow-500"
                        : "from-red-400 to-red-500"
                  }`}
                  style={{ width: `${empathy}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Resumo de Decisões */}
            {choices.length > 0 && (
              <div className="mb-8 pb-8 border-b">
                <h3 className="text-sm uppercase text-gray-600 font-semibold mb-3">
                  🎯 Decisões Tomadas
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {choices.map((choice, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded text-sm text-gray-700"
                    >
                      <span className="font-semibold text-gray-900">
                        {index + 1}.
                      </span>{" "}
                      {choice.text || choice.choiceText || "Escolha anónima"}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Pedagógico */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-8">
              <p className="text-blue-900 font-semibold mb-2">
                💡 Feedback Pedagógico
              </p>
              <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
                <li>
                  {empathy >= 70
                    ? "Demonstraste excelente empatia! Continuacompreendendo as perspetivas dos outros."
                    : empathy >= 50
                      ? "Tens uma boa base de empatia. Tenta colocar-te mais vezes no lugar dos outros."
                      : "Reflete sobre as consequências das tuas ações para os outros."}
                </li>
                <li>
                  {puzzles && Object.keys(puzzles).length > 0
                    ? `Resolveste ${Object.values(puzzles).filter((p) => p.solved).length} puzzle(s). Parabéns pela perseverança!`
                    : "Não resolveste nenhum puzzle nesta sessão."}
                </li>
                <li>
                  Tenta novamente para explorar outras narrativas e finais.
                </li>
              </ul>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className={`
                  flex-1 px-6 py-3 rounded-lg font-semibold transition-all
                  text-white
                  ${
                    isExporting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 active:scale-95"
                  }
                `}
              >
                {isExporting ? "⏳ Exportando..." : "📥 Exportar CSV"}
              </button>

              <button
                onClick={onRestart}
                className="flex-1 px-6 py-3 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all"
              >
                🎮 Voltar ao Dashboard
              </button>
            </div>

            {exportSuccess && (
              <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded text-green-800 text-sm">
                ✓ CSV exportado com sucesso!
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>Obrigado por jogares Escape Room Digital!</p>
          <p>Continuamos a trabalhar para melhorar a experiência educativa.</p>
        </div>
      </div>
    </div>
  );
};

GameCompletion.propTypes = {
  sessionResults: PropTypes.shape({
    scenario: PropTypes.string,
    finalType: PropTypes.oneOf(["positive", "neutral", "negative"]),
    empathy: PropTypes.number,
    score: PropTypes.number,
    time: PropTypes.number,
    choices: PropTypes.array,
    puzzles: PropTypes.object,
    sessionId: PropTypes.string,
  }),
  onExport: PropTypes.func,
  onRestart: PropTypes.func,
};

export default GameCompletion;
