/**
 * Reusable UI Components
 */

// Loading Spinner
export const LoadingSpinner = ({ size = "md" }) => {
  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }[size];

  return (
    <div
      className={`${sizeClass} border-4 border-[var(--bg-tertiary)] border-t-[var(--accent-blue)] rounded-full animate-spin`}
    />
  );
};

// Card Component
export const Card = ({ children, className = "" }) => {
  return <div className={`card ${className}`}>{children}</div>;
};

// Button Component
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  ...props
}) => {
  const baseClass =
    "font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClass = {
    primary: "btn-primary focus:ring-[var(--accent-blue)]",
    secondary: "btn-secondary focus:ring-[var(--accent-blue)]",
    danger:
      "px-4 py-2 bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost:
      "px-4 py-2 hover:bg-[var(--bg-secondary)] focus:ring-[var(--accent-blue)]",
  }[variant];

  const sizeClass = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  }[size];

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Input Component
export const Input = ({ label, error, className = "", ...props }) => {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium block">{label}</label>}
      <input
        className={`input-field ${className} ${error ? "border-red-500 focus:ring-red-500/20" : ""}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

// Select Component
export const Select = ({
  label,
  options = [],
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium block">{label}</label>}
      <select
        className={`input-field ${className} ${error ? "border-red-500" : ""}`}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

// Alert Component
export const Alert = ({ type = "info", title, children, onClose }) => {
  const bgClass = {
    success:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  }[type];

  const borderClass = {
    success: "border-green-400",
    warning: "border-yellow-400",
    error: "border-red-400",
    info: "border-blue-400",
  }[type];

  return (
    <div className={`card border-l-4 ${borderClass} ${bgClass} relative`}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl leading-none opacity-70 hover:opacity-100"
        >
          ×
        </button>
      )}
      {title && <h3 className="font-bold mb-1">{title}</h3>}
      {children}
    </div>
  );
};

// Badge Component
export const Badge = ({ children, variant = "info", className = "" }) => {
  const variantClass = {
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
    info: "badge-info",
  }[variant];

  return <span className={`${variantClass} ${className}`}>{children}</span>;
};

// Modal Component
export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`${sizeClass} bg-[var(--bg-secondary)] rounded-lg shadow-xl border border-[var(--bg-tertiary)] p-6 max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-xl font-bold">{title}</h2>}
          <button
            onClick={onClose}
            className="text-2xl leading-none text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Empty State Component
export const EmptyState = ({ icon = "📭", title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-[var(--text-secondary)] mb-6">{description}</p>
      {action && action}
    </div>
  );
};

// Stats Card
export const StatsCard = ({ icon, label, value, trend }) => {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)] mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p
              className={
                trend > 0 ? "text-green-500 text-sm" : "text-red-500 text-sm"
              }
            >
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </Card>
  );
};
