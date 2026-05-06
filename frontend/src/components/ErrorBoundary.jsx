/**
 * ErrorBoundary.jsx
 *
 * Componente de limite de erro React
 * Captura erros não capturados em componentes filhos
 *
 * Uso:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */

import React from "react";
import PropTypes from "prop-types";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Atualizar estado para que a próxima renderização mostre fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log de erros para debugging
    console.error("ErrorBoundary capturou erro:", error, errorInfo);

    const newErrorCount = this.state.errorCount + 1;

    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: newErrorCount,
    }));

    // Enviar erro para serviço de logging (opcional)
    if (this.props.onError) {
      this.props.onError(error, errorInfo, newErrorCount);
    }

    // Se muitos erros, fazer reload
    if (newErrorCount > 5) {
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    });

    // Navegar para home se provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="text-5xl mb-4 text-center">⚠️</div>
              <h1 className="text-2xl font-bold text-red-900 text-center">
                Algo correu mal!
              </h1>
            </div>

            {/* Error Message */}
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm font-mono text-red-800 break-words">
                {this.state.error && this.state.error.toString()}
              </p>
            </div>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === "development" && this.state.errorInfo && (
              <details className="mb-6 p-4 bg-gray-100 rounded-lg">
                <summary className="font-semibold text-gray-700 cursor-pointer mb-2">
                  Detalhes Técnicos
                </summary>
                <pre className="text-xs text-gray-600 overflow-auto max-h-40 whitespace-pre-wrap break-words">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Error Count */}
            <div className="mb-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                Erros: {this.state.errorCount}/5
              </p>
              {this.state.errorCount > 3 && (
                <p className="text-xs text-yellow-700 mt-1">
                  ℹ️ A página vai recarregar automaticamente
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
              >
                Tentar Novamente
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
              >
                Ir para Home
              </button>
            </div>

            {/* Support Info */}
            <p className="text-xs text-gray-500 text-center mt-6">
              Se o problema persistir, contacta o suporte.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  onError: PropTypes.func,
  onReset: PropTypes.func,
};

ErrorBoundary.defaultProps = {
  children: null,
  onError: null,
  onReset: null,
};

export default ErrorBoundary;
