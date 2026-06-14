import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Apple, Coffee, Sandwich, Cookie, Pizza, IceCream, ShoppingBasket, Carrot, Beef, Fish, Egg, Croissant, Salad, Soup, Cherry, Grape, Banana, Citrus, Drumstick, Milk, Cake, Donut, Popcorn } from "lucide-react";

interface ChoiceExplorerProps {
  childId: string;
}

const foodChoices = [
  { type: "apple", icon: Apple, label: "Apple", texture: "crunchy", color: "bg-red-200" },
  { type: "cookie", icon: Cookie, label: "Cookie", texture: "soft", color: "bg-amber-200" },
  { type: "sandwich", icon: Sandwich, label: "Sandwich", texture: "mixed", color: "bg-yellow-200" },
  { type: "pizza", icon: Pizza, label: "Pizza", texture: "chewy", color: "bg-orange-200" },
  { type: "ice-cream", icon: IceCream, label: "Ice Cream", texture: "smooth", color: "bg-pink-200" },
  { type: "juice", icon: Coffee, label: "Juice", texture: "liquid", color: "bg-purple-200" },
  { type: "carrot", icon: Carrot, label: "Carrot", texture: "crunchy", color: "bg-orange-300" },
  { type: "salad", icon: Salad, label: "Salad", texture: "crunchy", color: "bg-green-200" },
  { type: "soup", icon: Soup, label: "Soup", texture: "liquid", color: "bg-amber-100" },
  { type: "chicken", icon: Drumstick, label: "Chicken", texture: "chewy", color: "bg-yellow-300" },
  { type: "fish", icon: Fish, label: "Fish", texture: "soft", color: "bg-blue-200" },
  { type: "beef", icon: Beef, label: "Beef", texture: "chewy", color: "bg-red-300" },
  { type: "egg", icon: Egg, label: "Egg", texture: "soft", color: "bg-yellow-100" },
  { type: "croissant", icon: Croissant, label: "Croissant", texture: "soft", color: "bg-amber-300" },
  { type: "banana", icon: Banana, label: "Banana", texture: "soft", color: "bg-yellow-200" },
  { type: "grapes", icon: Grape, label: "Grapes", texture: "smooth", color: "bg-purple-300" },
  { type: "cherry", icon: Cherry, label: "Cherry", texture: "smooth", color: "bg-red-200" },
  { type: "orange", icon: Citrus, label: "Orange", texture: "smooth", color: "bg-orange-200" },
  { type: "milk", icon: Milk, label: "Milk", texture: "liquid", color: "bg-slate-100" },
  { type: "cake", icon: Cake, label: "Cake", texture: "soft", color: "bg-pink-300" },
  { type: "donut", icon: Donut, label: "Donut", texture: "soft", color: "bg-rose-200" },
  { type: "popcorn", icon: Popcorn, label: "Popcorn", texture: "crunchy", color: "bg-yellow-100" },
];

const ChoiceExplorer = ({ childId }: ChoiceExplorerProps) => {
  const { toast } = useToast();
  const [basket, setBasket] = useState<string[]>([]);
  const [selectedTexture, setSelectedTexture] = useState<string | null>(null);

  const handleAddToBasket = async (choice: typeof foodChoices[0]) => {
    if (basket.includes(choice.type)) {
      setBasket(basket.filter(item => item !== choice.type));
      return;
    }

    const newBasket = [...basket, choice.type];
    setBasket(newBasket);

    try {
      await supabase.from("choice_logs").insert({
        child_id: childId,
        choice_type: "food",
        choice_value: choice.type,
      });

      await supabase.from("progress_entries").insert({
        child_id: childId,
        activity_type: "choice_made",
      });

      toast({
        title: `${choice.label} added! 🎉`,
        description: "Great choice!",
      });
    } catch (error) {
      console.error("Error logging choice:", error);
    }
  };

  const filteredChoices = selectedTexture
    ? foodChoices.filter(choice => choice.texture === selectedTexture)
    : foodChoices;

  return (
    <Card className="p-6 glass-effect shadow-[var(--shadow-float)] border-2 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary mb-2">
          🍱 Choice Explorer
        </h2>
        <p className="text-muted-foreground text-lg">
          Pick what you want! Add them to your basket
        </p>
      </div>

      {/* Texture Filter */}
      <div className="mb-6">
        <p className="text-lg font-semibold mb-3">Filter by texture:</p>
        <div className="flex flex-wrap gap-2">
          {["crunchy", "soft", "smooth", "chewy", "mixed", "liquid"].map((texture) => (
            <Button
              key={texture}
              onClick={() => setSelectedTexture(selectedTexture === texture ? null : texture)}
              variant={selectedTexture === texture ? "default" : "outline"}
              className="rounded-full"
            >
              {texture}
            </Button>
          ))}
        </div>
      </div>

      {/* Basket Display */}
      <div className="mb-6 p-4 bg-accent/20 rounded-xl flex items-center gap-3">
        <ShoppingBasket className="w-8 h-8 text-accent" />
        <div>
          <p className="text-sm text-muted-foreground">Your Basket</p>
          <p className="text-2xl font-bold text-accent">{basket.length} items</p>
        </div>
      </div>

      {/* Food Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredChoices.map((choice) => {
          const Icon = choice.icon;
          const isInBasket = basket.includes(choice.type);

          return (
            <Button
              key={choice.type}
              onClick={() => handleAddToBasket(choice)}
              className={`h-32 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                isInBasket
                  ? "scale-105 ring-4 ring-accent shadow-xl"
                  : "hover:scale-105"
              } ${choice.color} text-gray-800 hover:shadow-lg`}
              variant="ghost"
            >
              <Icon className="w-12 h-12" />
              <div className="text-center">
                <span className="text-lg font-semibold block">{choice.label}</span>
                <span className="text-xs opacity-75">{choice.texture}</span>
              </div>
            </Button>
          );
        })}
      </div>

      {basket.length > 0 && (
        <div className="mt-6 p-4 bg-primary/10 rounded-xl text-center animate-fade-in-up">
          <p className="text-lg font-medium text-primary">
            Awesome choices! 🌟 You picked {basket.length} thing{basket.length !== 1 ? "s" : ""}!
          </p>
        </div>
      )}
    </Card>
  );
};

export default ChoiceExplorer;
