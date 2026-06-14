import { useEffect, useRef, useState } from "react";
import { useGameSession } from "./gameSession";

interface Star { id: number; x: number; y: number; bad: boolean; }

const CatchStarsGame = () => {
  const { reportMistake } = useGameSession();
  const [stars, setStars] = useState<Star[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const idRef = useRef(0);

  useEffect(() => {
    const spawn = setInterval(() => {
      setStars((s) => [
        ...s,
        { id: ++idRef.current, x: Math.random() * 85, y: -5, bad: Math.random() < 0.25 },
      ]);
    }, Math.max(900 - level * 40, 400));
    return () => clearInterval(spawn);
  }, [level]);

  useEffect(() => {
    const fall = setInterval(() => {
      setStars((s) =>
        s
          .map((st) => ({ ...st, y: st.y + 2 + level * 0.15 }))
          .filter((st) => st.y < 100)
      );
    }, 60);
    return () => clearInterval(fall);
  }, [level]);

  const tap = (s: Star) => {
    setStars((arr) => arr.filter((x) => x.id !== s.id));
    if (s.bad) {
      reportMistake();
    } else {
      setScore((v) => v + 1);
      setLevel((l) => l + 1);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-center font-semibold">Score: {score} · Level {level}</div>
      <p className="text-center text-sm text-muted-foreground">Tap ⭐ stars · avoid 💣 bombs</p>
      <div className="relative w-full max-w-md mx-auto h-80 rounded-2xl bg-gradient-to-b from-indigo-900/40 to-indigo-500/20 overflow-hidden">
        {stars.map((s) => (
          <button
            key={s.id}
            onClick={() => tap(s)}
            className="absolute text-3xl"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
          >
            {s.bad ? "💣" : "⭐"}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CatchStarsGame;