/**
 * Teacher Profile Page
 */
import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  LoadingSpinner,
  Alert,
  Select,
} from "@/components/ui";
import { useAuthStore } from "@/store/authStore";

export default function TeacherProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    grade: "",
    schoolName: "",
    bio: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Initialize form with user data
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        subject: user.subject || "",
        grade: user.grade || "",
        schoolName: user.schoolName || "",
        bio: user.bio || "",
      });
    }
    setLoading(false);
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
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {/* Profile Header */}
      <Card className="mb-8 text-center">
        <div className="w-24 h-24 rounded-full bg-[var(--accent-blue)] text-white text-4xl font-bold flex items-center justify-center mx-auto mb-4">
          {user?.name?.charAt(0) || "T"}
        </div>
        <h2 className="text-2xl font-bold mb-2">{user?.name}</h2>
        <p className="text-[var(--text-secondary)] mb-4">{user?.email}</p>
        <div className="inline-block px-4 py-2 bg-[var(--bg-tertiary)] rounded-full text-sm font-medium">
          🎓 Teacher Account
        </div>
      </Card>

      {/* Edit Profile Form */}
      <Card>
        <h3 className="text-xl font-bold mb-6">Edit Profile</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            <Select
              label="Subject"
              options={[
                { value: "english", label: "English" },
                { value: "math", label: "Mathematics" },
                { value: "science", label: "Science" },
                { value: "history", label: "History" },
                { value: "social", label: "Social Studies" },
                { value: "pe", label: "Physical Education" },
              ]}
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
            />

            <Select
              label="Grade Level"
              options={[
                { value: "7", label: "7th Grade" },
                { value: "8", label: "8th Grade" },
                { value: "9", label: "9th Grade" },
                { value: "10", label: "10th Grade" },
                { value: "11", label: "11th Grade" },
                { value: "12", label: "12th Grade" },
              ]}
              value={formData.grade}
              onChange={(e) =>
                setFormData({ ...formData, grade: e.target.value })
              }
            />
          </div>

          <Input
            label="School Name"
            value={formData.schoolName}
            onChange={(e) =>
              setFormData({ ...formData, schoolName: e.target.value })
            }
          />

          <div>
            <label className="text-sm font-medium block mb-2">Bio</label>
            <textarea
              className="input-field h-32 resize-none"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="pt-4 flex gap-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      {/* Account Settings */}
      <Card className="mt-8">
        <h3 className="text-xl font-bold mb-6">Account Settings</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[var(--bg-tertiary)]">
            <div>
              <h4 className="font-medium">Change Password</h4>
              <p className="text-sm text-[var(--text-secondary)]">
                Update your password regularly
              </p>
            </div>
            <Button variant="secondary" size="sm">
              Change
            </Button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[var(--bg-tertiary)]">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-[var(--text-secondary)]">
                Enhance your account security
              </p>
            </div>
            <Button variant="secondary" size="sm">
              Setup
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="font-medium">Connected Accounts</h4>
              <p className="text-sm text-[var(--text-secondary)]">
                Manage integrations
              </p>
            </div>
            <Button variant="secondary" size="sm">
              Manage
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="mt-8 border-red-500/50">
        <h3 className="text-xl font-bold mb-6 text-red-500">Danger Zone</h3>

        <div className="flex items-center justify-between py-3">
          <div>
            <h4 className="font-medium">Delete Account</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              Permanently delete your account and all associated data
            </p>
          </div>
          <Button variant="danger" size="sm">
            Delete
          </Button>
        </div>
      </Card>
    </div>
  );
}
