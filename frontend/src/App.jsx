/**
 * Main App Component
 *
 * Estrutura:
 * - ErrorBoundary: Captura erros não previstos
 * - ThemeProvider: Gerencia tema (light/dark)
 * - AppRoutes: Rotas da aplicação
 */
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppRoutes } from "@/routes/AppRoutes";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function App() {
  const handleErrorBoundaryError = (error, errorInfo, errorCount) => {
    // Logging de erros para serviço remoto (se disponível)
    console.error("ErrorBoundary Event:", {
      error: error.toString(),
      stack: errorInfo?.componentStack,
      count: errorCount,
      timestamp: new Date().toISOString(),
    });

    // Aqui você pode enviar para um serviço de error tracking
    // como Sentry, LogRocket, etc.
    // analytics.trackError(error, errorInfo, errorCount);
  };

  const handleErrorBoundaryReset = () => {
    // Opcional: fazer algo quando utilizador clica "Tentar Novamente"
    console.log("ErrorBoundary reset by user");
  };

  return (
    <ErrorBoundary
      onError={handleErrorBoundaryError}
      onReset={handleErrorBoundaryReset}
    >
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
