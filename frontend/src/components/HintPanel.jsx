/**
 * HintPanel Component
 * Painel de pistas desbloqueáveis para puzzles
 */
import React, { useState, useEffect } from "react";
import { FiLock, FiUnlock, FiEye, FiEyeOff, FiZap } from "react-icons/fi";
import { API } from "../services/api.js";
import { useGameStore } from "../store/index.js";

const TIER_LABELS = { 1: "Básica", 2: "Contextual", 3: "Avançada" };
const TIER_COLORS = { 1: "#00D4AA", 2: "#F59E0B", 3: "#EF4444" };

export default function HintPanel({ puzzleId, sessionId, newlyUnlocked = [] }) {
  const [hints, setHints] = useState([]);
  const [lockedCount, setLockedCount] = useState(0);
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (puzzleId && sessionId) {
      fetchHints();
    }
  }, [puzzleId, sessionId, newlyUnlocked]);

  const fetchHints = async () => {
    setLoading(true);
    try {
      const res = await API.hints.getAvailable(puzzleId, sessionId);
      setHints(res.data.unlockedHints || []);
      setLockedCount(res.data.lockedCount || 0);
    } catch {
      // silently fail – hints are optional
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = async (hint) => {
    if (revealedIds.has(hint.id)) {
      setRevealedIds((prev) => {
        const next = new Set(prev);
        next.delete(hint.id);
        return next;
      });
      return;
    }
    setRevealedIds((prev) => new Set([...prev, hint.id]));
    if (!hint.was_viewed) {
      try {
        await API.hints.markViewed(hint.id, sessionId);
        setHints((prev) =>
          prev.map((h) => (h.id === hint.id ? { ...h, was_viewed: true } : h)),
        );
      } catch {}
    }
  };

  const unviewedCount = hints.filter((h) => !h.was_viewed).length;
  const totalLocked = lockedCount;

  if (!puzzleId || !sessionId) return null;

  return (
    <div className="hint-panel">
      <button
        className={`hint-panel-toggle ${expanded ? "open" : ""}`}
        onClick={() => setExpanded(!expanded)}
      >
        <FiZap size={15} />
        <span>Pistas</span>
        <div className="hint-badges">
          {unviewedCount > 0 && (
            <span className="hint-badge hint-badge-new">
              {unviewedCount} nova{unviewedCount > 1 ? "s" : ""}
            </span>
          )}
          {hints.length > 0 && (
            <span className="hint-badge hint-badge-count">
              {hints.length} desbloqueada{hints.length > 1 ? "s" : ""}
            </span>
          )}
          {totalLocked > 0 && (
            <span className="hint-badge hint-badge-locked">
              {totalLocked} bloqueada{totalLocked > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <span className={`hint-chevron ${expanded ? "up" : ""}`}>▾</span>
      </button>

      {expanded && (
        <div className="hint-panel-body">
          {loading && (
            <div className="hint-loading">
              <div className="hint-spinner" />
              <span>A carregar pistas...</span>
            </div>
          )}

          {!loading && hints.length === 0 && totalLocked === 0 && (
            <div className="hint-empty">
              <FiLock size={24} />
              <p>Nenhuma pista disponível ainda.</p>
              <span>Resolve o puzzle para desbloquear pistas!</span>
            </div>
          )}

          {!loading && hints.length === 0 && totalLocked > 0 && (
            <div className="hint-empty">
              <FiLock size={24} />
              <p>
                {totalLocked} pista{totalLocked > 1 ? "s" : ""} disponível
                {totalLocked > 1 ? "eis" : ""}
              </p>
              <span>Continua a tentar para as desbloquear.</span>
            </div>
          )}

          {!loading && hints.length > 0 && (
            <div className="hint-list">
              {hints.map((hint, idx) => {
                const isRevealed = revealedIds.has(hint.id);
                const color = TIER_COLORS[hint.tier] || "#6366f1";
                return (
                  <div
                    key={hint.id}
                    className={`hint-card ${isRevealed ? "revealed" : ""} ${hint.was_viewed ? "viewed" : "new"}`}
                    style={{ "--hint-color": color }}
                  >
                    <div className="hint-card-header">
                      <div className="hint-meta">
                        <span
                          className="hint-tier-dot"
                          style={{ background: color }}
                        />
                        <span className="hint-tier-label">
                          {TIER_LABELS[hint.tier] || `Nível ${hint.tier}`}
                        </span>
                        {!hint.was_viewed && (
                          <span className="hint-new-tag">Nova</span>
                        )}
                      </div>
                      <div className="hint-title-row">
                        <span className="hint-title">
                          {hint.title || `Pista ${idx + 1}`}
                        </span>
                        <button
                          className="hint-reveal-btn"
                          onClick={() => handleReveal(hint)}
                          title={isRevealed ? "Ocultar" : "Revelar pista"}
                        >
                          {isRevealed ? (
                            <FiEyeOff size={14} />
                          ) : (
                            <FiEye size={14} />
                          )}
                          <span>{isRevealed ? "Ocultar" : "Ver pista"}</span>
                        </button>
                      </div>
                    </div>
                    {isRevealed && (
                      <div className="hint-content">
                        <p>{hint.content}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {totalLocked > 0 && hints.length > 0 && (
            <div className="hint-locked-row">
              {Array.from({ length: totalLocked }).map((_, i) => (
                <div key={i} className="hint-locked-card">
                  <FiLock size={14} />
                  <span>Bloqueada</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
