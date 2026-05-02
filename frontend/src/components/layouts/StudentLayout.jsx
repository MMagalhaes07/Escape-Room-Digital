/**
 * Layout Components for Students
 */
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/store/authStore";
import { LogOut, Moon, Sun, BookOpen, Home, Trophy, User } from "lucide-react";

export const StudentLayout = () => {
  const { isDark, toggleTheme } = useTheme();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/student/scenarios", label: "Scenarios", icon: Home },
    { path: "/student/badges", label: "Badges", icon: Trophy },
    { path: "/student/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Top Navigation */}
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--bg-tertiary)] sticky top-0 z-50">
        <div className="container-main flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3 py-4">
            <BookOpen className="w-6 h-6 text-[var(--accent-blue)]" />
            <span className="font-bold text-lg">Escape Room</span>
          </div>

          {/* Center Navigation */}
          <nav className="flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-2 text-sm font-medium hover:text-[var(--accent-blue)] transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-primary)] rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[var(--accent-blue)] flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0) || "S"}
              </div>
              <div className="text-sm">
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Student
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-500"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-main">
        <Outlet />
      </main>
    </div>
  );
};
