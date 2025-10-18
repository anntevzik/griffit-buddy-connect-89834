import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Moon, Clock } from "lucide-react";

interface SleepReminderSettingsProps {
  childId: string;
  childName: string;
}

const SleepReminderSettings = ({ childId, childName }: SleepReminderSettingsProps) => {
  const { toast } = useToast();
  const [bedtime, setBedtime] = useState("21:00");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, [childId]);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('sleep_settings')
      .select('*')
      .eq('child_id', childId)
      .single();

    if (data) {
      setBedtime(data.bedtime.slice(0, 5)); // Extract HH:MM from HH:MM:SS
      setEnabled(data.enabled);
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    try {
      const { data: existing } = await supabase
        .from('sleep_settings')
        .select('id')
        .eq('child_id', childId)
        .single();

      if (existing) {
        await supabase
          .from('sleep_settings')
          .update({
            bedtime: bedtime + ':00',
            enabled: enabled,
          })
          .eq('child_id', childId);
      } else {
        await supabase
          .from('sleep_settings')
          .insert({
            child_id: childId,
            bedtime: bedtime + ':00',
            enabled: enabled,
          });
      }

      toast({
        title: "Settings Saved! 🌙",
        description: `Sleep reminder set for ${bedtime}`,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  if (loading) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex items-center gap-3 mb-6">
        <Moon className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-primary">Sleep Reminder</h2>
          <p className="text-sm text-muted-foreground">Set bedtime for {childName}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="enabled" className="text-base">Enable Reminder</Label>
          <Switch
            id="enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bedtime" className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Bedtime
          </Label>
          <Input
            id="bedtime"
            type="time"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            className="text-lg"
          />
        </div>

        <Button 
          onClick={saveSettings}
          className="w-full bg-primary hover:bg-primary/90"
        >
          Save Settings
        </Button>
      </div>
    </Card>
  );
};

export default SleepReminderSettings;
