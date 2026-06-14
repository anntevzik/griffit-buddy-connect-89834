import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const EMOJIS = ["🍎", "⭐", "🐶", "🌸", "🎈", "🦋", "🍓", "🐠"];

const CountingGame = () => {
  const [emoji, setEmoji] = useState("🍎");
  const [count, setCount] = useState(3);
  const [options, setOptions] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);

  const newRound = () => {
    const n = Math.floor(Math.random() * 9) + 1;
    const e = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const opts = new Set<number>([n]);
    while (opts.size < 3) {
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
      setTimeout(newRound, 900);
    } else {
      setFeedback("wrong");
    }
  };

  return (
    <div className="space-y-6 text-center">
      <p className="text-lg font-semibold">Score: {score}</p>
      <p className="text-xl">How many do you see?</p>
      <div className="bg-white/60 rounded-xl p-6 min-h-32 flex flex-wrap justify-center gap-2 text-4xl">
        {Array.from({ length: count }).map((_, i) => (
          <span key={i}>{emoji}</span>
        ))}
      </div>
      <div className="flex gap-3 justify-center">
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