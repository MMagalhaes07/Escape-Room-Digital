/**
 * Scenario Select Page - Students choose which escape room to play
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, EmptyState, LoadingSpinner } from "@/components/ui";
import { Lock, Play } from "lucide-react";

export default function ScenarioSelectPage() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data - In production, fetch from API
    setTimeout(() => {
      setScenarios([
        {
          id: "scenario_1",
          title: "Echo: The School Bullying",
          description:
            "Navigate through a school setting where bullying incidents unfold. Make choices that matter and discover the power of empathy.",
          difficulty: "Beginner",
          duration: "15-20 min",
          scenes: 16,
          locked: false,
          image: "🏫",
        },
        {
          id: "scenario_2",
          title: "Clout: The Cruelty of Cyberbullying",
          description:
            "Explore the digital world and face the harsh reality of cyberbullying. Learn how words online can have real-world consequences.",
          difficulty: "Intermediate",
          duration: "20-25 min",
          scenes: 18,
          locked: false,
          image: "💬",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handlePlay = (scenarioId) => {
    navigate(`/student/play/${scenarioId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <EmptyState
        icon="🎮"
        title="No Scenarios Available"
        description="Check back soon for more escape room scenarios."
      />
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Choose Your Challenge</h1>
      <p className="text-[var(--text-secondary)] mb-8">
        Select a scenario to begin your escape room experience
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario) => (
          <Card key={scenario.id} className="flex flex-col">
            {/* Scenario Image */}
            <div className="text-6xl mb-4">{scenario.image}</div>

            {/* Content */}
            <h2 className="text-2xl font-bold mb-2">{scenario.title}</h2>
            <p className="text-[var(--text-secondary)] mb-4 flex-1">
              {scenario.description}
            </p>

            {/* Metadata */}
            <div className="grid grid-cols-3 gap-2 mb-6 text-sm py-4 border-y border-[var(--bg-tertiary)]">
              <div>
                <div className="text-[var(--text-secondary)]">Difficulty</div>
                <div className="font-medium">{scenario.difficulty}</div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)]">Duration</div>
                <div className="font-medium">{scenario.duration}</div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)]">Scenes</div>
                <div className="font-medium">{scenario.scenes}</div>
              </div>
            </div>

            {/* Action */}
            <Button
              onClick={() => handlePlay(scenario.id)}
              disabled={scenario.locked}
              className="w-full"
              variant={scenario.locked ? "secondary" : "primary"}
            >
              {scenario.locked ? (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Locked
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Scenario
                </>
              )}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
