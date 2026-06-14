import { useEffect, useState } from "react";
import { useGameSession } from "./gameSession";

const ReactionGame = () => {
  const { reportMistake } = useGameSession();
  const [phase, setPhase] = useState<"wait" | "go">("wait");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (phase === "wait") {
      const t = setTimeout(() => setPhase("go"), 800 + Math.random() * 2200);
      return () => clearTimeout(t);
    }
  }, [phase, score]);

  const tap = () => {
    if (phase === "go") {
      setScore((s) => s + 1);
      setLevel((l) => l + 1);
      setPhase("wait");
    } else {
      reportMistake();
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center font-semibold">Score: {score} · Level {level}</div>
      <button
        onClick={tap}
        className={`w-full max-w-md mx-auto h-64 rounded-3xl text-4xl font-bold text-white transition-colors ${
          phase === "go" ? "bg-green-500" : "bg-red-500"
        }`}
      >
        {phase === "go" ? "TAP NOW! ⚡" : "Wait for green…"}
      </button>
    </div>
  );
};

export default ReactionGame;