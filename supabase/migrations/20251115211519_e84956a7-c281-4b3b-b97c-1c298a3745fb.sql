-- Fix function search_path mutable warning by setting search_path on existing functions

-- Update update_updated_at_column function to set search_path
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers that were dropped
CREATE TRIGGER update_children_updated_at
BEFORE UPDATE ON public.children
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parents_updated_at
BEFORE UPDATE ON public.parents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pill_reminders_updated_at
BEFORE UPDATE ON public.pill_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sleep_settings_updated_at
BEFORE UPDATE ON public.sleep_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_garden_stats_updated_at
BEFORE UPDATE ON public.daily_garden_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();