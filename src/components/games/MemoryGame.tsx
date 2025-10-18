import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emojis = ["🌟", "🎨", "🌈", "🦋", "🌸", "🎵", "🐠", "🌺"];

const MemoryGame = () => {
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      
      if (cards[first] === cards[second]) {
        setMatched([...matched, first, second]);
        setFlipped([]);
        
        if (matched.length + 2 === cards.length) {
          toast({
            title: "Amazing! 🎉",
            description: `You won in ${moves + 1} moves!`,
          });
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold">Moves: {moves}</p>
        <Button onClick={initializeGame} variant="outline" size="sm">
          <Sparkles className="w-4 h-4 mr-2" />
          New Game
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map((emoji, index) => (
          <Card
            key={index}
            onClick={() => handleCardClick(index)}
            className={`
              aspect-square flex items-center justify-center text-3xl cursor-pointer
              transition-all duration-300 hover:scale-105
              ${flipped.includes(index) || matched.includes(index) 
                ? 'bg-primary/20' 
                : 'bg-muted'
              }
              ${matched.includes(index) ? 'opacity-50' : ''}
            `}
          >
            {(flipped.includes(index) || matched.includes(index)) ? emoji : '?'}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MemoryGame;
