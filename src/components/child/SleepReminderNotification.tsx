import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Moon, Sparkles } from "lucide-react";
import griffinLogo from "@/assets/griffin-logo.png";

interface SleepReminderNotificationProps {
  childId: string;
}

const SleepReminderNotification = ({ childId }: SleepReminderNotificationProps) => {
  const [showReminder, setShowReminder] = useState(false);
  const [bedtime, setBedtime] = useState<string | null>(null);

  useEffect(() => {
    if (!childId) return;
    
    loadSettings();
    checkBedtime(); // Check immediately on mount
    const interval = setInterval(checkBedtime, 30000); // Check every 30 seconds

    // Subscribe to settings changes
    const channel = supabase
      .channel('sleep_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sleep_settings',
          filter: `child_id=eq.${childId}`,
        },
        () => {
          loadSettings();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [childId]);

  const loadSettings = async () => {
    if (!childId) return;
    
    const { data } = await supabase
      .from('sleep_settings')
      .select('*')
      .eq('child_id', childId)
      .maybeSingle();

    if (data && data.enabled) {
      setBedtime(data.bedtime);
    } else {
      setBedtime(null);
    }
  };

  const checkBedtime = () => {
    if (!bedtime) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Parse bedtime (HH:MM:SS or HH:MM)
    const bedtimeParts = bedtime.split(':');
    const bedtimeHour = parseInt(bedtimeParts[0]);
    const bedtimeMinute = parseInt(bedtimeParts[1]);

    // Show notification if within 5 minutes of bedtime
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    const bedtimeTotalMinutes = bedtimeHour * 60 + bedtimeMinute;
    const difference = currentTotalMinutes - bedtimeTotalMinutes;

    if (difference >= 0 && difference <= 5) {
      setShowReminder(true);
      
      // Auto-hide after 5 minutes
      setTimeout(() => {
        setShowReminder(false);
      }, 300000);
    }
  };

  return (
    <Dialog open={showReminder} onOpenChange={setShowReminder}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center text-center space-y-6 py-6">
          {/* Griffin with Moon */}
          <div className="relative">
            <img 
              src={griffinLogo} 
              alt="Griffin" 
              className="w-32 h-32 object-cover rounded-full animate-gentle-bounce"
            />
            <Moon className="absolute -top-2 -right-2 w-12 h-12 text-primary animate-pulse" />
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Time for Sleep! 🌙
            </h2>
            <p className="text-xl text-foreground">
              It's time to sleep, my dear friend
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Sparkles className="w-5 h-5 text-secondary" />
              <p>Sweet dreams await you! ✨</p>
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
          </div>

          {/* Animated Stars */}
          <div className="flex gap-4">
            <span className="text-4xl animate-bounce" style={{ animationDelay: "0s" }}>⭐</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: "0.2s" }}>🌟</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: "0.4s" }}>💫</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SleepReminderNotification;
