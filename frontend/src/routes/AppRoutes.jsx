/**
 * Router Configuration
 */
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TeacherLayout } from "@/components/layouts/TeacherLayout";
import { StudentLayout } from "@/components/layouts/StudentLayout";

// Auth Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

// Teacher Pages
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import StudentListPage from "@/pages/teacher/StudentListPage";
import TeacherProfilePage from "@/pages/teacher/TeacherProfilePage";

// Student Pages
import ScenarioSelectPage from "@/pages/student/ScenarioSelectPage";
import BadgesPage from "@/pages/student/BadgesPage";
import StudentProfilePage from "@/pages/student/StudentProfilePage";
import GamePlayPage from "@/pages/student/GamePlayPage";

// Public Pages
import HomePage from "@/pages/public/HomePage";

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Teacher Routes */}
        <Route
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/students" element={<StudentListPage />} />
          <Route path="/teacher/profile" element={<TeacherProfilePage />} />
        </Route>

        {/* Student Routes */}
        <Route
          element={
            <ProtectedRoute requiredRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/student/scenarios" element={<ScenarioSelectPage />} />
          <Route path="/student/play/:scenarioId" element={<GamePlayPage />} />
          <Route path="/student/badges" element={<BadgesPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};
