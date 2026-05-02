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
    { value: "7", label: "7th Grade" },
    { value: "8", label: "8th Grade" },
    { value: "9", label: "9th Grade" },
    { value: "10", label: "10th Grade" },
    { value: "11", label: "11th Grade" },
    { value: "12", label: "12th Grade" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">✨</div>
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-[var(--text-secondary)]">
            Join the digital escape room
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
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />

            <Select
              label="I am a..."
              options={[
                { value: "student", label: "Student" },
                { value: "teacher", label: "Teacher" },
              ]}
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              required
            />

            {formData.role === "student" && (
              <Select
                label="Grade"
                options={gradeOptions}
                value={formData.grade}
                onChange={(e) =>
                  setFormData({ ...formData, grade: e.target.value })
                }
                required
              />
            )}

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />

            <Input
              label="Confirm Password"
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
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[var(--accent-blue)] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
