-- What the push trigger calls push-notify with on the local stack: its gateway,
-- as the database container sees it, and the demo key every local stack shares.
-- Applied by `supabase db reset`, so a linked reset takes `--no-seed`.
do $$
begin
  if not exists (
    select 1 from vault.decrypted_secrets where name = 'project_url'
  ) then
    perform vault.create_secret('http://kong:8000', 'project_url');
  end if;
  if not exists (
    select 1 from vault.decrypted_secrets where name = 'service_role_key'
  ) then
    perform vault.create_secret(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
      'service_role_key'
    );
  end if;
end;
$$;

-- Three students to sign in as on the local stack, all with the password
-- walka-local. Local only: `supabase db push` never runs this file.
do $$
declare
  v_student record;
begin
  for v_student in
    select * from (values
      ('aiko.tanaka@edu.sait.ca', 'Aiko Tanaka'),
      ('marcus.brown@edu.sait.ca', 'Marcus Brown'),
      ('priya.sharma@edu.sait.ca', 'Priya Sharma')
    ) as students (email, full_name)
  loop
    if exists (select 1 from auth.users where email = v_student.email) then
      continue;
    end if;

    with new_user as (
      -- raw_app_meta_data must list the email provider, or password sign-in
      -- fails; the empty strings are columns Auth expects not to be null.
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, confirmation_token, recovery_token,
        email_change_token_new, email_change_token_current, email_change,
        phone_change_token, phone_change, reauthentication_token,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      )
      values (
        '00000000-0000-0000-0000-000000000000', gen_random_uuid(),
        'authenticated', 'authenticated', v_student.email,
        extensions.crypt('walka-local', extensions.gen_salt('bf')),
        now(), '', '', '', '', '', '', '', '',
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('full_name', v_student.full_name),
        now(), now()
      )
      returning id, email
    )
    insert into auth.identities (
      user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    )
    select id, jsonb_build_object('sub', id::text, 'email', email), 'email',
      id::text, now(), now(), now()
    from new_user;
  end loop;
end;
$$;

-- Walks around SAIT for the demo, leaving soon after the reset: run
-- `supabase db reset --yes` again for fresh ones. Marcus and Priya post them,
-- so Aiko has someone to join.
do $$
declare
  v_marcus uuid := (select id from auth.users where email = 'marcus.brown@edu.sait.ca');
  v_priya uuid := (select id from auth.users where email = 'priya.sharma@edu.sait.ca');
  v_walk record;
  v_walk_id uuid;
begin
  for v_walk in
    select * from (values
      (v_marcus, 'Kensington, 10 St NW', 'SAIT Heritage Hall', 15, 51.053, -114.088, 'Outside the Plaza Theatre', 'I walk fast, but I''ll wait for you.'),
      (v_priya, 'Sunnyside C-Train station', 'SAIT Stan Grad Centre', 35, 51.060, -114.081, 'Station exit on 2 Ave NW', ''),
      (v_marcus, 'SAIT Heritage Hall', 'Lions Park C-Train station', 50, 51.064, -114.090, 'Main doors of Heritage Hall', 'Late lab, glad of company.'),
      (v_priya, 'Hillhurst, 14 St NW', 'SAIT Senator Burns', 180, 51.058, -114.096, 'Corner of 14 St and 5 Ave NW', '')
    ) as walks (user_id, from_place, to_place, in_minutes, lat, lng, meeting_point, notes)
  loop
    insert into public.walks (user_id, from_place, to_place, departs_at, start_lat, start_lng, notes)
    values (v_walk.user_id, v_walk.from_place, v_walk.to_place, now() + make_interval(mins => v_walk.in_minutes), v_walk.lat, v_walk.lng, v_walk.notes)
    returning id into v_walk_id;

    insert into public.meeting_points (walk_id, details)
    values (v_walk_id, v_walk.meeting_point);
  end loop;
end;
$$;
