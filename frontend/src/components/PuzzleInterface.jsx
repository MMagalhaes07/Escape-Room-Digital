/**
 * PuzzleInterface Component
 * Interface moderna para resolver puzzles durante o jogo
 */
import React, { useState, useEffect, useRef } from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiSend,
  FiRefreshCw,
  FiAward,
  FiBook,
} from "react-icons/fi";
import { useAuthStore, useGameStore, useUIStore } from "../store/index.js";
import { API } from "../services/api.js";
import HintPanel from "./HintPanel.jsx";
import "./GameComponents.css";

const DIFFICULTY_CONFIG = {
  easy: { label: "Fácil", color: "#00D4AA", icon: "◆" },
  medium: { label: "Médio", color: "#F59E0B", icon: "◆◆" },
  hard: { label: "Difícil", color: "#EF4444", icon: "◆◆◆" },
};

export default function PuzzleInterface({ puzzleId, puzzleData, onSolved }) {
  const { gameState } = useGameStore();
  const { user } = useAuthStore();
  const { showNotification } = useUIStore();

  const [answer, setAnswer] = useState("");
  const [solving, setSolving] = useState(false);
  const [solved, setSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [feedbackType, setFeedbackType] = useState(null); // 'success' | 'error'
  const [pointsEarned, setPointsEarned] = useState(0);
  const [empathyChange, setEmpathyChange] = useState(0);
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);
  const [explanation, setExplanation] = useState(null);
  const [showEducation, setShowEducation] = useState(false);
  const [startTime] = useState(Date.now());
  const inputRef = useRef(null);

  const sessionId = gameState?.sessionId;
  const diff = puzzleData?.difficulty?.toLowerCase();
  const diffConfig = DIFFICULTY_CONFIG[diff] || DIFFICULTY_CONFIG.medium;

  useEffect(() => {
    if (!solved && inputRef.current) {
      inputRef.current.focus();
    }
  }, [solved]);

  // Reset state when puzzle changes
  useEffect(() => {
    setAnswer("");
    setSolved(false);
    setAttempts(0);
    setFeedback(null);
    setFeedbackType(null);
    setNewlyUnlocked([]);
    setExplanation(null);
    setShowEducation(false);
  }, [puzzleId]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!answer.trim() || solving || !sessionId || !user?.id) return;

    setSolving(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      // Use the dedicated puzzle endpoint first (richer feedback)
      let response;
      try {
        response = await API.puzzles.solve({
          sessionId,
          puzzleId,
          answer: answer.trim(),
          timeSpent,
        });
      } catch {
        // fallback to game endpoint
        const fallback = await API.game.completePuzzle(
          sessionId,
          user.id,
          puzzleId,
          answer.trim(),
        );
        response = {
          data: { isCorrect: fallback.data.success, ...fallback.data },
        };
      }

      const data = response.data;
      const isCorrect = data.isCorrect ?? data.success;
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (isCorrect) {
        setSolved(true);
        setFeedbackType("success");
        setFeedback(data.feedback || "Excelente! Resposta correta!");
        setPointsEarned(data.pointsEarned || data.points || 50);
        setEmpathyChange(data.empathyChange || 0);
        setNewlyUnlocked(data.hintsUnlocked || []);
        setExplanation(data.explanation || data.characterInsight || null);

        showNotification(
          `✓ Puzzle resolvido! +${data.pointsEarned || 50} pontos`,
          "success",
        );
        onSolved?.(data.pointsEarned || 50);
      } else {
        setFeedbackType("error");
        setFeedback(
          data.feedback ||
            (newAttempts >= 3
              ? "Continua a tentar! Consulta as pistas disponíveis."
              : "Resposta incorreta. Tenta novamente!"),
        );
        setAnswer("");
        setTimeout(() => {
          setFeedbackType(null);
          inputRef.current?.focus();
        }, 1800);
      }
    } catch (err) {
      showNotification("Erro ao processar resposta", "error");
      setFeedbackType("error");
      setFeedback("Erro de ligação. Tenta novamente.");
      setTimeout(() => setFeedbackType(null), 2000);
    } finally {
      setSolving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) handleSubmit(e);
  };

  if (!puzzleData) return null;

  // ─── SOLVED STATE ────────────────────────────────────────────────────────────
  if (solved) {
    return (
      <div className="puzzle-wrapper">
        <div className="puzzle-solved-card">
          <div className="puzzle-solved-glow" />
          <div className="puzzle-solved-icon">
            <FiCheckCircle size={40} />
          </div>
          <h3 className="puzzle-solved-title">Puzzle Resolvido!</h3>

          <div className="puzzle-rewards">
            <div className="reward-chip reward-points">
              <FiAward size={14} />
              <span>+{pointsEarned} pontos</span>
            </div>
            {empathyChange !== 0 && (
              <div
                className={`reward-chip ${empathyChange > 0 ? "reward-empathy-pos" : "reward-empathy-neg"}`}
              >
                <span>
                  {empathyChange > 0 ? "💚" : "💔"} Empatia{" "}
                  {empathyChange > 0 ? "+" : ""}
                  {empathyChange}
                </span>
              </div>
            )}
            {attempts === 1 && (
              <div className="reward-chip reward-bonus">
                <span>⚡ Primeira tentativa!</span>
              </div>
            )}
          </div>

          {feedback && <p className="puzzle-solved-feedback">{feedback}</p>}

          {explanation && (
            <div className="puzzle-education">
              <button
                className="puzzle-education-toggle"
                onClick={() => setShowEducation(!showEducation)}
              >
                <FiBook size={14} />
                <span>
                  {showEducation ? "Ocultar" : "Ver"} contexto educativo
                </span>
                <span className={`puzzle-chevron ${showEducation ? "up" : ""}`}>
                  ▾
                </span>
              </button>
              {showEducation && (
                <div className="puzzle-education-content">
                  <p>{explanation}</p>
                </div>
              )}
            </div>
          )}

          {newlyUnlocked.length > 0 && (
            <div className="puzzle-unlocked">
              <span className="puzzle-unlocked-label">
                🔓 {newlyUnlocked.length} nova
                {newlyUnlocked.length > 1
                  ? "s pistas desbloqueadas"
                  : " pista desbloqueada"}
                !
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── ACTIVE PUZZLE ───────────────────────────────────────────────────────────
  return (
    <div className="puzzle-wrapper">
      <div
        className={`puzzle-card ${feedbackType ? `puzzle-card--${feedbackType}` : ""}`}
      >
        {/* Header */}
        <div className="puzzle-header">
          <div className="puzzle-header-left">
            <div className="puzzle-icon-badge">🧩</div>
            <div>
              <h3 className="puzzle-title">{puzzleData.title || "Desafio"}</h3>
              {puzzleData.type && (
                <span className="puzzle-type-tag">{puzzleData.type}</span>
              )}
            </div>
          </div>
          <div className="puzzle-header-right">
            <div
              className="puzzle-difficulty"
              style={{ color: diffConfig.color, borderColor: diffConfig.color }}
            >
              <span>{diffConfig.icon}</span>
              <span>{diffConfig.label}</span>
            </div>
            {attempts > 0 && (
              <div className="puzzle-attempts-badge">
                <FiRefreshCw size={11} />
                <span>{attempts}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="puzzle-description">
          <p>{puzzleData.description}</p>
        </div>

        {/* Static hint from puzzleData */}
        {puzzleData.hint && (
          <div className="puzzle-static-hint">
            <span className="puzzle-static-hint-icon">💡</span>
            <p>{puzzleData.hint}</p>
          </div>
        )}

        {/* Feedback banner */}
        {feedbackType && feedback && (
          <div
            className={`puzzle-feedback-banner puzzle-feedback-banner--${feedbackType}`}
          >
            {feedbackType === "success" ? (
              <FiCheckCircle size={16} />
            ) : (
              <FiXCircle size={16} />
            )}
            <span>{feedback}</span>
          </div>
        )}

        {/* Input */}
        <form className="puzzle-input-area" onSubmit={handleSubmit}>
          <div className="puzzle-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="puzzle-input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreve a tua resposta…"
              disabled={solving}
              autoComplete="off"
            />
            <button
              type="submit"
              className="puzzle-submit-btn"
              disabled={solving || !answer.trim() || !sessionId || !user?.id}
            >
              {solving ? (
                <div className="puzzle-btn-spinner" />
              ) : (
                <>
                  <FiSend size={15} />
                  <span>Enviar</span>
                </>
              )}
            </button>
          </div>
          <p className="puzzle-input-hint">Prima Enter para submeter</p>
        </form>

        {/* Hint Panel */}
        <HintPanel
          puzzleId={puzzleId}
          sessionId={sessionId}
          newlyUnlocked={newlyUnlocked}
        />
      </div>
    </div>
  );
}
