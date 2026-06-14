import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

const COLORS = ["#60A5FA", "#F472B6", "#34D399", "#FBBF24", "#A78BFA", "#FB7185"];

const BubblePopGame = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (timeLeft <= 0) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [playing, timeLeft]);

  useEffect(() => {
    if (!playing) return;
    const spawn = setInterval(() => {
      setBubbles((prev) => [
        ...prev.slice(-12),
        {
          id: Date.now() + Math.random(),
          x: Math.random() * 80 + 5,
          y: Math.random() * 70 + 10,
          size: Math.random() * 30 + 40,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        },
      ]);
    }, 700);
    return () => clearInterval(spawn);
  }, [playing]);

  const start = () => {
    setScore(0);
    setTimeLeft(30);
    setBubbles([]);
    setPlaying(true);
  };

  const pop = (id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setScore((s) => s + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">Score: {score}</p>
        <p className="text-lg font-semibold">Time: {timeLeft}s</p>
      </div>
      <div className="relative bg-gradient-to-b from-sky-100 to-blue-200 rounded-xl h-80 overflow-hidden">
        {!playing && timeLeft === 30 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button onClick={start} size="lg">Start Popping! 🫧</Button>
          </div>
        )}
        {!playing && timeLeft <= 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70">
            <p className="text-2xl font-bold">Great job! You popped {score} bubbles! 🎉</p>
            <Button onClick={start}>Play Again</Button>
          </div>
        )}
        {bubbles.map((b) => (
          <button
            key={b.id}
            onClick={() => pop(b.id)}
            className="absolute rounded-full shadow-lg hover:scale-110 transition-transform"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.size,
              height: b.size,
              background: `radial-gradient(circle at 30% 30%, white, ${b.color})`,
            }}
            aria-label="Pop bubble"
          />
        ))}
      </div>
    </div>
  );
};

export default BubblePopGame;