/**
 * Main App Component
 */
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppRoutes } from "@/routes/AppRoutes";

export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}
