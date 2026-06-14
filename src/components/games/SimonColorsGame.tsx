import { useEffect, useState } from "react";
import { useGameSession } from "./gameSession";

const PADS = [
  { name: "red", cls: "bg-red-500" },
  { name: "blue", cls: "bg-blue-500" },
  { name: "green", cls: "bg-green-500" },
  { name: "yellow", cls: "bg-yellow-400" },
];

const SimonColorsGame = () => {
  const { reportMistake } = useGameSession();
  const [seq, setSeq] = useState<number[]>([]);
  const [showing, setShowing] = useState(-1);
  const [step, setStep] = useState(0);
  const [playerTurn, setPlayerTurn] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setSeq([Math.floor(Math.random() * 4)]);
  }, []);

  useEffect(() => {
    if (seq.length === 0) return;
    setPlayerTurn(false);
    let i = 0;
    const id = setInterval(() => {
      setShowing(seq[i]);
      setTimeout(() => setShowing(-1), 350);
      i++;
      if (i >= seq.length) {
        clearInterval(id);
        setTimeout(() => { setPlayerTurn(true); setStep(0); }, 500);
      }
    }, 700);
    return () => clearInterval(id);
  }, [seq]);

  const tap = (i: number) => {
    if (!playerTurn) return;
    if (i === seq[step]) {
      if (step + 1 === seq.length) {
        setScore((s) => s + 1);
        setSeq((s) => [...s, Math.floor(Math.random() * 4)]);
      } else {
        setStep(step + 1);
      }
    } else {
      reportMistake();
      setPlayerTurn(false);
      setStep(0);
      setTimeout(() => setSeq((s) => [...s]), 600);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center font-semibold">Score: {score} · Length {seq.length}</div>
      <p className="text-center text-muted-foreground">
        {playerTurn ? "Your turn! Repeat the sequence" : "Watch carefully…"}
      </p>
      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        {PADS.map((p, i) => (
          <button
            key={p.name}
            onClick={() => tap(i)}
            className={`${p.cls} h-28 rounded-2xl transition-opacity ${
              showing === i ? "opacity-100 ring-4 ring-white" : "opacity-60 hover:opacity-90"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SimonColorsGame;