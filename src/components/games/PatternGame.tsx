import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGameSession } from "./gameSession";

const PatternGame = () => {
  const [level, setLevel] = useState(1);
  const [series, setSeries] = useState<number[]>([]);
  const [answer, setAnswer] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const { reportMistake } = useGameSession();

  const newRound = (lvl: number) => {
    const len = Math.min(3 + Math.floor(lvl / 2), 6);
    const step = Math.floor(Math.random() * Math.min(1 + lvl, 5)) + 1;
    const start = Math.floor(Math.random() * 5) + 1;
    const arr = Array.from({ length: len }, (_, i) => start + i * step);
    const next = start + len * step;
    setSeries(arr);
    setAnswer(next);
    const opts = new Set<number>([next]);
    while (opts.size < 4) {
      opts.add(Math.max(0, next + Math.floor(Math.random() * 7) - 3));
    }
    setOptions([...opts].sort(() => Math.random() - 0.5));
    setFeedback(null);
  };

  useEffect(() => {
    newRound(level);
  }, []);

  const pick = (n: number) => {
    if (n === answer) {
      setScore((s) => s + 1);
      setFeedback("correct");
      const nxt = level + 1;
      setLevel(nxt);
      setTimeout(() => newRound(nxt), 700);
    } else {
      setFeedback("wrong");
      reportMistake();
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-between px-2">
        <p className="text-sm font-semibold">Level: {level}</p>
        <p className="text-sm font-semibold">Score: {score}</p>
      </div>
      <p className="text-xl font-bold">What comes next?</p>
      <p className="text-4xl font-bold tracking-wide">
        {series.join(", ")}, ?
      </p>
      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        {options.map((o) => (
          <Button key={o} onClick={() => pick(o)} size="lg" className="text-2xl h-16">
            {o}
          </Button>
        ))}
      </div>
      {feedback === "correct" && <p className="text-2xl text-green-600 font-bold">Smart! 🎉</p>}
      {feedback === "wrong" && <p className="text-xl text-orange-500">Try again! 💪</p>}
    </div>
  );
};

export default PatternGame;