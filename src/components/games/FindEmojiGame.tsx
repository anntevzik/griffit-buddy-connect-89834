import { useEffect, useState } from "react";
import { useGameSession } from "./gameSession";

const SETS: [string, string[]][] = [
  ["🐶", ["🐱", "🐰", "🐻", "🐼", "🦊"]],
  ["🍎", ["🍊", "🍌", "🍇", "🍉", "🍓"]],
  ["⭐", ["🌙", "☀️", "☁️", "⚡", "❄️"]],
  ["🚗", ["🚕", "🚙", "🚌", "🚓", "🚑"]],
  ["⚽", ["🏀", "🏈", "🎾", "🏐", "🎱"]],
];

const FindEmojiGame = () => {
  const { reportMistake } = useGameSession();
  const [target, setTarget] = useState("🐶");
  const [grid, setGrid] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const newRound = (lvl: number) => {
    const [t, others] = SETS[Math.floor(Math.random() * SETS.length)];
    const size = Math.min(8 + lvl * 2, 24);
    const arr: string[] = Array.from({ length: size }, () => others[Math.floor(Math.random() * others.length)]);
    arr[Math.floor(Math.random() * size)] = t;
    setTarget(t);
    setGrid(arr);
  };

  useEffect(() => { newRound(1); }, []);

  const tap = (e: string) => {
    if (e === target) {
      setScore((s) => s + 1);
      const next = level + 1;
      setLevel(next);
      newRound(next);
    } else {
      reportMistake();
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center font-semibold">Score: {score} · Level {level}</div>
      <p className="text-center text-lg">Find the <span className="text-3xl">{target}</span></p>
      <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
        {grid.map((e, i) => (
          <button key={i} onClick={() => tap(e)} className="h-12 text-2xl hover:bg-accent rounded-lg">
            {e}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FindEmojiGame;