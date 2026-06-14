import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGameSession } from "./gameSession";

const MathGame = () => {
  const [level, setLevel] = useState(1);
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const [op, setOp] = useState<"+" | "-">("+");
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const { reportMistake } = useGameSession();

  const newRound = (lvl: number) => {
    const max = Math.min(5 + lvl * 3, 50);
    const useSub = lvl >= 3 && Math.random() > 0.5;
    const x = Math.floor(Math.random() * max) + 1;
    const y = Math.floor(Math.random() * max) + 1;
    const aa = useSub ? Math.max(x, y) : x;
    const bb = useSub ? Math.min(x, y) : y;
    setA(aa);
    setB(bb);
    setOp(useSub ? "-" : "+");
    const answer = useSub ? aa - bb : aa + bb;
    const opts = new Set<number>([answer]);
    while (opts.size < 4) {
      opts.add(Math.max(0, answer + Math.floor(Math.random() * 7) - 3));
    }
    setOptions([...opts].sort(() => Math.random() - 0.5));
    setFeedback(null);
  };

  useEffect(() => {
    newRound(level);
  }, []);

  const answer = op === "+" ? a + b : a - b;

  const pick = (n: number) => {
    if (n === answer) {
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

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-between px-2">
        <p className="text-sm font-semibold">Level: {level}</p>
        <p className="text-sm font-semibold">Score: {score}</p>
      </div>
      <p className="text-5xl font-bold">{a} {op} {b} = ?</p>
      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        {options.map((o) => (
          <Button key={o} onClick={() => pick(o)} size="lg" className="text-2xl h-16">
            {o}
          </Button>
        ))}
      </div>
      {feedback === "correct" && <p className="text-2xl text-green-600 font-bold">Correct! 🎉</p>}
      {feedback === "wrong" && <p className="text-xl text-orange-500">Try again! 💪</p>}
    </div>
  );
};

export default MathGame;