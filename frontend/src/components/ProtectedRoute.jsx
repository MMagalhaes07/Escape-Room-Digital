/**
 * Protected Route - Wraps routes that require authentication
 */
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};
