import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const colors = [
  { name: "Red", hex: "#FF6B6B" },
  { name: "Blue", hex: "#4ECDC4" },
  { name: "Green", hex: "#95E1D3" },
  { name: "Yellow", hex: "#FFE66D" },
  { name: "Purple", hex: "#C7CEEA" },
  { name: "Orange", hex: "#FFA07A" },
];

const ColorMatchGame = () => {
  const [targetColor, setTargetColor] = useState(colors[0]);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<typeof colors>([]);
  const { toast } = useToast();

  useEffect(() => {
    generateNewRound();
  }, []);

  const generateNewRound = () => {
    const target = colors[Math.floor(Math.random() * colors.length)];
    setTargetColor(target);
    
    const shuffled = [...colors].sort(() => Math.random() - 0.5).slice(0, 4);
    if (!shuffled.find(c => c.name === target.name)) {
      shuffled[Math.floor(Math.random() * 4)] = target;
    }
    setOptions(shuffled);
  };

  const handleColorClick = (color: typeof colors[0]) => {
    if (color.name === targetColor.name) {
      setScore(score + 1);
      toast({
        title: "Correct! ✨",
        description: "Great job matching the color!",
      });
      generateNewRound();
    } else {
      toast({
        title: "Try again! 💙",
        description: "That's not quite right, but keep going!",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-lg font-semibold">Score: {score}</p>
        <Button onClick={generateNewRound} variant="outline" size="sm">
          <Sparkles className="w-4 h-4 mr-2" />
          Skip
        </Button>
      </div>

      <div className="text-center space-y-4">
        <p className="text-xl font-bold">Find: {targetColor.name}</p>
        <Card 
          className="w-32 h-32 mx-auto rounded-full"
          style={{ backgroundColor: targetColor.hex }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {options.map((color, index) => (
          <Card
            key={index}
            onClick={() => handleColorClick(color)}
            className="aspect-square rounded-2xl cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: color.hex }}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorMatchGame;
