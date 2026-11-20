-- Copy this file to seed.local.sql, which git ignores, to invite addresses
-- from outside SAIT on your local stack, such as your own. Then
-- `supabase db reset --yes` loads it after seed.sql.
insert into public.invited_emails (email) values
  ('you@example.com');
