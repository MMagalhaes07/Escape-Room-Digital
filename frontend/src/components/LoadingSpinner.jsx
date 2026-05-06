/**
 * LoadingSpinner.jsx
 *
 * Componente de loading reutilizável
 * Suporta diferentes tamanhos e mensagens
 *
 * Uso:
 * <LoadingSpinner />
 * <LoadingSpinner size="lg" message="Carregando..." />
 */

import React from "react";
import PropTypes from "prop-types";

const LoadingSpinner = ({
  size = "md",
  message = "",
  fullScreen = false,
  variant = "default",
}) => {
  // Tamanho do spinner
  const sizeClasses = {
    sm: "w-8 h-8 border-2",
    md: "w-12 h-12 border-4",
    lg: "w-16 h-16 border-4",
    xl: "w-20 h-20 border-4",
  };

  // Variantes de cor
  const variantClasses = {
    default: "border-blue-200 border-t-blue-500",
    success: "border-green-200 border-t-green-500",
    warning: "border-yellow-200 border-t-yellow-500",
    error: "border-red-200 border-t-red-500",
    light: "border-gray-200 border-t-gray-400",
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Spinner */}
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${variantClasses[variant]}`}
        role="status"
        aria-label="Carregando"
      >
        <span className="sr-only">Carregando...</span>
      </div>

      {/* Message */}
      {message && (
        <p className="text-gray-600 text-sm font-medium text-center">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-12">
      {spinnerContent}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
  variant: PropTypes.oneOf(["default", "success", "warning", "error", "light"]),
};

/**
 * Skeleton Loader - para loading state mais elegante
 * Simula layout enquanto carrega
 */
export const SkeletonLoader = ({ count = 3, height = "h-4" }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`${height} bg-gray-200 rounded animate-pulse`} />
    ))}
  </div>
);

SkeletonLoader.propTypes = {
  count: PropTypes.number,
  height: PropTypes.string,
};

/**
 * Pulse Animation - para skeleton screens
 */
export const PulseLoader = () => (
  <div className="space-y-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
    ))}
  </div>
);

export default LoadingSpinner;
