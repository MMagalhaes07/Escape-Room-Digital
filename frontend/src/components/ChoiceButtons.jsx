/**
 * ChoiceButtons Component
 * Botões de decisão para a cena atual
 */
import React from "react";
import "./GameComponents.css";

export default function ChoiceButtons({
  choices = [],
  disabled = false,
  onSelect,
}) {
  if (!choices || choices.length === 0) return null;

  const getChoiceClass = (choice) => {
    const classes = ["choice-button"];

    // Add empathy/consequence styling
    if (typeof choice.empathyScore === "number") {
      if (choice.empathyScore >= 80) {
        classes.push("empathy-heavy");
      } else if (choice.empathyScore <= 20) {
        classes.push("consequence-negative");
      }
    }

    return classes.join(" ");
  };

  const extractConsequencePreview = (text) => {
    // Extract the consequence preview from new choice text format
    // Format: "**Bold text** - Italic consequence preview."
    const match = text.match(/—\s*(.+?)(?:\.|$)/);
    return match ? match[1] : null;
  };

  return (
    <div className="choice-buttons">
      <p className="choices-label">O que faz?</p>
      <div className="choices-list">
        {choices.map((choice, idx) => {
          const preview = extractConsequencePreview(choice.text);

          return (
            <button
              key={`${choice.text}-${idx}`}
              className={getChoiceClass(choice)}
              onClick={() => onSelect?.(choice, idx)}
              disabled={disabled}
              title={
                typeof choice.empathyScore === "number"
                  ? `Consequência: Empatia ${choice.empathyScore > 0 ? "+" : ""}${choice.empathyScore}`
                  : undefined
              }
            >
              <span className="choice-text">{choice.text}</span>

              {preview && (
                <span className="choice-consequence-preview">{preview}</span>
              )}

              {typeof choice.empathyScore === "number" && !preview && (
                <span className="choice-consequence">
                  Empatia: {choice.empathyScore > 0 ? "+" : ""}
                  {choice.empathyScore}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
