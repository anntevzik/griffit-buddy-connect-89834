-- Create sleep settings table
CREATE TABLE public.sleep_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL UNIQUE,
  bedtime TIME NOT NULL DEFAULT '21:00:00',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sleep_settings ENABLE ROW LEVEL SECURITY;

-- Children can view their own settings
CREATE POLICY "Children can view their own sleep settings"
ON public.sleep_settings
FOR SELECT
USING (child_id IN (
  SELECT id FROM children WHERE user_id = auth.uid()
));

-- Parents can view their children's settings
CREATE POLICY "Parents can view their children's sleep settings"
ON public.sleep_settings
FOR SELECT
USING (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT id FROM parents WHERE user_id = auth.uid()
  )
));

-- Parents can insert settings for their children
CREATE POLICY "Parents can insert sleep settings for their children"
ON public.sleep_settings
FOR INSERT
WITH CHECK (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT id FROM parents WHERE user_id = auth.uid()
  )
));

-- Parents can update their children's settings
CREATE POLICY "Parents can update their children's sleep settings"
ON public.sleep_settings
FOR UPDATE
USING (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT id FROM parents WHERE user_id = auth.uid()
  )
));

-- Enable realtime
ALTER TABLE public.sleep_settings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sleep_settings;

-- Create trigger for updated_at
CREATE TRIGGER update_sleep_settings_updated_at
BEFORE UPDATE ON public.sleep_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();