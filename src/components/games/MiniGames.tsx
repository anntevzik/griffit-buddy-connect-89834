import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, Shuffle, Sparkles, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GameSessionContext } from "./gameSession";
import MemoryGame from "./MemoryGame";
import ColorMatchGame from "./ColorMatchGame";
import SequenceGame from "./SequenceGame";
import SocialStoryGame from "./SocialStoryGame";
import CountingGame from "./CountingGame";
import MathGame from "./MathGame";
import OddOneOutGame from "./OddOneOutGame";
import PatternGame from "./PatternGame";

type GameKey =
  | "memory"
  | "colors"
  | "sequence"
  | "social"
  | "counting"
  | "math"
  | "odd"
  | "pattern";

const GAMES: { key: GameKey; label: string; emoji: string; Component: React.FC }[] = [
  { key: "memory", label: "Memory Match", emoji: "🧠", Component: MemoryGame },
  { key: "colors", label: "Color Match", emoji: "🎨", Component: ColorMatchGame },
  { key: "sequence", label: "Sequence", emoji: "🔢", Component: SequenceGame },
  { key: "social", label: "Social Story", emoji: "📖", Component: SocialStoryGame },
  { key: "counting", label: "Counting Fun", emoji: "🍎", Component: CountingGame },
  { key: "math", label: "Quick Math", emoji: "➕", Component: MathGame },
  { key: "odd", label: "Odd One Out", emoji: "🔍", Component: OddOneOutGame },
  { key: "pattern", label: "Pattern Finder", emoji: "🧩", Component: PatternGame },
];

interface MiniGamesProps {
  childId?: string;
}

const storageKey = (childId?: string) => `griffin_disliked_games_${childId ?? "anon"}`;

const MiniGames = ({ childId }: MiniGamesProps) => {
  const [disliked, setDisliked] = useState<GameKey[]>([]);
  const [current, setCurrent] = useState<GameKey | null>(null);
  const [askFeeling, setAskFeeling] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [sessionId, setSessionId] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(childId));
      if (raw) setDisliked(JSON.parse(raw));
    } catch {}
  }, [childId]);

  const available = useMemo(
    () => GAMES.filter((g) => !disliked.includes(g.key)),
    [disliked]
  );

  const pickRandom = (exclude?: GameKey) => {
    const pool = available.filter((g) => g.key !== exclude);
    const list = pool.length > 0 ? pool : available;
    if (list.length === 0) {
      setCurrent(null);
      return;
    }
    const next = list[Math.floor(Math.random() * list.length)];
    setCurrent(next.key);
    setAskFeeling(false);
    setMistakes(0);
    setTimeLeft(40);
    setSessionId((s) => s + 1);
  };

  // 40s timer + auto switch
  useEffect(() => {
    if (!current || askFeeling) return;
    setTimeLeft(40);
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          toast.info("Time's up! Let's try a new game! ⏰");
          pickRandom(current);
          return 40;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, askFeeling]);

  const reportMistake = () => {
    if (!current || askFeeling) return;
    setMistakes((m) => {
      const next = m + 1;
      if (next >= 3) {
        toast.info("Let's try a different game! 🌈");
        pickRandom(current);
        return 0;
      }
      return next;
    });
  };

  const finishGame = () => setAskFeeling(true);

  const recordFeeling = async (feeling: "happy" | "okay" | "sad") => {
    if (childId) {
      try {
        await supabase.from("emotion_logs").insert({
          child_id: childId,
          emotion_type: feeling,
        });
      } catch {}
    }
    if (feeling === "sad" && current) {
      const next = Array.from(new Set([...disliked, current]));
      setDisliked(next);
      try {
        localStorage.setItem(storageKey(childId), JSON.stringify(next));
      } catch {}
    }
    pickRandom(current ?? undefined);
  };

  const resetDisliked = () => {
    setDisliked([]);
    try {
      localStorage.removeItem(storageKey(childId));
    } catch {}
  };

  const currentGame = GAMES.find((g) => g.key === current);
  const Game = currentGame?.Component;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-primary">Fun Games! 🎮</h2>
        </div>
        {current && !askFeeling && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10">
              <Timer className="w-4 h-4" /> {timeLeft}s
            </span>
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-secondary/20">
              Mistakes: {mistakes}/3
            </span>
            <Button onClick={finishGame} variant="secondary" className="rounded-full">
              <Sparkles className="w-4 h-4 mr-2" />
              I'm done!
            </Button>
          </div>
        )}
      </div>

      {!current && !askFeeling && (
        <div className="text-center py-12 space-y-4">
          {available.length === 0 ? (
            <>
              <p className="text-lg text-muted-foreground">
                You've told us all the games made you sad. Let's start fresh!
              </p>
              <Button onClick={resetDisliked} size="lg">Reset Games</Button>
            </>
          ) : (
            <>
              <p className="text-xl">Ready for a surprise game?</p>
              <Button onClick={() => pickRandom()} size="lg" className="rounded-full text-lg h-14 px-8">
                <Shuffle className="w-5 h-5 mr-2" />
                Pick a Random Game!
              </Button>
              <p className="text-sm text-muted-foreground">
                {available.length} game{available.length === 1 ? "" : "s"} available
              </p>
            </>
          )}
        </div>
      )}

      {current && Game && !askFeeling && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-lg font-semibold">
              {currentGame?.emoji} {currentGame?.label}
            </p>
          </div>
          <GameSessionContext.Provider value={{ reportMistake }}>
            <Game key={sessionId} />
          </GameSessionContext.Provider>
        </div>
      )}

      {askFeeling && (
        <div className="text-center py-8 space-y-6">
          <p className="text-2xl font-bold">How did that game make you feel?</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button
              onClick={() => recordFeeling("happy")}
              className="rounded-full h-20 w-32 text-lg flex-col gap-1 bg-green-500 hover:bg-green-600"
            >
              <span className="text-3xl">😊</span>
              Happy
            </Button>
            <Button
              onClick={() => recordFeeling("okay")}
              className="rounded-full h-20 w-32 text-lg flex-col gap-1 bg-yellow-500 hover:bg-yellow-600"
            >
              <span className="text-3xl">😐</span>
              Okay
            </Button>
            <Button
              onClick={() => recordFeeling("sad")}
              className="rounded-full h-20 w-32 text-lg flex-col gap-1 bg-blue-500 hover:bg-blue-600"
            >
              <span className="text-3xl">😢</span>
              Sad
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            If you feel sad, we won't show this game again.
          </p>
        </div>
      )}
    </Card>
  );
};

export default MiniGames;
