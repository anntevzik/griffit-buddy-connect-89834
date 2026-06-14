import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGameSession } from "./gameSession";

const HOLES = 9;

const WhackMoleGame = () => {
  const { reportMistake } = useGameSession();
  const [mole, setMole] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const speed = Math.max(1400 - level * 120, 450);

  useEffect(() => {
    const id = setInterval(() => setMole(Math.floor(Math.random() * HOLES)), speed);
    return () => clearInterval(id);
  }, [speed]);

  const tap = (i: number) => {
    if (i === mole) {
      setScore((s) => s + 1);
      setLevel((l) => l + 1);
      setMole(-1);
    } else {
      reportMistake();
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center font-semibold">Score: {score} · Level {level}</div>
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
        {Array.from({ length: HOLES }).map((_, i) => (
          <Button
            key={i}
            onClick={() => tap(i)}
            className="h-24 text-4xl rounded-2xl bg-amber-700/20 hover:bg-amber-700/30 text-foreground"
            variant="ghost"
          >
            {i === mole ? "🐹" : "🕳️"}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default WhackMoleGame;