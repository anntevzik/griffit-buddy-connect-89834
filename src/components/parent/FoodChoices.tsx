import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Apple, Cookie, Pizza, IceCream, Beef, Carrot } from "lucide-react";

interface FoodChoicesProps {
  childId: string;
  childName: string;
}

const foodIcons: Record<string, any> = {
  apple: Apple,
  cookie: Cookie,
  pizza: Pizza,
  ice_cream: IceCream,
  chicken: Beef,
  carrot: Carrot,
};

interface ChoiceLog {
  id: string;
  choice_value: string;
  choice_type: string;
  created_at: string;
}

const FoodChoices = ({ childId, childName }: FoodChoicesProps) => {
  const [choices, setChoices] = useState<ChoiceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChoices();
  }, [childId]);

  const fetchChoices = async () => {
    const { data, error } = await supabase
      .from("choice_logs")
      .select("*")
      .eq("child_id", childId)
      .eq("choice_type", "food")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setChoices(data);
    }
    setLoading(false);
  };

  const getChoiceCount = () => {
    const counts: Record<string, number> = {};
    choices.forEach((choice) => {
      counts[choice.choice_value] = (counts[choice.choice_value] || 0) + 1;
    });
    return counts;
  };

  const choiceCounts = getChoiceCount();

  return (
    <Card className="p-6 glass-effect shadow-[var(--shadow-float)] border-2 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary mb-2">
          🍎 Food Choices
        </h2>
        <p className="text-muted-foreground text-lg">
          {childName}'s recent food selections
        </p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading choices...</p>
        </div>
      ) : choices.length > 0 ? (
        <div className="space-y-4">
          {/* Choice counts */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(choiceCounts).map(([choice, count]) => {
              const Icon = foodIcons[choice] || Apple;
              return (
                <div
                  key={choice}
                  className="p-4 bg-primary/10 rounded-xl flex items-center gap-3"
                >
                  <Icon className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm font-medium capitalize">{choice.replace('_', ' ')}</p>
                    <p className="text-xs text-muted-foreground">{count} times</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent choices timeline */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              Recent Selections:
            </h3>
            <div className="space-y-2">
              {choices.slice(0, 5).map((choice) => {
                const Icon = foodIcons[choice.choice_value] || Apple;
                return (
                  <div
                    key={choice.id}
                    className="p-3 bg-accent/5 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-accent" />
                      <span className="text-sm capitalize">
                        {choice.choice_value.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(choice.created_at).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No food choices recorded yet</p>
        </div>
      )}
    </Card>
  );
};

export default FoodChoices;