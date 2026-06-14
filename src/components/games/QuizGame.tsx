import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGameSession } from "./gameSession";

export interface QuizRound {
  prompt: string;
  subPrompt?: string;
  options: string[];
  answerIndex: number;
}

interface QuizGameProps {
  generate: (level: number) => QuizRound;
}

const QuizGame = ({ generate }: QuizGameProps) => {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState<QuizRound | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const { reportMistake } = useGameSession();

  const next = (lvl: number) => {
    setRound(generate(lvl));
    setFeedback(null);
  };

  useEffect(() => {
    next(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (i: number) => {
    if (!round) return;
    if (i === round.answerIndex) {
      setScore((s) => s + 1);
      setFeedback("correct");
      const nl = level + 1;
      setLevel(nl);
      setTimeout(() => next(nl), 700);
    } else {
      setFeedback("wrong");
      reportMistake();
    }
  };

  const cols = useMemo(() => {
    if (!round) return 2;
    return round.options.length > 4 ? 3 : 2;
  }, [round]);

  if (!round) return null;

  return (
    <div className="space-y-5 text-center">
      <div className="flex justify-between px-2">
        <p className="text-sm font-semibold">Level: {level}</p>
        <p className="text-sm font-semibold">Score: {score}</p>
      </div>
      <p className="text-2xl font-bold whitespace-pre-wrap">{round.prompt}</p>
      {round.subPrompt && (
        <p className="text-4xl font-bold tracking-wide">{round.subPrompt}</p>
      )}
      <div
        className="grid gap-3 max-w-md mx-auto"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {round.options.map((o, i) => (
          <Button
            key={i}
            onClick={() => pick(i)}
            size="lg"
            className="text-xl h-16 whitespace-normal"
          >
            {o}
          </Button>
        ))}
      </div>
      {feedback === "correct" && (
        <p className="text-2xl text-green-600 font-bold">Correct! 🎉</p>
      )}
      {feedback === "wrong" && (
        <p className="text-xl text-orange-500">Try again! 💪</p>
      )}
    </div>
  );
};

export default QuizGame;