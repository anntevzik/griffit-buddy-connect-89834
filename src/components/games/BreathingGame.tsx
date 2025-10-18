import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wind } from "lucide-react";

const BreathingGame = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [count, setCount] = useState(4);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev > 1) return prev - 1;
        
        setPhase((currentPhase) => {
          if (currentPhase === "inhale") return "hold";
          if (currentPhase === "hold") return "exhale";
          return "inhale";
        });
        return 4;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const getPhaseText = () => {
    switch (phase) {
      case "inhale": return "Breathe In ✨";
      case "hold": return "Hold 💙";
      case "exhale": return "Breathe Out 🌊";
    }
  };

  const getCircleScale = () => {
    if (!isActive) return "scale-100";
    switch (phase) {
      case "inhale": return "scale-150";
      case "hold": return "scale-150";
      case "exhale": return "scale-100";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-8">
      <div className="relative">
        <div
          className={`
            w-48 h-48 rounded-full bg-gradient-to-br from-primary to-secondary
            transition-transform duration-4000 ease-in-out
            ${getCircleScale()}
          `}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <p className="text-2xl font-bold mb-2">{getPhaseText()}</p>
            {isActive && <p className="text-4xl font-bold">{count}</p>}
          </div>
        </div>
      </div>

      <Button
        onClick={() => setIsActive(!isActive)}
        size="lg"
        className="min-w-[200px]"
      >
        <Wind className="w-5 h-5 mr-2" />
        {isActive ? "Stop" : "Start Breathing"}
      </Button>

      <p className="text-center text-muted-foreground max-w-xs">
        Follow the circle as it grows and shrinks. Breathe in as it grows, hold when it's big, and breathe out as it shrinks.
      </p>
    </div>
  );
};

export default BreathingGame;
