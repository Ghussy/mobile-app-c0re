create sequence "public"."activity_logs_id_seq";

create table "public"."activity_logs" (
    "id" integer not null default nextval('activity_logs_id_seq'::regclass),
    "user_id" uuid not null,
    "activity_id" integer not null,
    "completed_at" timestamp with time zone not null default now(),
    "notes" text
);


alter table "public"."activity_logs" enable row level security;

create table "public"."gyms" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "name" text not null,
    "latitude" double precision not null,
    "longitude" double precision not null,
    "radius_m" integer default 100,
    "address" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted" boolean not null default false
);


create table "public"."user_streaks" (
    "id" uuid not null,
    "current" integer default 0,
    "longest" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "deleted" boolean default false,
    "weekly_goal" integer not null default 0
);


alter table "public"."user_streaks" enable row level security;

create table "public"."user_weekly_visits" (
    "id" uuid not null,
    "week_start" date not null,
    "visits" integer not null default 0
);


alter table "public"."user_weekly_visits" enable row level security;

create table "public"."users" (
    "id" uuid not null,
    "discord_name" text,
    "avatar_url" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted" boolean default false,
    "name" text
);


alter table "public"."users" enable row level security;

create table "public"."visits" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "gym_id" uuid,
    "entered_at" timestamp with time zone not null,
    "exited_at" timestamp with time zone,
    "source" text default 'auto'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "deleted" boolean default false
);


alter sequence "public"."activity_logs_id_seq" owned by "public"."activity_logs"."id";

CREATE UNIQUE INDEX activity_logs_pkey ON public.activity_logs USING btree (id);

CREATE UNIQUE INDEX gyms_pkey ON public.gyms USING btree (id);

CREATE INDEX idx_activity_logs_activity ON public.activity_logs USING btree (activity_id);

CREATE INDEX idx_activity_logs_user_completed ON public.activity_logs USING btree (user_id, completed_at);

CREATE UNIQUE INDEX user_streaks_pkey ON public.user_streaks USING btree (id);

CREATE UNIQUE INDEX user_weekly_visits_pkey ON public.user_weekly_visits USING btree (id, week_start);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX visits_pkey ON public.visits USING btree (id);

alter table "public"."activity_logs" add constraint "activity_logs_pkey" PRIMARY KEY using index "activity_logs_pkey";

alter table "public"."gyms" add constraint "gyms_pkey" PRIMARY KEY using index "gyms_pkey";

alter table "public"."user_streaks" add constraint "user_streaks_pkey" PRIMARY KEY using index "user_streaks_pkey";

alter table "public"."user_weekly_visits" add constraint "user_weekly_visits_pkey" PRIMARY KEY using index "user_weekly_visits_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."visits" add constraint "visits_pkey" PRIMARY KEY using index "visits_pkey";

alter table "public"."activity_logs" add constraint "activity_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."activity_logs" validate constraint "activity_logs_user_id_fkey";

alter table "public"."gyms" add constraint "gyms_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."gyms" validate constraint "gyms_user_id_fkey";

alter table "public"."user_streaks" add constraint "user_streaks_id_fkey" FOREIGN KEY (id) REFERENCES users(id) not valid;

alter table "public"."user_streaks" validate constraint "user_streaks_id_fkey";

alter table "public"."user_weekly_visits" add constraint "user_weekly_visits_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_weekly_visits" validate constraint "user_weekly_visits_id_fkey";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

alter table "public"."visits" add constraint "visits_gym_id_fkey" FOREIGN KEY (gym_id) REFERENCES gyms(id) ON DELETE CASCADE not valid;

alter table "public"."visits" validate constraint "visits_gym_id_fkey";

alter table "public"."visits" add constraint "visits_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."visits" validate constraint "visits_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.f_visit_after_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
    v_week_start date := date_trunc('week', new.entered_at)::date; -- Monday 00:00
    v_goal       int;
    v_visits     int;
begin
    ------------------------------------------------------------------
    -- 1.  Upsert the per-week counter (count distinct visit days)
    ------------------------------------------------------------------
    insert into public.user_weekly_visits (user_id, week_start, visits)
    values (new.user_id, v_week_start, 1)
    on conflict (user_id, week_start) do
      update
      set visits = greatest(
            excluded.visits,
            public.user_weekly_visits.visits +         -- existing
            (case                                    -- only +1 once per calendar-day
                 when
                   not exists (
                     select 1
                     from public.visits v
                     where v.user_id = new.user_id
                       and date_trunc('day', v.entered_at)
                               = date_trunc('day', new.entered_at)
                   )
                 then 1 else 0
             end)
          );

    ------------------------------------------------------------------
    -- 2.  Get the user’s weekly goal
    ------------------------------------------------------------------
    select weekly_goal
      into v_goal
      from public.user_streaks
     where user_id = new.user_id;

    if v_goal is null or v_goal = 0 then
        return null;      -- nothing more to do
    end if;

    ------------------------------------------------------------------
    -- 3.  If this week just hit the goal → update streak snapshot
    ------------------------------------------------------------------
    select visits
      into v_visits
      from public.user_weekly_visits
     where user_id = new.user_id
       and week_start = v_week_start;

    if v_visits = v_goal then
        -- success for the week – bump streak
        update public.user_streaks
           set current    = current + 1,
               longest    = greatest(longest, current + 1),
               updated_at = now()
         where user_id = new.user_id;

    elsif v_visits = 1 then
        -- first visit of a *new* week – check if we *missed* last week
        if not exists (
            select 1
            from public.user_weekly_visits uw
            where uw.user_id    = new.user_id
              and uw.week_start = v_week_start - interval '7 days'
              and uw.visits     >= v_goal
        ) then
            -- last week failed → reset current streak
            update public.user_streaks
               set current    = 0,
                   updated_at = now()
             where user_id = new.user_id;
        end if;
    end if;

    return null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_rollover_streaks()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
declare
  last_monday date := date_trunc('week', now() - interval '1 day')::date;
begin
  /* 4.A  merge last week’s visit-count into streaks */
  update public.user_streaks us
  set
      current  = case
                   when w.visits >= us.weekly_goal then us.current + 1
                   else 0
                 end,
      longest  = greatest(
                   us.longest,
                   case when w.visits >= us.weekly_goal
                        then us.current + 1 else 0 end),
      updated_at = now()
  from public.user_weekly_visits w
  where w.user_id = us.user_id
    and w.week_start = last_monday;

  /* 4.B  OPTIONAL – zero-row users who never visited last week */
  update public.user_streaks
  set current = 0,
      updated_at = now()
  where updated_at < last_monday;  -- no change this week
end;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_upsert_weekly_visits()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
  wk date := date_trunc('week', new.entered_at)::date;  -- Monday of that week
begin
  insert into public.user_weekly_visits (user_id, week_start, visits)
  values (new.user_id, wk, 1)
  on conflict (user_id, week_start)
  do update set visits = user_weekly_visits.visits + 1;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_leaderboard()
 RETURNS TABLE(rank integer, user_id uuid, display_name text, current_streak integer, streak_goal integer, avatar_url text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY u.current_streak DESC) AS rank,
        u.id,
        u.display_name,
        u.current_streak,
        u.streak_goal,
        u.avatar_url
    FROM 
        public.users u
    WHERE 
        u.current_streak > 0
    ORDER BY 
        u.current_streak DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_activity_streaks(p_user_id uuid DEFAULT auth.uid())
 RETURNS TABLE(activity_id integer, activity_name text, streak_goal integer, current_streak integer, longest_streak integer, this_week_count integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    current_week DATE := date_trunc('week', CURRENT_DATE)::DATE;
BEGIN
    RETURN QUERY
    SELECT 
        a.id AS activity_id,
        a.name AS activity_name,
        s.streak_goal,
        s.current_streak,
        s.longest_streak,
        COALESCE(
            (SELECT COUNT(*)::INTEGER 
             FROM public.activity_logs al 
             WHERE al.user_id = p_user_id 
               AND al.activity_id = a.id
               AND date_trunc('week', al.completed_at)::DATE = current_week),
            0
        ) AS this_week_count
    FROM 
        public.activities a
    LEFT JOIN 
        public.activity_streaks s ON s.activity_id = a.id AND s.user_id = p_user_id
    WHERE 
        s.id IS NOT NULL OR EXISTS (
            SELECT 1 FROM public.activity_logs al 
            WHERE al.user_id = p_user_id AND al.activity_id = a.id
        )
    ORDER BY 
        a.name;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.users (id, discord_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'global_name',   -- newer Discord field
             new.raw_user_meta_data->>'full_name',     -- fallback
             'anon'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict do nothing;
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_times()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_at := NOW();
    NEW.updated_at := NOW();
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.updated_at := NOW();
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at := now();
  return new;
end; $function$
;

CREATE OR REPLACE FUNCTION public.init_user_streak()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO public.user_streaks (id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_activity_streak()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    current_week DATE := date_trunc('week', CURRENT_DATE)::DATE;
    activities_this_week INTEGER;
    weekly_goal INTEGER;
    last_completed_week DATE;
    streak_record RECORD;
BEGIN
    -- Get or create activity streak record
    SELECT * INTO streak_record
    FROM public.activity_streaks
    WHERE user_id = NEW.user_id AND activity_id = NEW.activity_id;
    
    IF NOT FOUND THEN
        -- Create new streak record
        INSERT INTO public.activity_streaks (
            user_id, activity_id, streak_goal, current_streak, longest_streak
        ) VALUES (
            NEW.user_id, NEW.activity_id, 3, 0, 0
        )
        RETURNING * INTO streak_record;
    END IF;
    
    -- Count activities for this week
    SELECT COUNT(*) INTO activities_this_week
    FROM public.activity_logs
    WHERE user_id = NEW.user_id
      AND activity_id = NEW.activity_id
      AND date_trunc('week', completed_at)::DATE = current_week;
      
    -- If user just reached their weekly goal
    IF activities_this_week >= streak_record.streak_goal THEN
        -- If this is their first completed week or the last completed week is not this week
        IF streak_record.last_completed_week IS NULL OR streak_record.last_completed_week != current_week THEN
            -- If the last completed week was the previous week
            IF streak_record.last_completed_week IS NULL OR streak_record.last_completed_week = (current_week - INTERVAL '7 days')::DATE THEN
                -- Increment streak for consecutive weeks
                UPDATE public.activity_streaks 
                SET current_streak = current_streak + 1,
                    longest_streak = GREATEST(longest_streak, current_streak + 1),
                    last_completed_week = current_week,
                    updated_at = NOW()
                WHERE id = streak_record.id;
            ELSE
                -- Gap in weeks, reset streak to 1
                UPDATE public.activity_streaks 
                SET current_streak = 1,
                    longest_streak = GREATEST(longest_streak, 1),
                    last_completed_week = current_week,
                    updated_at = NOW()
                WHERE id = streak_record.id;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_modified_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_streak()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    current_week DATE := date_trunc('week', CURRENT_DATE);
    activities_this_week INTEGER;
    weekly_goal INTEGER;
    last_completed_week DATE;
BEGIN
    -- Get user's weekly goal
    SELECT streak_goal INTO weekly_goal
    FROM public.users
    WHERE id = NEW.user_id;
    
    -- Count activities for this week
    SELECT COUNT(*) INTO activities_this_week
    FROM public.activity_logs
    WHERE user_id = NEW.user_id
      AND date_trunc('week', completed_at) = current_week;
      
    -- If user just reached their weekly goal
    IF activities_this_week = weekly_goal THEN
        -- Find the last week they completed their goal (before this week)
        SELECT MAX(week)::DATE INTO last_completed_week
        FROM (
            SELECT date_trunc('week', completed_at) as week, COUNT(*) as count
            FROM public.activity_logs
            WHERE user_id = NEW.user_id
              AND date_trunc('week', completed_at) < current_week
            GROUP BY week
            HAVING COUNT(*) >= weekly_goal
            ORDER BY week DESC
            LIMIT 1
        ) AS last_complete;
        
        -- If this is their first completed week or if the last completed week was the previous week
        IF last_completed_week IS NULL THEN
            -- Reset streak to 1 (first week completed)
            UPDATE public.users 
            SET current_streak = 1,
                longest_streak = GREATEST(longest_streak, 1),
                updated_at = NOW()
            WHERE id = NEW.user_id;
        ELSIF last_completed_week = (current_week - INTERVAL '7 days')::DATE THEN
            -- Increment streak for consecutive weeks
            UPDATE public.users 
            SET current_streak = current_streak + 1,
                longest_streak = GREATEST(longest_streak, current_streak + 1),
                updated_at = NOW()
            WHERE id = NEW.user_id;
        ELSE
            -- Gap in weeks, reset streak to 1
            UPDATE public.users 
            SET current_streak = 1,
                longest_streak = GREATEST(longest_streak, 1),
                updated_at = NOW()
            WHERE id = NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."activity_logs" to "anon";

grant insert on table "public"."activity_logs" to "anon";

grant references on table "public"."activity_logs" to "anon";

grant select on table "public"."activity_logs" to "anon";

grant trigger on table "public"."activity_logs" to "anon";

grant truncate on table "public"."activity_logs" to "anon";

grant update on table "public"."activity_logs" to "anon";

grant delete on table "public"."activity_logs" to "authenticated";

grant insert on table "public"."activity_logs" to "authenticated";

grant references on table "public"."activity_logs" to "authenticated";

grant select on table "public"."activity_logs" to "authenticated";

grant trigger on table "public"."activity_logs" to "authenticated";

grant truncate on table "public"."activity_logs" to "authenticated";

grant update on table "public"."activity_logs" to "authenticated";

grant delete on table "public"."activity_logs" to "service_role";

grant insert on table "public"."activity_logs" to "service_role";

grant references on table "public"."activity_logs" to "service_role";

grant select on table "public"."activity_logs" to "service_role";

grant trigger on table "public"."activity_logs" to "service_role";

grant truncate on table "public"."activity_logs" to "service_role";

grant update on table "public"."activity_logs" to "service_role";

grant delete on table "public"."gyms" to "anon";

grant insert on table "public"."gyms" to "anon";

grant references on table "public"."gyms" to "anon";

grant select on table "public"."gyms" to "anon";

grant trigger on table "public"."gyms" to "anon";

grant truncate on table "public"."gyms" to "anon";

grant update on table "public"."gyms" to "anon";

grant delete on table "public"."gyms" to "authenticated";

grant insert on table "public"."gyms" to "authenticated";

grant references on table "public"."gyms" to "authenticated";

grant select on table "public"."gyms" to "authenticated";

grant trigger on table "public"."gyms" to "authenticated";

grant truncate on table "public"."gyms" to "authenticated";

grant update on table "public"."gyms" to "authenticated";

grant delete on table "public"."gyms" to "service_role";

grant insert on table "public"."gyms" to "service_role";

grant references on table "public"."gyms" to "service_role";

grant select on table "public"."gyms" to "service_role";

grant trigger on table "public"."gyms" to "service_role";

grant truncate on table "public"."gyms" to "service_role";

grant update on table "public"."gyms" to "service_role";

grant delete on table "public"."user_streaks" to "anon";

grant insert on table "public"."user_streaks" to "anon";

grant references on table "public"."user_streaks" to "anon";

grant select on table "public"."user_streaks" to "anon";

grant trigger on table "public"."user_streaks" to "anon";

grant truncate on table "public"."user_streaks" to "anon";

grant update on table "public"."user_streaks" to "anon";

grant delete on table "public"."user_streaks" to "authenticated";

grant insert on table "public"."user_streaks" to "authenticated";

grant references on table "public"."user_streaks" to "authenticated";

grant select on table "public"."user_streaks" to "authenticated";

grant trigger on table "public"."user_streaks" to "authenticated";

grant truncate on table "public"."user_streaks" to "authenticated";

grant update on table "public"."user_streaks" to "authenticated";

grant insert on table "public"."user_streaks" to "authenticator";

grant delete on table "public"."user_streaks" to "service_role";

grant insert on table "public"."user_streaks" to "service_role";

grant references on table "public"."user_streaks" to "service_role";

grant select on table "public"."user_streaks" to "service_role";

grant trigger on table "public"."user_streaks" to "service_role";

grant truncate on table "public"."user_streaks" to "service_role";

grant update on table "public"."user_streaks" to "service_role";

grant insert on table "public"."user_streaks" to "supabase_auth_admin";

grant delete on table "public"."user_weekly_visits" to "anon";

grant insert on table "public"."user_weekly_visits" to "anon";

grant references on table "public"."user_weekly_visits" to "anon";

grant select on table "public"."user_weekly_visits" to "anon";

grant trigger on table "public"."user_weekly_visits" to "anon";

grant truncate on table "public"."user_weekly_visits" to "anon";

grant update on table "public"."user_weekly_visits" to "anon";

grant delete on table "public"."user_weekly_visits" to "authenticated";

grant insert on table "public"."user_weekly_visits" to "authenticated";

grant references on table "public"."user_weekly_visits" to "authenticated";

grant select on table "public"."user_weekly_visits" to "authenticated";

grant trigger on table "public"."user_weekly_visits" to "authenticated";

grant truncate on table "public"."user_weekly_visits" to "authenticated";

grant update on table "public"."user_weekly_visits" to "authenticated";

grant delete on table "public"."user_weekly_visits" to "service_role";

grant insert on table "public"."user_weekly_visits" to "service_role";

grant references on table "public"."user_weekly_visits" to "service_role";

grant select on table "public"."user_weekly_visits" to "service_role";

grant trigger on table "public"."user_weekly_visits" to "service_role";

grant truncate on table "public"."user_weekly_visits" to "service_role";

grant update on table "public"."user_weekly_visits" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

grant delete on table "public"."visits" to "anon";

grant insert on table "public"."visits" to "anon";

grant references on table "public"."visits" to "anon";

grant select on table "public"."visits" to "anon";

grant trigger on table "public"."visits" to "anon";

grant truncate on table "public"."visits" to "anon";

grant update on table "public"."visits" to "anon";

grant delete on table "public"."visits" to "authenticated";

grant insert on table "public"."visits" to "authenticated";

grant references on table "public"."visits" to "authenticated";

grant select on table "public"."visits" to "authenticated";

grant trigger on table "public"."visits" to "authenticated";

grant truncate on table "public"."visits" to "authenticated";

grant update on table "public"."visits" to "authenticated";

grant delete on table "public"."visits" to "service_role";

grant insert on table "public"."visits" to "service_role";

grant references on table "public"."visits" to "service_role";

grant select on table "public"."visits" to "service_role";

grant trigger on table "public"."visits" to "service_role";

grant truncate on table "public"."visits" to "service_role";

grant update on table "public"."visits" to "service_role";

create policy "activity_logs_delete_policy"
on "public"."activity_logs"
as permissive
for delete
to public
using ((auth.uid() = user_id));


create policy "activity_logs_insert_policy"
on "public"."activity_logs"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "activity_logs_read_policy"
on "public"."activity_logs"
as permissive
for select
to public
using (true);


create policy "activity_logs_update_policy"
on "public"."activity_logs"
as permissive
for update
to public
using ((auth.uid() = user_id));


create policy "Allow inserts from triggers"
on "public"."user_streaks"
as permissive
for insert
to public
with check (((auth.uid() = id) OR (auth.uid() IS NULL)));


create policy "Allow user or trigger updates on streaks"
on "public"."user_streaks"
as permissive
for update
to public
using (((auth.uid() = id) OR (auth.uid() IS NULL)))
with check (((auth.uid() = id) OR (auth.uid() IS NULL)));


create policy "user can insert own streak row"
on "public"."user_streaks"
as permissive
for insert
to public
with check ((auth.uid() = id));


create policy "user can read own streak row"
on "public"."user_streaks"
as permissive
for select
to authenticated
using ((auth.uid() = id));


create policy "select own weekly visits"
on "public"."user_weekly_visits"
as permissive
for select
to public
using ((id = auth.uid()));


create policy "No direct inserts"
on "public"."users"
as permissive
for insert
to public
with check (false);


create policy "Users can update themselves"
on "public"."users"
as permissive
for update
to public
using (((id = auth.uid()) AND (deleted IS NOT TRUE)))
with check ((id = auth.uid()));


create policy "Users can view themselves"
on "public"."users"
as permissive
for select
to public
using (((id = auth.uid()) AND (deleted IS NOT TRUE)));


create policy "users_insert_policy"
on "public"."users"
as permissive
for insert
to public
with check ((auth.uid() = id));


create policy "users_read_policy"
on "public"."users"
as permissive
for select
to public
using (true);


create policy "users_update_policy"
on "public"."users"
as permissive
for update
to public
using ((auth.uid() = id));


CREATE TRIGGER update_activity_streak_on_log AFTER INSERT ON public.activity_logs FOR EACH ROW EXECUTE FUNCTION update_activity_streak();

CREATE TRIGGER update_streak_on_activity_log AFTER INSERT ON public.activity_logs FOR EACH ROW EXECUTE FUNCTION update_user_streak();

CREATE TRIGGER handle_times BEFORE INSERT OR UPDATE ON public.gyms FOR EACH ROW EXECUTE FUNCTION handle_times();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_streaks FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER create_streak_after_user_profile_created AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION init_user_streak();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.visits FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trg_upsert_weekly_visits AFTER INSERT ON public.visits FOR EACH ROW EXECUTE FUNCTION fn_upsert_weekly_visits();

CREATE TRIGGER trg_visit_after_insert AFTER INSERT ON public.visits FOR EACH ROW EXECUTE FUNCTION f_visit_after_insert();


