/**
 * CloutMeter Component
 * Visualiza o "Clout Score" (estatuto social do jogador)
 * Usado no Scenario 2 para mostrar impacto de decisões
 */

import React, { useEffect, useState } from 'react';
import './CloutMeter.css';

export default function CloutMeter({ 
  cloutValue = 45,
  empathyValue = 50,
  groupPressure = 0,
  biaStatus = 'normal',
  animated = true 
}) {
  const [displayValue, setDisplayValue] = useState(cloutValue);
  const [previousValue, setPreviousValue] = useState(cloutValue);
  const [isChanging, setIsChanging] = useState(false);

  // Animar mudança de valor
  useEffect(() => {
    if (displayValue !== cloutValue) {
      setIsChanging(true);
      setPreviousValue(displayValue);
      
      const interval = setInterval(() => {
        setDisplayValue(prev => {
          const diff = cloutValue - prev;
          const step = diff > 0 ? Math.ceil(diff / 10) : Math.floor(diff / 10);
          const newValue = prev + step;
          
          if ((diff > 0 && newValue >= cloutValue) || (diff < 0 && newValue <= cloutValue)) {
            clearInterval(interval);
            setIsChanging(false);
            return cloutValue;
          }
          return newValue;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [cloutValue]);

  const getCloutLevel = () => {
    if (displayValue >= 75) return 'ultra-high';
    if (displayValue >= 60) return 'high';
    if (displayValue >= 40) return 'medium';
    if (displayValue >= 25) return 'low';
    return 'critical';
  };

  const getCloutLabel = () => {
    switch (getCloutLevel()) {
      case 'ultra-high':
        return '👑 Lenda';
      case 'high':
        return '⭐ Influenciador';
      case 'medium':
        return '💫 Respeitado';
      case 'low':
        return '😬 Ignorado';
      case 'critical':
        return '🔴 Paria';
      default:
        return 'Desconhecido';
    }
  };

  const getChangeIndicator = () => {
    const change = cloutValue - previousValue;
    if (change > 0) return { symbol: '📈', text: `+${change}`, color: 'positive' };
    if (change < 0) return { symbol: '📉', text: `${change}`, color: 'negative' };
    return { symbol: '➡️', text: '0', color: 'neutral' };
  };

  const changeIndicator = getChangeIndicator();

  return (
    <div className="clout-meter-container">
      {/* Main Clout Meter */}
      <div className="clout-meter">
        <div className="meter-header">
          <div className="meter-label">
            <h4>Estatuto Social</h4>
            <span className="clout-level">{getCloutLabel()}</span>
          </div>
          
          <div className={`clout-value ${isChanging ? 'changing' : ''}`}>
            <span className="current-value">{Math.round(displayValue)}</span>
            <span className="max-value">/100</span>
          </div>
        </div>

        {/* Bar Background */}
        <div className={`meter-bar meter-${getCloutLevel()}`}>
          {/* Filled Bar */}
          <div
            className="meter-fill"
            style={{
              width: `${displayValue}%`,
            }}
          >
            {/* Shine effect */}
            <div className="meter-shine"></div>
          </div>

          {/* Milestone markers */}
          <div className="meter-milestones">
            <div className="milestone" style={{ left: '25%' }}>25</div>
            <div className="milestone" style={{ left: '50%' }}>50</div>
            <div className="milestone" style={{ left: '75%' }}>75</div>
          </div>
        </div>

        {/* Change Indicator */}
        {isChanging && (
          <div className={`change-indicator ${changeIndicator.color}`}>
            <span className="change-symbol">{changeIndicator.symbol}</span>
            <span className="change-value">{changeIndicator.text}</span>
          </div>
        )}
      </div>

      {/* Secondary Metrics */}
      <div className="secondary-metrics">
        {/* Empathy Score */}
        <div className="metric-item empathy">
          <div className="metric-header">
            <span className="metric-icon">💚</span>
            <span className="metric-label">Empatia</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${empathyValue}%` }}></div>
          </div>
          <span className="metric-value">{Math.round(empathyValue)}%</span>
        </div>

        {/* Group Pressure */}
        <div className="metric-item pressure">
          <div className="metric-header">
            <span className="metric-icon">⚡</span>
            <span className="metric-label">Pressão</span>
          </div>
          <div className="metric-bar">
            <div className="metric-fill" style={{ width: `${groupPressure}%` }}></div>
          </div>
          <span className="metric-value">{Math.round(groupPressure)}%</span>
        </div>

        {/* Bia Status */}
        <div className="metric-item bia-status">
          <div className="metric-header">
            <span className="metric-icon">👤</span>
            <span className="metric-label">Status Bia</span>
          </div>
          <div className={`bia-indicator status-${biaStatus}`}>
            {biaStatus === 'normal' && '🟢 Online'}
            {biaStatus === 'offline' && '⚫ Offline'}
            {biaStatus === 'desperate' && '🔴 Desesperada'}
            {biaStatus === 'intervention' && '🆘 Crise'}
          </div>
        </div>
      </div>

      {/* Insights/Tips */}
      <div className="clout-insights">
        <div className="insight-title">💡 Dica</div>
        {displayValue >= 75 && (
          <p>Você é uma figura dominante no grupo. Mas será que isso é bom para Bia?</p>
        )}
        {displayValue >= 50 && displayValue < 75 && (
          <p>Você mantém um bom estatuto. Use-o de forma responsável.</p>
        )}
        {displayValue >= 25 && displayValue < 50 && (
          <p>Seu estatuto está a diminuir. O grupo está a notar suas hesitações.</p>
        )}
        {displayValue < 25 && (
          <p>Você é visto como um pária. Talvez seja hora de mudar de estratégia.</p>
        )}

        {groupPressure > 70 && (
          <p className="pressure-insight">⚠️ A pressão do grupo é muito alta. Suas próximas ações serão críticas.</p>
        )}

        {empathyValue >= 80 && displayValue < 30 && (
          <p className="sacrifice-insight">🎭 Você está a sacrificar seu estatuto pela empatia. Bom ou insano?</p>
        )}
      </div>
    </div>
  );
}
