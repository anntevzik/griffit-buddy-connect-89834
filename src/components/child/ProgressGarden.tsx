import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Flower2, Sparkles, Trophy, Award, Heart, Star, Zap } from "lucide-react";

interface ProgressGardenProps {
  childId: string;
}

interface Badge {
  id: string;
  badge_type: string;
  message: string;
  created_at: string;
}

const badgeIcons: Record<string, any> = {
  star: Star,
  heart: Heart,
  trophy: Trophy,
  sparkles: Sparkles,
  zap: Zap,
  award: Award,
};

const badgeColors: Record<string, string> = {
  star: "bg-yellow-300",
  heart: "bg-pink-300",
  trophy: "bg-amber-300",
  sparkles: "bg-purple-300",
  zap: "bg-blue-300",
  award: "bg-green-300",
};

const ProgressGarden = ({ childId }: ProgressGardenProps) => {
  const [progressCount, setProgressCount] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    checkAndResetDaily();
    fetchBadges();
  }, [childId]);

  const checkAndResetDaily = async () => {
    if (!childId) return;

    // Get or create daily stats
    const { data: stats } = await supabase
      .from("daily_garden_stats")
      .select("*")
      .eq("child_id", childId)
      .maybeSingle();

    const today = new Date().toISOString().split('T')[0];

    if (!stats) {
      // First time - create stats
      const { data: progressData } = await supabase
        .from("progress_entries")
        .select("*")
        .eq("child_id", childId);

      const currentScore = progressData?.length || 0;

      await supabase.from("daily_garden_stats").insert({
        child_id: childId,
        daily_score: currentScore,
        high_score: currentScore,
        last_reset_date: today,
      });

      setProgressCount(currentScore);
      setHighScore(currentScore);
    } else {
      // Check if we need to reset for new day
      if (stats.last_reset_date !== today) {
        // New day - update high score if current is higher
        const { data: progressData } = await supabase
          .from("progress_entries")
          .select("*")
          .eq("child_id", childId);

        const currentScore = progressData?.length || 0;
        const newHighScore = Math.max(stats.high_score, currentScore);

        // Delete old progress entries
        await supabase
          .from("progress_entries")
          .delete()
          .eq("child_id", childId);

        // Update stats
        await supabase
          .from("daily_garden_stats")
          .update({
            daily_score: 0,
            high_score: newHighScore,
            last_reset_date: today,
          })
          .eq("child_id", childId);

        setProgressCount(0);
        setHighScore(newHighScore);
      } else {
        // Same day - just fetch current progress
        const { data: progressData } = await supabase
          .from("progress_entries")
          .select("*")
          .eq("child_id", childId);

        const currentScore = progressData?.length || 0;

        // Update daily score
        await supabase
          .from("daily_garden_stats")
          .update({ daily_score: currentScore })
          .eq("child_id", childId);

        setProgressCount(currentScore);
        setHighScore(stats.high_score);
      }
    }
  };

  const fetchBadges = async () => {
    const { data, error } = await supabase
      .from("badges")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setBadges(data);
    }
  };

  const flowers = Array.from({ length: Math.min(progressCount, 20) }, (_, i) => i);

  return (
    <Card className="p-6 glass-effect shadow-[var(--shadow-float)] border-2 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-accent mb-2">
          🌱 Your Progress Garden
        </h2>
        <p className="text-muted-foreground text-lg">
          Every activity you do makes a flower grow!
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="p-4 bg-accent/20 rounded-xl flex items-center gap-3">
          <Trophy className="w-8 h-8 text-accent" />
          <div>
            <p className="text-sm text-muted-foreground">Today's Score</p>
            <p className="text-3xl font-bold text-accent">{progressCount}</p>
          </div>
        </div>
        <div className="p-4 bg-primary/20 rounded-xl flex items-center gap-3">
          <Award className="w-8 h-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">High Score</p>
            <p className="text-3xl font-bold text-primary">{highScore}</p>
          </div>
        </div>
      </div>

      <div className="min-h-[200px] p-6 bg-gradient-to-b from-sky-100 to-green-100 rounded-2xl relative overflow-hidden">
        {progressCount === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-2">
              Your garden is waiting to grow!
            </p>
            <p className="text-muted-foreground">
              Complete activities to plant your first flower 🌸
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
            {flowers.map((i) => (
              <div
                key={i}
                className="flex items-center justify-center animate-gentle-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <Flower2
                  className="w-10 h-10 md:w-12 md:h-12"
                  style={{
                    color: [
                      "#F59E0B",
                      "#EC4899",
                      "#8B5CF6",
                      "#06B6D4",
                      "#10B981",
                    ][i % 5],
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {progressCount >= 20 && (
          <div className="mt-6 p-4 bg-white/80 rounded-xl text-center animate-fade-in-up">
            <p className="text-xl font-bold text-accent">
              🎉 Your garden is full and beautiful! 🎉
            </p>
          </div>
        )}
      </div>

      {/* Badges from Parents */}
      {badges.length > 0 && (
        <div className="mt-6">
          <h3 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            💝 Messages from Your Parent
          </h3>
          <div className="space-y-3">
            {badges.map((badge) => {
              const Icon = badgeIcons[badge.badge_type] || Award;
              const colorClass = badgeColors[badge.badge_type] || "bg-primary";
              
              return (
                <div
                  key={badge.id}
                  className="p-4 glass-effect rounded-xl animate-fade-in-up flex items-center gap-4 border-2 border-primary/20"
                >
                  <div className={`w-16 h-16 rounded-full ${colorClass} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <Icon className="w-8 h-8 text-gray-800" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-medium text-foreground">
                      {badge.message}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(badge.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ProgressGarden;
