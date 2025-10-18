import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Palette } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  if (drawings.length === 0) {
    return (
      <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/5">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-6 h-6 text-accent" />
          <h3 className="text-xl font-bold text-accent">{childName}'s Drawings</h3>
        </div>
        <p className="text-muted-foreground">
          No drawings shared yet. When {childName} shares a drawing, it will appear here with emotional insights! 🎨
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/5">
      <div className="flex items-center gap-3 mb-6">
        <Palette className="w-6 h-6 text-accent" />
        <h3 className="text-xl font-bold text-accent">{childName}'s Shared Drawings</h3>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-6">
          {drawings.map((drawing) => (
            <Card key={drawing.id} className="p-4 bg-white shadow-md">
              <div className="space-y-3">
                <img
                  src={drawing.image_data}
                  alt="Child's drawing"
                  className="w-full rounded-lg border-2 border-primary/20"
                />
                
                <div className="bg-accent/10 p-4 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <Heart className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-accent mb-1">Emotional Insights:</p>
                      <p className="text-foreground">{drawing.ai_analysis}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {new Date(drawing.created_at).toLocaleDateString()} at{' '}
                  {new Date(drawing.created_at).toLocaleTimeString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ChildDrawings;
