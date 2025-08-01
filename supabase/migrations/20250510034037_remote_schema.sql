create sequence "public"."activities_id_seq";

drop trigger if exists "handle_times" on "public"."gyms";

revoke delete on table "public"."gyms" from "anon";

revoke insert on table "public"."gyms" from "anon";

revoke references on table "public"."gyms" from "anon";

revoke select on table "public"."gyms" from "anon";

revoke trigger on table "public"."gyms" from "anon";

revoke truncate on table "public"."gyms" from "anon";

revoke update on table "public"."gyms" from "anon";

revoke delete on table "public"."gyms" from "authenticated";

revoke insert on table "public"."gyms" from "authenticated";

revoke references on table "public"."gyms" from "authenticated";

revoke select on table "public"."gyms" from "authenticated";

revoke trigger on table "public"."gyms" from "authenticated";

revoke truncate on table "public"."gyms" from "authenticated";

revoke update on table "public"."gyms" from "authenticated";

revoke delete on table "public"."gyms" from "service_role";

revoke insert on table "public"."gyms" from "service_role";

revoke references on table "public"."gyms" from "service_role";

revoke select on table "public"."gyms" from "service_role";

revoke trigger on table "public"."gyms" from "service_role";

revoke truncate on table "public"."gyms" from "service_role";

revoke update on table "public"."gyms" from "service_role";

alter table "public"."gyms" drop constraint "gyms_user_id_fkey";

alter table "public"."visits" drop constraint "visits_gym_id_fkey";

drop function if exists "public"."get_leaderboard"();

alter table "public"."gyms" drop constraint "gyms_pkey";

drop index if exists "public"."gyms_pkey";

drop table "public"."gyms";

create table "public"."activities" (
    "id" integer not null default nextval('activities_id_seq'::regclass),
    "name" text not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."activities" enable row level security;

create table "public"."locations" (
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


alter sequence "public"."activities_id_seq" owned by "public"."activities"."id";

CREATE UNIQUE INDEX activities_name_key ON public.activities USING btree (name);

CREATE UNIQUE INDEX activities_pkey ON public.activities USING btree (id);

CREATE UNIQUE INDEX locations_pkey ON public.locations USING btree (id);

alter table "public"."activities" add constraint "activities_pkey" PRIMARY KEY using index "activities_pkey";

alter table "public"."locations" add constraint "locations_pkey" PRIMARY KEY using index "locations_pkey";

alter table "public"."activities" add constraint "activities_name_key" UNIQUE using index "activities_name_key";

alter table "public"."locations" add constraint "gyms_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."locations" validate constraint "gyms_user_id_fkey";

alter table "public"."visits" add constraint "visits_gym_id_fkey" FOREIGN KEY (gym_id) REFERENCES locations(id) ON DELETE CASCADE not valid;

alter table "public"."visits" validate constraint "visits_gym_id_fkey";

grant delete on table "public"."activities" to "anon";

grant insert on table "public"."activities" to "anon";

grant references on table "public"."activities" to "anon";

grant select on table "public"."activities" to "anon";

grant trigger on table "public"."activities" to "anon";

grant truncate on table "public"."activities" to "anon";

grant update on table "public"."activities" to "anon";

grant delete on table "public"."activities" to "authenticated";

grant insert on table "public"."activities" to "authenticated";

grant references on table "public"."activities" to "authenticated";

grant select on table "public"."activities" to "authenticated";

grant trigger on table "public"."activities" to "authenticated";

grant truncate on table "public"."activities" to "authenticated";

grant update on table "public"."activities" to "authenticated";

grant delete on table "public"."activities" to "service_role";

grant insert on table "public"."activities" to "service_role";

grant references on table "public"."activities" to "service_role";

grant select on table "public"."activities" to "service_role";

grant trigger on table "public"."activities" to "service_role";

grant truncate on table "public"."activities" to "service_role";

grant update on table "public"."activities" to "service_role";

grant delete on table "public"."locations" to "anon";

grant insert on table "public"."locations" to "anon";

grant references on table "public"."locations" to "anon";

grant select on table "public"."locations" to "anon";

grant trigger on table "public"."locations" to "anon";

grant truncate on table "public"."locations" to "anon";

grant update on table "public"."locations" to "anon";

grant delete on table "public"."locations" to "authenticated";

grant insert on table "public"."locations" to "authenticated";

grant references on table "public"."locations" to "authenticated";

grant select on table "public"."locations" to "authenticated";

grant trigger on table "public"."locations" to "authenticated";

grant truncate on table "public"."locations" to "authenticated";

grant update on table "public"."locations" to "authenticated";

grant delete on table "public"."locations" to "service_role";

grant insert on table "public"."locations" to "service_role";

grant references on table "public"."locations" to "service_role";

grant select on table "public"."locations" to "service_role";

grant trigger on table "public"."locations" to "service_role";

grant truncate on table "public"."locations" to "service_role";

grant update on table "public"."locations" to "service_role";

create policy "Allow admin insert/update/delete for activities"
on "public"."activities"
as permissive
for all
to public
using ((auth.role() = 'service_role'::text))
with check ((auth.role() = 'service_role'::text));


create policy "Allow public read access to activities"
on "public"."activities"
as permissive
for select
to public
using (true);


CREATE TRIGGER handle_times BEFORE INSERT OR UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION handle_times();


