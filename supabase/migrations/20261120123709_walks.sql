-- Who may see what, enforced by the database itself (row-level security):
--
--                         poster   buddy    other student   signed out
-- the walk                 yes      yes      yes             no
-- where it starts          ~100 m   ~100 m   ~100 m          no
-- the meeting point        yes      yes      no              no
-- the requests to join     all      own      own             no
--
-- src/api/walks.integration.test.ts checks every cell.

-- A student's public face: a first name, never the email.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Students can see each other's names"
  on public.profiles for select to authenticated
  using (true);

create policy "Students can rename themselves"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

revoke update on public.profiles from authenticated;
grant update (name) on public.profiles to authenticated;

-- Every new account gets a profile, named after the first word of its full
-- name or, without one, of its email: aiko.tanaka@edu.sait.ca is "Aiko".
create function public.create_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source text := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    split_part(new.email, '@', 1)
  );
begin
  insert into public.profiles (id, name)
  values (new.id, initcap(left(split_part(regexp_replace(v_source, '[._-]', ' ', 'g'), ' ', 1), 40)));
  return new;
end;
$$;

revoke execute on function public.create_profile() from public, anon, authenticated;

create trigger create_profile
  after insert on auth.users
  for each row execute function public.create_profile();

-- A walk. The start is stored with three decimals, about 100 m: close enough
-- to find walks nearby, too coarse to find anyone's home. The column can't
-- hold more, so the app can't leak more even by mistake.
create table public.walks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  from_place text not null check (char_length(from_place) between 2 and 80),
  to_place text not null check (char_length(to_place) between 2 and 80),
  departs_at timestamptz not null,
  notes text not null default '' check (char_length(notes) <= 280),
  start_lat numeric(5, 3) not null check (start_lat between -90 and 90),
  start_lng numeric(6, 3) not null check (start_lng between -180 and 180),
  created_at timestamptz not null default now()
);

create index walks_departs_at_idx on public.walks (departs_at);
create index walks_user_id_idx on public.walks (user_id);

alter table public.walks enable row level security;

create policy "Students can see walks"
  on public.walks for select to authenticated
  using (true);

-- Within the next week, so the list stays about walks that will happen.
create policy "Students can post their own walks"
  on public.walks for insert to authenticated
  with check (
    user_id = auth.uid()
    and departs_at > now()
    and departs_at < now() + interval '7 days'
  );

create policy "Posters can cancel their walks"
  on public.walks for delete to authenticated
  using (user_id = auth.uid());

-- Where exactly to meet, apart from the walk, so its own rules can hide it
-- from everyone but the poster and the accepted buddies.
create table public.meeting_points (
  walk_id uuid primary key references public.walks (id) on delete cascade,
  details text not null check (char_length(details) between 2 and 140)
);

alter table public.meeting_points enable row level security;

-- A request to join a walk. Only its status changes, and only the poster
-- changes it.
create table public.walk_requests (
  id uuid primary key default gen_random_uuid(),
  walk_id uuid not null references public.walks (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  unique (walk_id, user_id)
);

create index walk_requests_user_id_idx on public.walk_requests (user_id);

alter table public.walk_requests enable row level security;

-- Security definer, so the policies below can ask about a walk or a request
-- without the rules of one table calling the other's back.
create function public.is_walk_poster(p_walk_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.walks where id = p_walk_id and user_id = auth.uid()
  );
$$;

create function public.is_walk_buddy(p_walk_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.walk_requests
    where walk_id = p_walk_id and user_id = auth.uid() and status = 'accepted'
  );
$$;

revoke execute on function public.is_walk_poster(uuid) from public, anon;
revoke execute on function public.is_walk_buddy(uuid) from public, anon;
grant execute on function public.is_walk_poster(uuid) to authenticated;
grant execute on function public.is_walk_buddy(uuid) to authenticated;

create policy "Posters and buddies can see where to meet"
  on public.meeting_points for select to authenticated
  using (public.is_walk_poster(walk_id) or public.is_walk_buddy(walk_id));

create policy "Posters can set where to meet"
  on public.meeting_points for insert to authenticated
  with check (public.is_walk_poster(walk_id));

create policy "Requesters and posters can see requests"
  on public.walk_requests for select to authenticated
  using (user_id = auth.uid() or public.is_walk_poster(walk_id));

create policy "Students can ask to join others' upcoming walks"
  on public.walk_requests for insert to authenticated
  with check (
    user_id = auth.uid()
    and status = 'pending'
    and not public.is_walk_poster(walk_id)
    and exists (
      select 1 from public.walks where id = walk_id and departs_at > now()
    )
  );

create policy "Posters can answer requests"
  on public.walk_requests for update to authenticated
  using (public.is_walk_poster(walk_id))
  with check (status in ('accepted', 'declined'));

create policy "Requesters can withdraw"
  on public.walk_requests for delete to authenticated
  using (user_id = auth.uid());

-- The status is the only column anyone may change.
revoke update on public.walk_requests from authenticated;
grant update (status) on public.walk_requests to authenticated;

-- Posting a walk and its meeting point together: both or neither. Security
-- invoker, so the policies above still decide.
create function public.post_walk(
  p_from_place text,
  p_to_place text,
  p_departs_at timestamptz,
  p_start_lat numeric,
  p_start_lng numeric,
  p_meeting_point text,
  p_notes text default ''
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_walk_id uuid;
begin
  insert into public.walks (from_place, to_place, departs_at, start_lat, start_lng, notes)
  values (p_from_place, p_to_place, p_departs_at, p_start_lat, p_start_lng, coalesce(p_notes, ''))
  returning id into v_walk_id;

  insert into public.meeting_points (walk_id, details)
  values (v_walk_id, p_meeting_point);

  return v_walk_id;
end;
$$;

revoke execute on function public.post_walk(text, text, timestamptz, numeric, numeric, text, text) from public, anon;
grant execute on function public.post_walk(text, text, timestamptz, numeric, numeric, text, text) to authenticated;

-- The distance in metres between two points, along the Earth's surface.
create function public.distance_m(
  p_lat1 double precision,
  p_lng1 double precision,
  p_lat2 double precision,
  p_lng2 double precision
)
returns double precision
language sql
immutable
as $$
  select 2 * 6371000 * asin(sqrt(
    power(sin(radians(p_lat2 - p_lat1) / 2), 2)
    + cos(radians(p_lat1)) * cos(radians(p_lat2))
      * power(sin(radians(p_lng2 - p_lng1) / 2), 2)
  ));
$$;

-- Walks starting within p_radius_m of a point and leaving in the next
-- p_within_minutes (or in the last five: a late walker still counts), with
-- the caller's own request, if any. Security invoker: it sees what the caller
-- may see, no more.
create function public.nearby_walks(
  p_lat double precision,
  p_lng double precision,
  p_radius_m integer default 1000,
  p_within_minutes integer default 60
)
returns table (
  id uuid,
  from_place text,
  to_place text,
  departs_at timestamptz,
  notes text,
  poster_name text,
  distance_m integer,
  is_mine boolean,
  request_status text
)
language sql
stable
security invoker
set search_path = public
as $$
  select * from (
    select
      w.id,
      w.from_place,
      w.to_place,
      w.departs_at,
      w.notes,
      p.name,
      round(public.distance_m(p_lat, p_lng, w.start_lat, w.start_lng))::integer,
      w.user_id = auth.uid(),
      r.status
    from public.walks w
    join public.profiles p on p.id = w.user_id
    left join public.walk_requests r on r.walk_id = w.id and r.user_id = auth.uid()
    where w.departs_at between now() - interval '5 minutes'
      and now() + make_interval(mins => least(p_within_minutes, 24 * 60))
  ) as candidates (id, from_place, to_place, departs_at, notes, poster_name, distance_m, is_mine, request_status)
  where distance_m <= least(p_radius_m, 5000)
  order by departs_at;
$$;

revoke execute on function public.nearby_walks(double precision, double precision, integer, integer) from public, anon;
grant execute on function public.nearby_walks(double precision, double precision, integer, integer) to authenticated;
