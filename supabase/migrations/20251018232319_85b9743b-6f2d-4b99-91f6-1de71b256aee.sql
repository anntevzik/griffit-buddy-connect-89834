-- Create table for daily garden progress tracking
CREATE TABLE public.daily_garden_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  daily_score INTEGER NOT NULL DEFAULT 0,
  high_score INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_id)
);

-- Enable RLS
ALTER TABLE public.daily_garden_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Children can view their own garden stats" 
ON public.daily_garden_stats 
FOR SELECT 
USING (child_id IN (
  SELECT id FROM children WHERE user_id = auth.uid()
));

CREATE POLICY "Children can insert their own garden stats" 
ON public.daily_garden_stats 
FOR INSERT 
WITH CHECK (child_id IN (
  SELECT id FROM children WHERE user_id = auth.uid()
));

CREATE POLICY "Children can update their own garden stats" 
ON public.daily_garden_stats 
FOR UPDATE 
USING (child_id IN (
  SELECT id FROM children WHERE user_id = auth.uid()
));

CREATE POLICY "Parents can view their children's garden stats" 
ON public.daily_garden_stats 
FOR SELECT 
USING (child_id IN (
  SELECT id FROM children 
  WHERE parent_id IN (
    SELECT id FROM parents WHERE user_id = auth.uid()
  )
));

-- Add trigger for updated_at
CREATE TRIGGER update_daily_garden_stats_updated_at
BEFORE UPDATE ON public.daily_garden_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();