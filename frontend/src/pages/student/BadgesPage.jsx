/**
 * Badges Page - Student achievements and badges
 */
import { useState, useEffect } from "react";
import { Card, LoadingSpinner, EmptyState } from "@/components/ui";
import { useGamification } from "@/hooks/useAPI";
import { useAuthStore } from "@/store/authStore";

export default function BadgesPage() {
  const user = useAuthStore((state) => state.user);
  const { state: gamificationState, getAvailableBadges } = useGamification();
  const [userBadges, setUserBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const badges = await getAvailableBadges();
        setAllBadges(badges);

        // Mock user badges - in production fetch from user profile
        setUserBadges(badges.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch badges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const earnedBadgeIds = userBadges.map((b) => b.id);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Your Badges</h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Collect badges by completing scenarios and making ethical choices
      </p>

      {/* Earned Badges */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">
          Earned ({userBadges.length})
        </h2>
        {userBadges.length === 0 ? (
          <EmptyState
            icon="🎖️"
            title="No Badges Yet"
            description="Complete scenarios to earn your first badge!"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {userBadges.map((badge) => (
              <Card key={badge.id} className="text-center p-4">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className="font-bold text-sm mb-1">{badge.name}</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {badge.description}
                </p>
                <div className="mt-3 text-xs text-[var(--accent-blue)]">
                  ✓ Earned
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Available Badges */}
      <div>
        <h2 className="text-2xl font-bold mb-6">All Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeIds.includes(badge.id);
            return (
              <Card
                key={badge.id}
                className={`text-center p-4 opacity-${isEarned ? "100" : "50"}`}
              >
                <div className={`text-4xl mb-2 ${isEarned ? "" : "grayscale"}`}>
                  {badge.icon}
                </div>
                <h3 className="font-bold text-sm mb-1">{badge.name}</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {badge.description}
                </p>
                <div className="mt-3 text-xs">
                  {isEarned ? (
                    <span className="text-green-500">✓ Earned</span>
                  ) : (
                    <span className="text-[var(--text-secondary)]">
                      🔒 Locked
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
