import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGameSession } from "./gameSession";

const EMOJIS = ["🍎", "⭐", "🐶", "🌸", "🎈", "🦋", "🍓", "🐠"];

const CountingGame = () => {
  const [emoji, setEmoji] = useState("🍎");
  const [count, setCount] = useState(3);
  const [options, setOptions] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const { reportMistake } = useGameSession();

  const newRound = (lvl = level) => {
    const max = Math.min(5 + lvl * 2, 25);
    const n = Math.floor(Math.random() * max) + 1;
    const e = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const optCount = Math.min(3 + Math.floor(lvl / 2), 5);
    const opts = new Set<number>([n]);
    while (opts.size < optCount) {
      opts.add(Math.max(1, n + (Math.floor(Math.random() * 5) - 2)));
    }
    setEmoji(e);
    setCount(n);
    setOptions([...opts].sort(() => Math.random() - 0.5));
    setFeedback(null);
  };

  useEffect(() => {
    newRound();
  }, []);

  const pick = (n: number) => {
    if (n === count) {
      setScore((s) => s + 1);
      setFeedback("correct");
      const next = level + 1;
      setLevel(next);
      setTimeout(() => newRound(next), 900);
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
      <p className="text-xl">How many do you see?</p>
      <div className="bg-white/60 rounded-xl p-6 min-h-32 flex flex-wrap justify-center gap-2 text-4xl">
        {Array.from({ length: count }).map((_, i) => (
          <span key={i}>{emoji}</span>
        ))}
      </div>
      <div className="flex gap-3 justify-center flex-wrap">
        {options.map((o) => (
          <Button key={o} onClick={() => pick(o)} size="lg" className="text-2xl w-16 h-16">
            {o}
          </Button>
        ))}
      </div>
      {feedback === "correct" && <p className="text-2xl text-green-600 font-bold">Correct! 🎉</p>}
      {feedback === "wrong" && <p className="text-xl text-orange-500">Try again! 💪</p>}
    </div>
  );
};

export default CountingGame;