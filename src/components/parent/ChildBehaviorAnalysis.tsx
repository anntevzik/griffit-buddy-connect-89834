import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Lightbulb, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChildBehaviorAnalysisProps {
  childId: string;
  childName: string;
}

interface Analysis {
  portrait: string;
  advice: string[];
}

const ChildBehaviorAnalysis = ({ childId, childName }: ChildBehaviorAnalysisProps) => {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAndAnalyze();
  }, [childId]);

  const fetchAndAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch emotion data
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: emotions } = await supabase
        .from("emotion_logs")
        .select("emotion_type")
        .eq("child_id", childId)
        .gte("created_at", sevenDaysAgo.toISOString());

      // Fetch food choice data
      const { data: foodChoices } = await supabase
        .from("choice_logs")
        .select("choice_value")
        .eq("child_id", childId)
        .eq("choice_type", "food")
        .order("created_at", { ascending: false })
        .limit(20);

      // Fetch game activity data
      const { data: gameActivity } = await supabase
        .from("progress_entries")
        .select("activity_type")
        .eq("child_id", childId)
        .order("created_at", { ascending: false })
        .limit(20);

      // Process emotion data
      const emotionCounts: Record<string, number> = {};
      emotions?.forEach((log) => {
        emotionCounts[log.emotion_type] = (emotionCounts[log.emotion_type] || 0) + 1;
      });

      const sortedEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
      const topEmotion = sortedEmotions[0]?.[0] || "happy";
      const emotionCount = sortedEmotions[0]?.[1] || 0;
      const otherEmotions = sortedEmotions.slice(1, 4).map(([emotion]) => emotion);

      // Process food choice data
      const foodCounts: Record<string, number> = {};
      foodChoices?.forEach((choice) => {
        foodCounts[choice.choice_value] = (foodCounts[choice.choice_value] || 0) + 1;
      });

      const sortedFoods = Object.entries(foodCounts).sort((a, b) => b[1] - a[1]);
      const topFood = sortedFoods[0]?.[0] || "No food choices yet";
      const foodCount = sortedFoods[0]?.[1] || 0;

      // Process game activity data
      const gameCounts: Record<string, number> = {};
      gameActivity?.forEach((entry) => {
        const gameName = entry.activity_type.replace(/_/g, ' ');
        gameCounts[gameName] = (gameCounts[gameName] || 0) + 1;
      });

      const sortedGames = Object.entries(gameCounts).sort((a, b) => b[1] - a[1]);
      const topGame = sortedGames[0]?.[0] || "No games played yet";
      const gameCount = sortedGames[0]?.[1] || 0;

      // Call edge function for AI analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        "analyze-child-behavior",
        {
          body: {
            emotionData: {
              topEmotion,
              count: emotionCount,
              others: otherEmotions,
            },
            foodData: {
              topFood,
              count: foodCount,
            },
            gameData: {
              topGame,
              count: gameCount,
            },
          },
        }
      );

      if (analysisError) throw analysisError;

      setAnalysis(analysisData);
    } catch (err) {
      console.error("Error analyzing behavior:", err);
      setError("Unable to generate analysis at this time");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Behavioral Insights for {childName}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Behavioral Insights for {childName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Behavioral Insights for {childName}
        </CardTitle>
        <CardDescription>
          AI-powered analysis based on activity patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {analysis && (
          <>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Psychological Portrait
              </h3>
              <p className="text-muted-foreground leading-relaxed">{analysis.portrait}</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Parental Guidance
              </h3>
              <ul className="space-y-2">
                {analysis.advice.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary font-semibold mt-1">•</span>
                    <span className="text-muted-foreground flex-1">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ChildBehaviorAnalysis;
