-- Create function to handle new parent user signups
CREATE OR REPLACE FUNCTION public.handle_new_parent_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.parents (user_id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create function to handle new child user signups
CREATE OR REPLACE FUNCTION public.handle_new_child_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.children (user_id, child_name, avatar_type)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'child_name',
    COALESCE(NEW.raw_user_meta_data->>'avatar_type', 'penguin')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for parent signups (fires when user_type = 'parent')
CREATE OR REPLACE TRIGGER on_auth_parent_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'user_type' = 'parent')
  EXECUTE FUNCTION public.handle_new_parent_user();

-- Create trigger for child signups (fires when user_type = 'child')
CREATE OR REPLACE TRIGGER on_auth_child_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'user_type' = 'child')
  EXECUTE FUNCTION public.handle_new_child_user();