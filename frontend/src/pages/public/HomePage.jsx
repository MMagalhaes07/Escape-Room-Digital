/**
 * Home Page
 */
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui";
import { BookOpen, Users, Zap } from "lucide-react";

export default function HomePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Navigation */}
      <nav className="bg-[var(--bg-secondary)] border-b border-[var(--bg-tertiary)]">
        <div className="container-main flex justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[var(--accent-blue)]" />
            <span className="font-bold text-lg">Escape Room Digital</span>
          </div>
          <div className="flex gap-4">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  as={Link}
                  to={
                    user.role === "teacher"
                      ? "/teacher/dashboard"
                      : "/student/scenarios"
                  }
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" as={Link} to="/login">
                  Login
                </Button>
                <Button variant="primary" as={Link} to="/register">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-main text-center py-20">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4 gradient-text">
            Learn About Bullying & Cyberbullying
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
            An interactive escape room experience designed to educate students
            about the impacts and solutions to bullying in the digital age.
          </p>
        </div>

        <div className="flex gap-4 justify-center mb-16">
          {!user && (
            <>
              <Button as={Link} to="/register" size="lg">
                Start Learning
              </Button>
              <Button as={Link} to="/login" variant="secondary" size="lg">
                Already a Member
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[var(--bg-secondary)] py-16">
        <div className="container-main">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="w-8 h-8" />,
                title: "Engaging Narratives",
                description:
                  "Immersive scenarios that explore real bullying situations and their consequences.",
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Interactive Puzzles",
                description:
                  "Solve challenging puzzles while making ethical decisions that matter.",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Track Progress",
                description:
                  "Earn badges and compete on the leaderboard with your classmates.",
              },
            ].map((feature, i) => (
              <div key={i} className="card text-center">
                <div className="text-[var(--accent-blue)] mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-main py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
          Join students worldwide in learning about empathy, digital
          responsibility, and standing up against bullying.
        </p>
        {!user && (
          <Button as={Link} to="/register" size="lg">
            Get Started Now
          </Button>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-[var(--bg-secondary)] border-t border-[var(--bg-tertiary)] py-8 text-center text-[var(--text-secondary)]">
        <p>
          &copy; 2024 Escape Room Digital. Educational Platform for Bullying
          Awareness.
        </p>
      </footer>
    </div>
  );
}
