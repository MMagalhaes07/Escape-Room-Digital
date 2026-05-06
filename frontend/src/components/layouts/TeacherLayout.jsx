/**
 * Layout Components for Teachers
 */
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/store/authStore";
import { Menu, LogOut, Moon, Sun, BookOpen } from "lucide-react";
import { useState } from "react";

export const TeacherLayout = () => {
  const { isDark, toggleTheme } = useTheme();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/teacher/dashboard", label: "Classificações", icon: "📊" },
    { path: "/teacher/students", label: "Alunos", icon: "👥" },
    { path: "/teacher/profile", label: "Perfil", icon: "⚙️" },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-[var(--bg-secondary)] border-r border-[var(--bg-tertiary)] transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-[var(--bg-tertiary)]">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-[var(--accent-blue)]" />
            {sidebarOpen && (
              <span className="font-bold text-lg">EscapeRoom</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors group"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--bg-tertiary)] space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            {isDark ? (
              <>
                <Moon className="w-5 h-5" />
                {sidebarOpen && <span className="text-sm">Modo Escuro</span>}
              </>
            ) : (
              <>
                <Sun className="w-5 h-5" />
                {sidebarOpen && <span className="text-sm">Modo Claro</span>}
              </>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors text-red-500"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Sair</span>}
          </button>
        </div>

        {/* Toggle button */}
        <div className="p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-tertiary)] rounded-lg"
          >
            <Menu className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Menu</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div
          className={`bg-[var(--bg-secondary)] border-b border-[var(--bg-tertiary)] px-6 sticky top-0 z-10 ${sidebarOpen ? "py-2.5" : "py-2"}`}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--text-secondary)]">
                {user?.name}
              </span>
              <div className="w-10 h-10 rounded-full bg-[var(--accent-blue)] flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0) || "T"}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container-main">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
