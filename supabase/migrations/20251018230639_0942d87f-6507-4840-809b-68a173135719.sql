-- Add table for shared drawings
CREATE TABLE public.shared_drawings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  image_data TEXT NOT NULL,
  ai_analysis TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shared_drawings ENABLE ROW LEVEL SECURITY;

-- Children can insert their own drawings
CREATE POLICY "Children can insert their own drawings"
ON public.shared_drawings
FOR INSERT
WITH CHECK (child_id IN (
  SELECT id FROM children WHERE user_id = auth.uid()
));

-- Children can view their own drawings
CREATE POLICY "Children can view their own drawings"
ON public.shared_drawings
FOR SELECT
USING (child_id IN (
  SELECT id FROM children WHERE user_id = auth.uid()
));

-- Parents can view their children's drawings
CREATE POLICY "Parents can view their children's drawings"
ON public.shared_drawings
FOR SELECT
USING (child_id IN (
  SELECT children.id FROM children
  WHERE children.parent_id IN (
    SELECT id FROM parents WHERE user_id = auth.uid()
  )
));

-- Enable realtime
ALTER TABLE public.shared_drawings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_drawings;