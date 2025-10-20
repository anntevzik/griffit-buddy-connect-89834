import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Pill, Clock, Plus, Trash2 } from "lucide-react";

interface PillReminderSettingsProps {
  childId: string;
  childName: string;
}

interface PillReminder {
  id: string;
  pill_name: string;
  reminder_time: string;
  notes: string | null;
  enabled: boolean;
}

const PillReminderSettings = ({ childId, childName }: PillReminderSettingsProps) => {
  const { toast } = useToast();
  const [reminders, setReminders] = useState<PillReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReminder, setNewReminder] = useState({
    pill_name: "",
    reminder_time: "09:00",
    notes: "",
    enabled: true,
  });

  useEffect(() => {
    loadReminders();
  }, [childId]);

  const loadReminders = async () => {
    const { data } = await supabase
      .from('pill_reminders')
      .select('*')
      .eq('child_id', childId)
      .order('reminder_time');

    if (data) {
      setReminders(data.map(r => ({
        ...r,
        reminder_time: r.reminder_time.slice(0, 5)
      })));
    }
    setLoading(false);
  };

  const addReminder = async () => {
    if (!newReminder.pill_name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a pill name",
        variant: "destructive",
      });
      return;
    }

    try {
      await supabase
        .from('pill_reminders')
        .insert({
          child_id: childId,
          pill_name: newReminder.pill_name,
          reminder_time: newReminder.reminder_time + ':00',
          notes: newReminder.notes || null,
          enabled: newReminder.enabled,
        });

      toast({
        title: "Reminder Added! 💊",
        description: `${newReminder.pill_name} reminder set for ${newReminder.reminder_time}`,
      });

      setNewReminder({
        pill_name: "",
        reminder_time: "09:00",
        notes: "",
        enabled: true,
      });

      loadReminders();
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast({
        title: "Error",
        description: "Failed to add reminder",
        variant: "destructive",
      });
    }
  };

  const updateReminder = async (id: string, updates: Partial<PillReminder>) => {
    try {
      const updateData: any = { ...updates };
      if (updates.reminder_time) {
        updateData.reminder_time = updates.reminder_time + ':00';
      }

      await supabase
        .from('pill_reminders')
        .update(updateData)
        .eq('id', id);

      toast({
        title: "Updated! ✓",
        description: "Reminder updated successfully",
      });

      loadReminders();
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive",
      });
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await supabase
        .from('pill_reminders')
        .delete()
        .eq('id', id);

      toast({
        title: "Deleted",
        description: "Reminder removed",
      });

      loadReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive",
      });
    }
  };

  if (loading) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="flex items-center gap-3 mb-6">
        <Pill className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-primary">Pill Reminders</h2>
          <p className="text-sm text-muted-foreground">Manage medication reminders for {childName}</p>
        </div>
      </div>

      {/* Existing Reminders */}
      {reminders.length > 0 && (
        <div className="space-y-4 mb-6">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="p-4 bg-background rounded-lg border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={reminder.pill_name}
                      onChange={(e) => updateReminder(reminder.id, { pill_name: e.target.value })}
                      className="font-semibold"
                    />
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={(enabled) => updateReminder(reminder.id, { enabled })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={reminder.reminder_time}
                      onChange={(e) => updateReminder(reminder.id, { reminder_time: e.target.value })}
                    />
                  </div>
                  {reminder.notes && (
                    <p className="text-sm text-muted-foreground">{reminder.notes}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteReminder(reminder.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Reminder */}
      <div className="space-y-4 p-4 bg-background rounded-lg border">
        <h3 className="font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Reminder
        </h3>
        
        <div className="space-y-2">
          <Label htmlFor="pill-name">Pill Name</Label>
          <Input
            id="pill-name"
            placeholder="e.g., Vitamin D, Antibiotic..."
            value={newReminder.pill_name}
            onChange={(e) => setNewReminder({ ...newReminder, pill_name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminder-time" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Reminder Time
          </Label>
          <Input
            id="reminder-time"
            type="time"
            value={newReminder.reminder_time}
            onChange={(e) => setNewReminder({ ...newReminder, reminder_time: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Dosage, instructions, etc..."
            value={newReminder.notes}
            onChange={(e) => setNewReminder({ ...newReminder, notes: e.target.value })}
            rows={2}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="enabled">Enable Reminder</Label>
            <Switch
              id="enabled"
              checked={newReminder.enabled}
              onCheckedChange={(enabled) => setNewReminder({ ...newReminder, enabled })}
            />
          </div>
          <Button onClick={addReminder} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Reminder
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PillReminderSettings;
