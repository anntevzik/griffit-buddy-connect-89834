import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Palette, Heart } from "lucide-react";

interface SharedDrawing {
  id: string;
  image_data: string;
  ai_analysis: string;
  created_at: string;
}

interface ChildDrawingsProps {
  childId: string;
  childName: string;
}

const ChildDrawings = ({ childId, childName }: ChildDrawingsProps) => {
  const [drawings, setDrawings] = useState<SharedDrawing[]>([]);

  useEffect(() => {
    loadDrawings();

    // Subscribe to new drawings
    const channel = supabase
      .channel('shared_drawings_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'shared_drawings',
          filter: `child_id=eq.${childId}`,
        },
        (payload) => {
          const newDrawing = payload.new as SharedDrawing;
          setDrawings((prev) => [newDrawing, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [childId]);

  const loadDrawings = async () => {
    const { data } = await supabase
      .from('shared_drawings')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setDrawings(data);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-primary">{childName}'s Art Gallery</h2>
          <p className="text-sm text-muted-foreground">See what they're expressing</p>
        </div>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        {drawings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Palette className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No drawings shared yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {drawings.map((drawing) => (
              <Card key={drawing.id} className="p-4 space-y-4 hover:shadow-lg transition-shadow">
                {/* Drawing Image */}
                <div className="bg-white rounded-lg p-2">
                  <img
                    src={drawing.image_data}
                    alt="Child's drawing"
                    className="w-full rounded border-2 border-gray-200"
                  />
                </div>

                {/* AI Analysis */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Heart className="w-4 h-4" />
                    Emotional Insight
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-white/50 p-3 rounded-lg">
                    {drawing.ai_analysis}
                  </p>
                </div>

                {/* Timestamp */}
                <p className="text-xs text-muted-foreground">
                  Shared {new Date(drawing.created_at).toLocaleDateString()} at{' '}
                  {new Date(drawing.created_at).toLocaleTimeString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default ChildDrawings;
