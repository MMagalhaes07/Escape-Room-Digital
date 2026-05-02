/**
 * Badges Page - Student achievements and badges
 * Fetches earned badges from user profile and all available badges, displays with lock icons
 */
import { useState, useEffect } from "react";
import { Card, LoadingSpinner, EmptyState } from "@/components/ui";
import { useGamification } from "@/hooks/useAPI";
import { useAuthStore } from "@/store/authStore";
import { Lock } from "lucide-react";

export default function BadgesPage() {
  const user = useAuthStore((state) => state.user);
  const {
    state: gamificationState,
    getUserProfile,
    getAvailableBadges,
  } = useGamification();
  const [userBadges, setUserBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        // Fetch all available badges
        const allBadgesData = await getAvailableBadges();
        setAllBadges(allBadgesData.badges);

        // Fetch user's earned badges from profile
        if (user?.id) {
          const userProfile = await getUserProfile(user.id);

          // Build a Set of earned badge IDs for O(1) lookup
          const earnedBadgeIds = new Set(
            userProfile.badges?.map((b) => b.badge_id) || [],
          );

          // Filter from the badges array inside the response object
          const earnedBadges = allBadgesData.badges.filter((badge) =>
            earnedBadgeIds.has(badge.id),
          );

          setUserBadges(earnedBadges);
        }
      } catch (err) {
        console.error("Failed to fetch badges:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 mb-4">Erro ao carregar crachás: {error}</p>
      </div>
    );
  }

  const earnedBadgeIds = userBadges.map((b) => b.id);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Seus Crachás</h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Colete crachás completando cenários e fazendo escolhas éticas
      </p>

      {/* Earned Badges */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">
          Conquistados ({userBadges.length})
        </h2>
        {userBadges.length === 0 ? (
          <EmptyState
            icon="🎖️"
            title="Nenhum Crachá Ainda"
            description="Complete cenários para ganhar seu primeiro crachá!"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {userBadges.map((badge) => (
              <Card key={badge.id} className="text-center p-4 relative">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className="font-bold text-sm mb-1">{badge.name}</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {badge.description}
                </p>
                <div className="mt-3 text-xs text-[var(--accent-blue)]">
                  ✓ Conquistado
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Available Badges */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Todos os Crachás</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeIds.includes(badge.id);
            return (
              <Card
                key={badge.id}
                className={`text-center p-4 relative transition-opacity ${isEarned ? "opacity-100" : "opacity-60 hover:opacity-80"}`}
              >
                <div className={`text-4xl mb-2 ${isEarned ? "" : "grayscale"}`}>
                  {badge.icon}
                </div>
                {!isEarned && (
                  <div className="absolute top-2 right-2 text-red-500">
                    <Lock className="w-5 h-5" />
                  </div>
                )}
                <h3 className="font-bold text-sm mb-1">{badge.name}</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {badge.description}
                </p>
                <div className="mt-3 text-xs">
                  {isEarned ? (
                    <span className="text-green-500">✓ Conquistado</span>
                  ) : (
                    <span className="text-[var(--text-secondary)]">
                      Bloqueado
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
