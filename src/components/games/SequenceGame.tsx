import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const colors = ["🔴", "🟢", "🔵", "🟡", "🟣", "🟠"];

const SequenceGame = () => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isShowing, setIsShowing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(3);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const startGame = () => {
    const newSequence = Array.from({ length: currentLevel }, () => 
      Math.floor(Math.random() * colors.length)
    );
    setSequence(newSequence);
    setUserSequence([]);
    setIsPlaying(true);
    showSequence(newSequence);
  };

  const showSequence = async (seq: number[]) => {
    setIsShowing(true);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setHighlightedIndex(seq[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
      setHighlightedIndex(null);
    }
    setIsShowing(false);
  };

  const handleColorClick = (index: number) => {
    if (isShowing || !isPlaying) return;

    const newUserSequence = [...userSequence, index];
    setUserSequence(newUserSequence);

    // Check if the current input is correct
    if (sequence[newUserSequence.length - 1] !== index) {
      toast.error("Oops! Try again! 🎯");
      setIsPlaying(false);
      return;
    }

    // Check if sequence is complete
    if (newUserSequence.length === sequence.length) {
      toast.success("Perfect! Moving to the next level! 🌟");
      setCurrentLevel(currentLevel + 1);
      setTimeout(() => startGame(), 1500);
    }
  };

  const resetGame = () => {
    setSequence([]);
    setUserSequence([]);
    setIsPlaying(false);
    setCurrentLevel(3);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold text-primary">Sequence Memory! 🧠</h3>
      </div>

      <div className="text-center mb-6">
        <p className="text-lg font-semibold mb-2">
          {isPlaying ? (isShowing ? "Watch carefully!" : "Repeat the sequence!") : "Ready to play?"}
        </p>
        <p className="text-sm text-muted-foreground">Level: {currentLevel - 2}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 max-w-sm mx-auto">
        {colors.map((color, index) => (
          <button
            key={index}
            onClick={() => handleColorClick(index)}
            disabled={isShowing || !isPlaying}
            className={`
              text-6xl p-6 rounded-lg transition-all transform
              ${highlightedIndex === index ? "scale-110 shadow-lg" : ""}
              ${!isPlaying ? "opacity-50" : "hover:scale-105"}
              ${isShowing ? "cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {color}
          </button>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        {!isPlaying && (
          <Button onClick={startGame} className="gap-2">
            <Play className="w-4 h-4" />
            Start Game
          </Button>
        )}
        <Button onClick={resetGame} variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
    </Card>
  );
};

export default SequenceGame;
