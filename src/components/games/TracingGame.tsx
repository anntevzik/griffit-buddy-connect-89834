import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenTool, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

const shapes = [
  { name: "Circle", path: "M 150 50 A 50 50 0 1 1 149.9 50" },
  { name: "Square", path: "M 100 50 L 200 50 L 200 150 L 100 150 Z" },
  { name: "Triangle", path: "M 150 50 L 200 150 L 100 150 Z" },
  { name: "Star", path: "M 150 50 L 165 100 L 220 100 L 175 135 L 190 190 L 150 155 L 110 190 L 125 135 L 80 100 L 135 100 Z" },
];

const letters = ["A", "B", "C", "D", "E"];

const TracingGame = () => {
  const [currentMode, setCurrentMode] = useState<"shapes" | "letters">("shapes");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleComplete = () => {
    toast.success("Great job! You traced it perfectly! ✨");
    const maxIndex = currentMode === "shapes" ? shapes.length - 1 : letters.length - 1;
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleReset = () => {
    setIsDrawing(false);
    toast.info("Let's try again!");
  };

  const currentItem = currentMode === "shapes" 
    ? shapes[currentIndex] 
    : { name: letters[currentIndex] };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PenTool className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-primary">Trace & Learn! ✏️</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant={currentMode === "shapes" ? "default" : "outline"}
            onClick={() => {
              setCurrentMode("shapes");
              setCurrentIndex(0);
            }}
            size="sm"
          >
            Shapes
          </Button>
          <Button
            variant={currentMode === "letters" ? "default" : "outline"}
            onClick={() => {
              setCurrentMode("letters");
              setCurrentIndex(0);
            }}
            size="sm"
          >
            Letters
          </Button>
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-lg font-semibold">
          Trace the {currentMode === "shapes" ? "shape" : "letter"}: <span className="text-primary">{currentItem.name}</span>
        </p>
      </div>

      <div className="flex justify-center mb-4">
        <div className="relative bg-white rounded-lg p-8 border-4 border-dashed border-primary/30">
          {currentMode === "shapes" ? (
            <svg width="300" height="200" viewBox="0 0 300 200">
              <path
                d={shapes[currentIndex].path}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="4"
                strokeDasharray="8,8"
                opacity="0.5"
              />
            </svg>
          ) : (
            <div className="w-[300px] h-[200px] flex items-center justify-center">
              <span className="text-[120px] font-bold text-primary/30 select-none">
                {letters[currentIndex]}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Button onClick={handleReset} variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
        <Button onClick={handleComplete} className="gap-2">
          <Sparkles className="w-4 h-4" />
          I Did It!
        </Button>
      </div>
    </Card>
  );
};

export default TracingGame;
