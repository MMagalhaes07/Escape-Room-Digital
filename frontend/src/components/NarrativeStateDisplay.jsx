/**
 * NarrativeStateDisplay Component
 * Displays game state (empathy, clout, pressure, timer) during narrative
 * Provides atmospheric visual feedback for player decisions
 */

import React, { useEffect, useState } from "react";
import { useGameStore } from "../store/index";
import "./NarrativeStateDisplay.css";

export const NarrativeStateDisplay = ({ scenario, currentState }) => {
  const { playerState, gameState } = useGameStore();
  const [displayState, setDisplayState] = useState({
    empathy: currentState?.empathyScore || 50,
    clout: currentState?.cloutScore || 0,
    pressure: currentState?.groupPressure || 0,
    timer: null,
    isUrgent: false,
  });

  useEffect(() => {
    // Update state display when scene changes
    if (currentState) {
      setDisplayState({
        empathy: currentState.empathyScore || 50,
        clout: currentState.cloutScore || 0,
        pressure: currentState.groupPressure || 0,
        timer: currentState.timeRemaining || null,
        isUrgent: (currentState.timeRemaining || 0) < 5,
      });
    }
  }, [currentState]);

  const getEmpathyColor = (score) => {
    if (score >= 75) return "#10b981"; // green
    if (score >= 50) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const renderThermometer = (label, value, max = 100, color = "#6366f1") => (
    <div className="state-indicator">
      <span className="state-label">{label}</span>
      <div className="thermometer-bar">
        <div
          className="thermometer-fill"
          style={{
            width: `${(value / max) * 100}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="state-value">
        {value}/{max}
      </span>
    </div>
  );

  // Scenario 1: Investigation - show empathy and investigation progress
  const renderScenario1 = () => (
    <div className="narrative-state scenario-1">
      <div className="state-row">
        {renderThermometer(
          "💚 Empatia",
          displayState.empathy,
          100,
          getEmpathyColor(displayState.empathy),
        )}
      </div>
      <div className="state-hint">
        <p className="hint-text">
          <strong>Lembre-se:</strong> Cada decisão afeta Bia. Escolha com cabeça
          E coração.
        </p>
      </div>
    </div>
  );

  // Scenario 2: Pressure - show clout, empathy, and timer urgency
  const renderScenario2 = () => (
    <div className="narrative-state scenario-2">
      <div className="state-row">
        {renderThermometer(
          "👑 Clout",
          Math.max(0, displayState.clout + 50),
          100,
          "#f59e0b",
        )}
      </div>
      <div className="state-row">
        {renderThermometer(
          "❤️ Empatia",
          displayState.empathy,
          100,
          getEmpathyColor(displayState.empathy),
        )}
      </div>

      {displayState.pressure > 0 && (
        <div className="pressure-alert">
          <span className="pressure-indicator">⚠️ Pressão do Grupo</span>
          <div className="pressure-bar">
            <div
              className="pressure-fill"
              style={{ width: `${displayState.pressure}%` }}
            />
          </div>
        </div>
      )}

      {displayState.timer !== null && (
        <div
          className={`timer-display ${displayState.isUrgent ? "warning" : ""}`}
        >
          <span className="timer-icon">⏱️</span>
          <span className="timer-text">
            {displayState.timer}s para responder
          </span>
        </div>
      )}

      <div className="state-hint scenario-2-hint">
        <p className="hint-text">
          <strong>Verdade:</strong> O clout obtido através da crueldade é falso.
          A verdadeira amizade não requer humilhar outros.
        </p>
      </div>
    </div>
  );

  return (
    <div className="narrative-state-container">
      {scenario === "scenario_1" || scenario === "scenario_1_echo_codigo"
        ? renderScenario1()
        : renderScenario2()}
    </div>
  );
};

export default NarrativeStateDisplay;
