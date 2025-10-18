-- Secure function for child to look up a parent id by email (RLS-safe)
create or replace function public.get_parent_id_by_email(p_email text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.parents
  where lower(email) = lower(p_email)
  limit 1;
$$;

-- Restrict execution to authenticated users
revoke all on function public.get_parent_id_by_email(text) from public;
grant execute on function public.get_parent_id_by_email(text) to authenticated;