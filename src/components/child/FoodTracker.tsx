import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Utensils, Star, Apple, Pizza, Cookie, Egg, Salad, IceCream, Check } from "lucide-react";

interface FoodTrackerProps {
  childId: string;
}

const foodOptions = [
  { name: "Apple", icon: Apple, color: "text-red-500", bg: "bg-red-50" },
  { name: "Pizza", icon: Pizza, color: "text-orange-500", bg: "bg-orange-50" },
  { name: "Cookie", icon: Cookie, color: "text-amber-600", bg: "bg-amber-50" },
  { name: "Eggs", icon: Egg, color: "text-yellow-500", bg: "bg-yellow-50" },
  { name: "Salad", icon: Salad, color: "text-green-500", bg: "bg-green-50" },
  { name: "Ice Cream", icon: IceCream, color: "text-pink-500", bg: "bg-pink-50" },
];

const FoodTracker = ({ childId }: FoodTrackerProps) => {
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleFood = (name: string) => {
    setSelectedFoods((prev) => {
      const next = prev.includes(name)
        ? prev.filter((f) => f !== name)
        : [...prev, name];
      return next;
    });
  };

  const handleSave = () => {
    toast({
      title: "Yum! 🍽️",
      description: `You picked: ${selectedFoods.join(", ") || "nothing yet"}!`,
    });
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Utensils className="w-5 h-5 text-primary" />
          Food Choice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Tap the foods you like today!
        </p>
        <div className="grid grid-cols-3 gap-3">
          {foodOptions.map((food) => {
            const Icon = food.icon;
            const isSelected = selectedFoods.includes(food.name);
            return (
              <button
                key={food.name}
                onClick={() => toggleFood(food.name)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 border-2 ${
                  isSelected
                    ? "border-primary bg-primary/10 scale-105"
                    : "border-transparent hover:scale-105"
                } ${food.bg}`}
              >
                <Icon className={`w-8 h-8 ${food.color}`} />
                <span className="text-xs font-medium">{food.name}</span>
                {isSelected && (
                  <Check className="w-4 h-4 text-primary absolute top-1 right-1" />
                )}
              </button>
            );
          })}
        </div>
        <Button onClick={handleSave} className="w-full rounded-xl">
          <Star className="w-4 h-4 mr-2" />
          Save My Choices
        </Button>
      </CardContent>
    </Card>
  );
};

export default FoodTracker;
