-- Pushes for the moments that matter: someone asks to join your walk, and the
-- poster answers you. Inserting into notifications is what sends a push (see
-- the push migration); the rows also stay as a history the app can show.
--
-- The texts are in English: storing each student's language is the next step.

create function public.notify_walk_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_walk public.walks;
  v_name text;
begin
  select * into v_walk from public.walks where id = new.walk_id;

  if tg_op = 'INSERT' then
    select name into v_name from public.profiles where id = new.user_id;
    insert into public.notifications (user_id, title, body, url)
    values (
      v_walk.user_id,
      v_name || ' wants to walk with you',
      v_walk.from_place || ' → ' || v_walk.to_place,
      '/walks'
    );
  elsif new.status is distinct from old.status and new.status in ('accepted', 'declined') then
    select name into v_name from public.profiles where id = v_walk.user_id;
    insert into public.notifications (user_id, title, body, url)
    values (
      new.user_id,
      case new.status
        when 'accepted' then v_name || ' accepted: you''re walking together'
        else v_name || ' can''t take you this time'
      end,
      v_walk.from_place || ' → ' || v_walk.to_place,
      '/walks'
    );
  end if;

  return new;
end;
$$;

revoke execute on function public.notify_walk_request() from public, anon, authenticated;

create trigger notify_walk_request
  after insert or update of status on public.walk_requests
  for each row execute function public.notify_walk_request();
