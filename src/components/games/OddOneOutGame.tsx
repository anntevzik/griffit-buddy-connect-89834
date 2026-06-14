import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useGameSession } from "./gameSession";

const SETS = [
  ["🍎", "🍏"],
  ["🐶", "🐺"],
  ["⭐", "✨"],
  ["🌸", "🌷"],
  ["🐠", "🐟"],
  ["🚗", "🚙"],
  ["🎈", "🪀"],
  ["🍓", "🍒"],
];

const OddOneOutGame = () => {
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState<string[]>([]);
  const [oddIndex, setOddIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const { reportMistake } = useGameSession();

  const newRound = (lvl: number) => {
    const size = Math.min(4 + lvl, 16);
    const set = SETS[Math.floor(Math.random() * SETS.length)];
    const arr = Array(size).fill(set[0]);
    const idx = Math.floor(Math.random() * size);
    arr[idx] = set[1];
    setGrid(arr);
    setOddIndex(idx);
    setFeedback(null);
  };

  useEffect(() => {
    newRound(level);
  }, []);

  const pick = (i: number) => {
    if (i === oddIndex) {
      setScore((s) => s + 1);
      setFeedback("correct");
      const next = level + 1;
      setLevel(next);
      setTimeout(() => newRound(next), 700);
    } else {
      setFeedback("wrong");
      reportMistake();
    }
  };

  const cols = Math.min(4, Math.ceil(Math.sqrt(grid.length)));

  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-between px-2">
        <p className="text-sm font-semibold">Level: {level}</p>
        <p className="text-sm font-semibold">Score: {score}</p>
      </div>
      <p className="text-xl font-bold">Find the one that's different!</p>
      <div
        className="grid gap-2 max-w-md mx-auto"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {grid.map((e, i) => (
          <Card
            key={i}
            onClick={() => pick(i)}
            className="aspect-square flex items-center justify-center text-3xl cursor-pointer hover:scale-105 transition-transform bg-white/60"
          >
            {e}
          </Card>
        ))}
      </div>
      {feedback === "correct" && <p className="text-2xl text-green-600 font-bold">Sharp eyes! 🎉</p>}
      {feedback === "wrong" && <p className="text-xl text-orange-500">Look again! 💪</p>}
    </div>
  );
};

export default OddOneOutGame;