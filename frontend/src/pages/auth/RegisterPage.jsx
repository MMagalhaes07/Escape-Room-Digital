/**
 * Register Page
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Input, Button, Alert, Select, LoadingSpinner } from "@/components/ui";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "student",
    grade: "",
  });
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();
  const { register, error, isLoading } = useAuthStore((state) => ({
    register: state.register,
    error: state.error,
    isLoading: state.isLoading,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      setLocalError("Passwords do not match");
      return;
    }

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        grade: formData.grade || undefined,
      });

      // Redirect based on role
      if (response.user.role === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/scenarios");
      }
    } catch (err) {
      setLocalError(err.response?.data?.message || "Registration failed");
    }
  };

  const gradeOptions = [
    { value: "7", label: "7º Ano" },
    { value: "8", label: "8º Ano" },
    { value: "9", label: "9º Ano" },
    { value: "10", label: "10º Ano" },
    { value: "11", label: "11º Ano" },
    { value: "12", label: "12º Ano" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">✨</div>
          <h1 className="text-3xl font-bold mb-2">Criar Conta</h1>
          <p className="text-[var(--text-secondary)]">
            Junte-se à sala de fuga digital
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
              label="Nome Completo"
              type="text"
              placeholder="Seu Nome"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

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

            <Select
              label="Sou um/a..."
              options={[
                { value: "student", label: "Aluno/a" },
                { value: "teacher", label: "Professor/a" },
              ]}
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              required
            />

            {formData.role === "student" && (
              <Select
                label="Série"
                options={gradeOptions}
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                required
              />
            )}

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

            <Input
              label="Confirmar Palavra-passe"
              type="password"
              placeholder="••••••••"
              value={formData.passwordConfirm}
              onChange={(e) =>
                setFormData({ ...formData, passwordConfirm: e.target.value })
              }
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : "Create Account"}
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              Já tem uma conta?{" "}
              <Link
                to="/login"
                className="text-[var(--accent-blue)] hover:underline"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
