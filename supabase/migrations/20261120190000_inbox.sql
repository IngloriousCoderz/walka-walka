-- The notifications that send pushes are also the app's inbox: each student
-- reads their own (the push migration's policy), marks them read, and hears of
-- new ones as they arrive.

alter table public.notifications add column read_at timestamptz;

create index notifications_inbox_idx
  on public.notifications (user_id, created_at desc);

create policy "Users can mark their own notifications read"
  on public.notifications for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Only the read mark: what a notification says is the server's to write.
revoke update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;

alter publication supabase_realtime add table public.notifications;
