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
                  to={
                    user.role === "teacher"
                      ? "/teacher/dashboard"
                      : "/student/scenarios"
                  }
                >
                  Painel
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" to="/login">
                  Entrar
                </Button>
                <Button variant="primary" to="/register">
                  Criar Conta
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
            Aprenda sobre Cyberbullying e Discriminação
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
            Uma experiência imersiva em sala de fuga projetada para educar
            alunos sobre os impactos e soluções para o bullying na era digital.
          </p>
        </div>

        <div className="flex gap-4 justify-center mb-16">
          {!user && (
            <>
              <Button to="/register" size="lg">
                Comece a Aprender
              </Button>
              <Button to="/login" variant="secondary" size="lg">
                Já é Membro
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[var(--bg-secondary)] py-16">
        <div className="container-main">
          <h2 className="text-3xl font-bold text-center mb-12">
            Como Funciona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="w-8 h-8" />,
                title: "Narrativas Envolventes",
                description:
                  "Cenários imersivos que exploram situações reais de bullying e suas consequências.",
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Puzzles Interativos",
                description:
                  "Resolva puzzles desafiadores enquanto toma decisões éticas que importam.",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Acompanhe o Progresso",
                description:
                  "Ganhe crachás e compita no ranking com seus colegas.",
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
        <h2 className="text-3xl font-bold mb-4">
          Pronto para Fazer a Diferença?
        </h2>
        <p className="text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
          Junte-se a estudantes de todo o mundo para aprender sobre empatia,
          responsabilidade digital e se opor ao bullying.
        </p>
        {!user && (
          <Button to="/register" size="lg">
            Comece Agora
          </Button>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-[var(--bg-secondary)] border-t border-[var(--bg-tertiary)] py-8 text-center text-[var(--text-secondary)]">
        <p>
          &copy; 2024 Escape Room Digital. Plataforma Educacional para
          Consciência sobre Bullying.
        </p>
      </footer>
    </div>
  );
}
