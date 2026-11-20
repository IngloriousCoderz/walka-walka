-- Walka Walka is for SAIT students, and for guests invited by address, such
-- as a teacher. Supabase Auth calls this function before it creates any
-- account (see [auth.hook.before_user_created] in config.toml), so any other
-- address is refused, whichever way it signs up. The app warns about the
-- domains first, only to explain sooner: it can't read the guests.

-- Nobody reads the guests but the hook below: row-level security with no
-- policies hides them from every student. Add one with Studio, the SQL editor
-- or supabase/seed.local.sql (see seed.local.example.sql).
create table public.invited_emails (
  email text primary key check (email = lower(email))
);

alter table public.invited_emails enable row level security;

-- Security definer, to read the guests past their row-level security.
create function public.hook_sait_only(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_email text := lower(event -> 'user' ->> 'email');
begin
  if split_part(v_email, '@', 2) in ('edu.sait.ca', 'sait.ca')
    or exists (select 1 from public.invited_emails where email = v_email) then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'Walka Walka is only for SAIT students and invited guests.'
    )
  );
end;
$$;

-- Only Supabase Auth may call it.
grant execute on function public.hook_sait_only(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_sait_only(jsonb) from public, anon, authenticated;
