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
import { useTeacher, useGamification } from "@/hooks/useAPI";
import { Download, RefreshCw } from "lucide-react";

export default function TeacherDashboard() {
  const { state: teacherState, getDashboard, exportClassReport } = useTeacher();
  const { state: gamificationState, getLeaderboard } = useGamification();

  const [dashboardData, setDashboardData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboard = await getDashboard();
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
          <h1 className="text-3xl font-bold mb-2">Class Dashboard</h1>
          <p className="text-[var(--text-secondary)]">
            {dashboardData?.className} • {dashboardData?.studentCount} Students
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
          label="Total Students"
          value={dashboardData?.studentCount || 0}
        />
        <StatsCard
          icon="🎮"
          label="Scenarios Started"
          value={dashboardData?.scenariosStarted || 0}
        />
        <StatsCard
          icon="✅"
          label="Completed"
          value={dashboardData?.scenariosCompleted || 0}
        />
        <StatsCard
          icon="📈"
          label="Avg. Score"
          value={`${dashboardData?.averageScore || 0}%`}
        />
      </div>

      {/* Leaderboard */}
      <Card>
        <h2 className="text-2xl font-bold mb-6">Class Leaderboard</h2>

        {leaderboard.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="No Students Yet"
            description="Students will appear here as they complete scenarios and earn points."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--bg-tertiary)]">
                  <th className="text-left py-3 font-semibold text-[var(--text-secondary)]">
                    Rank
                  </th>
                  <th className="text-left py-3 font-semibold text-[var(--text-secondary)]">
                    Student
                  </th>
                  <th className="text-center py-3 font-semibold text-[var(--text-secondary)]">
                    Points
                  </th>
                  <th className="text-center py-3 font-semibold text-[var(--text-secondary)]">
                    Badges
                  </th>
                  <th className="text-center py-3 font-semibold text-[var(--text-secondary)]">
                    Completed
                  </th>
                  <th className="text-right py-3 font-semibold text-[var(--text-secondary)]">
                    Progress
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
        <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>

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
            <p className="text-[var(--text-secondary)]">No recent activity</p>
          )}
        </div>
      </Card>
    </div>
  );
}
