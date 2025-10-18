-- Create badges table for parent-to-child encouragement
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Children can view their own badges
CREATE POLICY "Children can view their own badges"
ON public.badges
FOR SELECT
USING (child_id IN (
  SELECT id FROM children WHERE user_id = auth.uid()
));

-- Parents can insert badges for their children
CREATE POLICY "Parents can insert badges for their children"
ON public.badges
FOR INSERT
WITH CHECK (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT id FROM parents WHERE user_id = auth.uid()
  )
));

-- Parents can view badges they sent to their children
CREATE POLICY "Parents can view their children's badges"
ON public.badges
FOR SELECT
USING (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT id FROM parents WHERE user_id = auth.uid()
  )
));