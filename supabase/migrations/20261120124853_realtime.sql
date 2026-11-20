-- Tell the app when walks and requests change, so My walks updates by itself
-- when someone asks to join or answers. Realtime applies the tables' row-level
-- security: each student hears only about rows they may see.
alter publication supabase_realtime add table public.walks, public.walk_requests;
