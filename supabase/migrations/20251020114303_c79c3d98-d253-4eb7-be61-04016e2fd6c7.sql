-- Create pill_reminders table
CREATE TABLE public.pill_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  pill_name TEXT NOT NULL,
  reminder_time TIME NOT NULL DEFAULT '09:00:00',
  notes TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pill_reminders ENABLE ROW LEVEL SECURITY;

-- Parents can insert pill reminders for their children
CREATE POLICY "Parents can insert pill reminders for their children"
ON public.pill_reminders
FOR INSERT
TO authenticated
WITH CHECK (
  child_id IN (
    SELECT children.id
    FROM children
    WHERE children.parent_id IN (
      SELECT parents.id
      FROM parents
      WHERE parents.user_id = auth.uid()
    )
  )
);

-- Parents can update their children's pill reminders
CREATE POLICY "Parents can update their children's pill reminders"
ON public.pill_reminders
FOR UPDATE
TO authenticated
USING (
  child_id IN (
    SELECT children.id
    FROM children
    WHERE children.parent_id IN (
      SELECT parents.id
      FROM parents
      WHERE parents.user_id = auth.uid()
    )
  )
);

-- Parents can view their children's pill reminders
CREATE POLICY "Parents can view their children's pill reminders"
ON public.pill_reminders
FOR SELECT
TO authenticated
USING (
  child_id IN (
    SELECT children.id
    FROM children
    WHERE children.parent_id IN (
      SELECT parents.id
      FROM parents
      WHERE parents.user_id = auth.uid()
    )
  )
);

-- Parents can delete their children's pill reminders
CREATE POLICY "Parents can delete their children's pill reminders"
ON public.pill_reminders
FOR DELETE
TO authenticated
USING (
  child_id IN (
    SELECT children.id
    FROM children
    WHERE children.parent_id IN (
      SELECT parents.id
      FROM parents
      WHERE parents.user_id = auth.uid()
    )
  )
);

-- Children can view their own pill reminders
CREATE POLICY "Children can view their own pill reminders"
ON public.pill_reminders
FOR SELECT
TO authenticated
USING (
  child_id IN (
    SELECT children.id
    FROM children
    WHERE children.user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_pill_reminders_updated_at
BEFORE UPDATE ON public.pill_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();