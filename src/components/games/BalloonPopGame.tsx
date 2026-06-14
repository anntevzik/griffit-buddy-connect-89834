import { useEffect, useState } from "react";
import { useGameSession } from "./gameSession";

const COLORS = [
  { name: "Red", cls: "bg-red-500" },
  { name: "Blue", cls: "bg-blue-500" },
  { name: "Green", cls: "bg-green-500" },
  { name: "Yellow", cls: "bg-yellow-400" },
  { name: "Purple", cls: "bg-purple-500" },
  { name: "Pink", cls: "bg-pink-500" },
];

const BalloonPopGame = () => {
  const { reportMistake } = useGameSession();
  const [target, setTarget] = useState(COLORS[0]);
  const [grid, setGrid] = useState<typeof COLORS>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const newRound = (lvl: number) => {
    const count = Math.min(4 + lvl, 12);
    const t = COLORS[Math.floor(Math.random() * COLORS.length)];
    const g = Array.from({ length: count }, () => COLORS[Math.floor(Math.random() * COLORS.length)]);
    if (!g.includes(t)) g[Math.floor(Math.random() * g.length)] = t;
    setTarget(t);
    setGrid(g);
  };

  useEffect(() => { newRound(1); }, []);

  const pop = (c: typeof COLORS[number], i: number) => {
    if (c.name === target.name) {
      setGrid((g) => g.filter((_, idx) => idx !== i));
      if (grid.filter((x) => x.name === target.name).length <= 1) {
        setScore((s) => s + 1);
        const next = level + 1;
        setLevel(next);
        setTimeout(() => newRound(next), 400);
      }
    } else {
      reportMistake();
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center font-semibold">Score: {score} · Level {level}</div>
      <p className="text-center text-lg">Pop all <span className="font-bold">{target.name}</span> balloons!</p>
      <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
        {grid.map((c, i) => (
          <button
            key={i}
            onClick={() => pop(c, i)}
            className={`${c.cls} h-20 rounded-full shadow-lg hover:scale-110 transition-transform`}
            aria-label={c.name}
          />
        ))}
      </div>
    </div>
  );
};

export default BalloonPopGame;