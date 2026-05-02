/**
 * Teacher Dashboard - Class rankings and progress overview
 */
import { useState, useEffect } from "react";
import {
  Card,
  StatsCard,
  LoadingSpinner,
  Button,
  EmptyState,
} from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { useTeacher, useGamification } from "@/hooks/useAPI";
import { Download, RefreshCw } from "lucide-react";

export default function TeacherDashboard() {
  const { state: teacherState, getDashboard, exportClassReport } = useTeacher();
  const { state: gamificationState, getLeaderboard } = useGamification();
  const user = useAuthStore((state) => state.user);

  const [dashboardData, setDashboardData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching dashboard for teacher:", user);
        const dashboard = await getDashboard(user.id, user.school);
        setDashboardData(dashboard);

        const leaders = await getLeaderboard();
        setLeaderboard(leaders.students || []);
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportClassReport();
    } catch (error) {
      console.error("Failed to export:", error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard da Turma</h1>
          <p className="text-[var(--text-secondary)]">
            {user.school} • {dashboardData?.dashboard.totalStudents} Alunos
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => window.location.reload()}
            variant="secondary"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport} disabled={exporting} size="sm">
            <Download className="w-4 h-4 mr-2" />
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          icon="👥"
          label="Total de Alunos"
          value={dashboardData?.dashboard.totalStudents || 0}
        />
        <StatsCard
          icon="🎮"
          label="Cenarios Iniciados"
          value={dashboardData?.dashboard.analytics[0].total_sessions || 0}
        />
        <StatsCard
          icon="✅"
          label="Percentagem de Conclusão"
          value={`${dashboardData?.dashboard.analytics[0].completion_rate || 0}%`}
        />
        <StatsCard
          icon="📈"
          label="Pontuação Média"
          value={dashboardData?.dashboard.analytics[0].avg_empathy_score || 0}
        />
      </div>

      {/* Leaderboard */}
      <Card>
        <h2 className="text-2xl font-bold mb-6">Classificações da Turma</h2>

        {leaderboard.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="Ainda não há alunos classificados"
            description="Alunos vão aparecer aqui à medida que completam cenários e ganham pontos."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--bg-tertiary)]">
                  <th className="text-left py-3 font-semibold text-[var(--text-secondary)]">
                    Ranque
                  </th>
                  <th className="text-left py-3 font-semibold text-[var(--text-secondary)]">
                    Aluno
                  </th>
                  <th className="text-center py-3 font-semibold text-[var(--text-secondary)]">
                    Pontos
                  </th>
                  <th className="text-center py-3 font-semibold text-[var(--text-secondary)]">
                    Crachás
                  </th>
                  <th className="text-center py-3 font-semibold text-[var(--text-secondary)]">
                    Completos
                  </th>
                  <th className="text-right py-3 font-semibold text-[var(--text-secondary)]">
                    Progresso
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((student, index) => (
                  <tr
                    key={student.id}
                    className="border-b border-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <td className="py-3">
                      <span className="font-bold text-lg">
                        {index === 0
                          ? "🥇"
                          : index === 1
                            ? "🥈"
                            : index === 2
                              ? "🥉"
                              : index + 1}
                      </span>
                    </td>
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-[var(--text-secondary)]">
                          {student.grade}
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3">
                      <span className="font-bold text-[var(--accent-blue)]">
                        {student.points}
                      </span>
                    </td>
                    <td className="text-center py-3">{student.badgesCount}</td>
                    <td className="text-center py-3">
                      {student.scenariosCompleted}/2
                    </td>
                    <td className="text-right py-3">
                      <div className="w-24 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--accent-blue)]"
                          style={{
                            width: `${(student.scenariosCompleted / 2) * 100}%`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-2xl font-bold mb-6">Atividade Recente</h2>

        <div className="space-y-3">
          {dashboardData?.recentActivity?.map((activity, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2 border-b border-[var(--bg-tertiary)] last:border-0"
            >
              <span className="text-2xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="font-medium">{activity.description}</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          )) || (
            <p className="text-[var(--text-secondary)]">
              Não há atividade recente
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
