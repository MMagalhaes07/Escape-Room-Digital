/**
 * Student Profile Page
 */
import { useState, useEffect } from "react";
import { Card, Button, Input, LoadingSpinner, Alert } from "@/components/ui";
import { useAuthStore } from "@/store/authStore";
import { useGamification } from "@/hooks/useAPI";

export default function StudentProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const { state: gamificationState, getUserProfile } = useGamification();

  const [formData, setFormData] = useState({ name: "", email: "" });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user) {
          setFormData({ name: user.name, email: user.email });
          const profileData = await getUserProfile(user.id);
          setStats(profileData);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(user.id, formData);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setSaving(false);
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
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">O meu perfil</h1>

      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Avatar Card */}
        <Card className="text-center md:col-span-1">
          <div className="w-24 h-24 rounded-full bg-[var(--accent-blue)] text-white text-4xl font-bold flex items-center justify-center mx-auto mb-4">
            {user?.name?.charAt(0) || "S"}
          </div>
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-[var(--text-secondary)] text-sm">{user?.email}</p>
        </Card>

        {/* Stats Cards */}
        {stats && (
          <>
            <Card className="flex flex-col justify-center text-center">
              <div className="text-3xl font-bold text-[var(--accent-blue)]">
                {stats.profile.points}
              </div>
              <p className="text-[var(--text-secondary)]">Pontos</p>
            </Card>

            <Card className="flex flex-col justify-center text-center">
              <div className="text-3xl font-bold text-green-500">
                {stats.badges.length}
              </div>
              <p className="text-[var(--text-secondary)]">Crachás</p>
            </Card>
          </>
        )}
      </div>

      {/* Edit Profile Form */}
      <Card>
        <h3 className="text-xl font-bold mb-6">Editar Perfil</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome Completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <div className="pt-4 flex gap-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Gravando..." : "Gravar Alterações"}
            </Button>
            <Button type="button" variant="secondary">
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
