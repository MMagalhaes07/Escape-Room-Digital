/**
 * Login Page
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Input, Button, Alert, LoadingSpinner } from "@/components/ui";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();
  const { login, error, isLoading } = useAuthStore((state) => ({
    login: state.login,
    error: state.error,
    isLoading: state.isLoading,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData.email, formData.password);
      // Redirect based on role
      if (response.user.role === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/scenarios");
      }
    } catch (err) {
      setLocalError(err.response?.data?.message || "Falha no login");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🔐</div>
          <h1 className="text-3xl font-bold mb-2">Escape Room Digital</h1>
          <p className="text-[var(--text-secondary)]">
            Consciência de Bullying & Cyberbullying
          </p>
        </div>

        {/* Form */}
        <div className="card space-y-6">
          {(error || localError) && (
            <Alert type="error" onClose={() => setLocalError("")}>
              {error || localError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />

            <Input
              label="Palavra-passe"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : "Entrar"}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Não tem uma conta?{" "}
              <Link
                to="/register"
                className="text-[var(--accent-blue)] hover:underline"
              >
                Registre-se
              </Link>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-100">
            <strong>Credenciais para demonstração:</strong>
            <br />
            Professor: professor.silva@escola.pt / teacher123
            <br />
            Aluno: joao.santos@email.pt / student123
          </p>
        </div>
      </div>
    </div>
  );
}
