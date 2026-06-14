import { useEffect, useState } from "react";
import { useGameSession } from "./gameSession";

const CATEGORIES = [
  { name: "Fruit", emoji: "🍎", items: ["🍎", "🍌", "🍇", "🍓", "🍊", "🍉", "🍑", "🥝"] },
  { name: "Animal", emoji: "🐶", items: ["🐶", "🐱", "🐰", "🐻", "🦊", "🐼", "🦁", "🐸"] },
  { name: "Vehicle", emoji: "🚗", items: ["🚗", "🚕", "🚌", "🚑", "🚒", "🚜", "✈️", "🚢"] },
];

const FruitSortGame = () => {
  const { reportMistake } = useGameSession();
  const [item, setItem] = useState("🍎");
  const [correct, setCorrect] = useState("Fruit");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const newRound = () => {
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    setItem(cat.items[Math.floor(Math.random() * cat.items.length)]);
    setCorrect(cat.name);
  };

  useEffect(() => { newRound(); }, []);

  const choose = (name: string) => {
    if (name === correct) {
      setScore((s) => s + 1);
      setLevel((l) => l + 1);
      newRound();
    } else {
      reportMistake();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center font-semibold">Score: {score} · Level {level}</div>
      <div className="text-center text-8xl">{item}</div>
      <p className="text-center text-muted-foreground">Tap the matching box!</p>
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
        {CATEGORIES.map((c) => (
          <button
            key={c.name}
            onClick={() => choose(c.name)}
            className="h-28 rounded-2xl bg-primary/10 hover:bg-primary/20 flex flex-col items-center justify-center gap-1"
          >
            <span className="text-4xl">{c.emoji}</span>
            <span className="font-semibold">{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FruitSortGame;