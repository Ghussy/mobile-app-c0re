

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."activity_category_enum" AS ENUM (
    'Core',
    'Body',
    'Mind'
);


ALTER TYPE "public"."activity_category_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_rollover_activity_streaks_weekly"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    previous_week_start_date DATE := date_trunc('week', (NOW() AT TIME ZONE 'UTC') - INTERVAL '7 days')::DATE;
    streak_rec public.activity_streaks%ROWTYPE;
    activity_days_in_previous_week INTEGER;
BEGIN
    RAISE NOTICE '[CRON JOB] fn_rollover_activity_streaks_weekly starting for week: %', previous_week_start_date;

    FOR streak_rec IN
        SELECT *
        FROM public.activity_streaks AS s
        WHERE (s.current_streak > 0 OR s.last_completed_week >= (previous_week_start_date - INTERVAL '1 week'))
          AND s.streak_goal > 0
    LOOP
        RAISE NOTICE '[CRON JOB] UserID: %, ActivityID: %. Processing streak ID: %. Current: %. LastCompleted: % for prev week: %',
            streak_rec.user_id, streak_rec.activity_id, streak_rec.id, streak_rec.current_streak, streak_rec.last_completed_week, previous_week_start_date;

        IF streak_rec.last_completed_week = previous_week_start_date THEN
            RAISE NOTICE '[CRON JOB] UserID: %, ActivityID: %. Goal for previous week % was met. No reset needed.',
                streak_rec.user_id, streak_rec.activity_id, previous_week_start_date;
            CONTINUE;
        END IF;

        SELECT COUNT(DISTINCT date_trunc('day', al.completed_at AT TIME ZONE 'UTC'))
        INTO activity_days_in_previous_week
        FROM public.activity_logs AS al
        WHERE al.user_id = streak_rec.user_id
          AND al.activity_id = streak_rec.activity_id
          AND date_trunc('week', al.completed_at AT TIME ZONE 'UTC')::DATE = previous_week_start_date;

        RAISE NOTICE '[CRON JOB] UserID: %, ActivityID: %. Distinct activity days in previous week %: %. Goal: %.',
            streak_rec.user_id, streak_rec.activity_id, previous_week_start_date, activity_days_in_previous_week, streak_rec.streak_goal;

        IF activity_days_in_previous_week < streak_rec.streak_goal THEN
            IF streak_rec.current_streak > 0 THEN
                RAISE NOTICE '[CRON JOB] UserID: %, ActivityID: %. Goal MISSED for previous week %. Resetting current_streak from % to 0.',
                    streak_rec.user_id, streak_rec.activity_id, previous_week_start_date, streak_rec.current_streak;
                UPDATE public.activity_streaks
                SET current_streak = 0,
                    updated_at = NOW()
                WHERE id = streak_rec.id;
            ELSE
                 RAISE NOTICE '[CRON JOB] UserID: %, ActivityID: %. Goal MISSED for previous week %, but current_streak was already 0. No change.',
                    streak_rec.user_id, streak_rec.activity_id, previous_week_start_date;
            END IF;
        ELSE
            RAISE NOTICE '[CRON JOB] UserID: %, ActivityID: %. Goal MET for previous week % (count: % >= goal: %), but last_completed_week was %. Insert trigger should have handled this if it was an active streak.',
                streak_rec.user_id, streak_rec.activity_id, previous_week_start_date, activity_days_in_previous_week, streak_rec.streak_goal, streak_rec.last_completed_week;
        END IF;
    END LOOP;
    RAISE NOTICE '[CRON JOB] fn_rollover_activity_streaks_weekly finished for week: %.', previous_week_start_date;
END;
$$;


ALTER FUNCTION "public"."fn_rollover_activity_streaks_weekly"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_activity_streaks"("p_user_id" "uuid" DEFAULT "auth"."uid"()) RETURNS TABLE("activity_id" "uuid", "activity_name" "text", "streak_goal" integer, "current_streak" integer, "longest_streak" integer, "this_week_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    current_week_start DATE := date_trunc('week', CURRENT_DATE AT TIME ZONE 'UTC')::DATE;
BEGIN
    RETURN QUERY
    SELECT
        a.id AS activity_id,
        a.name AS activity_name,
        COALESCE(s.streak_goal, 0) as streak_goal,
        COALESCE(s.current_streak, 0) as current_streak,
        COALESCE(s.longest_streak, 0) as longest_streak,
        COALESCE(
            (SELECT COUNT(DISTINCT date_trunc('day', al.completed_at AT TIME ZONE 'UTC'))::INTEGER
             FROM public.activity_logs al
             WHERE al.user_id = p_user_id
               AND al.activity_id = a.id -- UUID = UUID comparison
               AND date_trunc('week', al.completed_at AT TIME ZONE 'UTC')::DATE = current_week_start),
            0
        ) AS this_week_count
    FROM
        public.activities a
    LEFT JOIN
        public.activity_streaks s ON s.activity_id = a.id AND s.user_id = p_user_id -- UUID = UUID comparison
    -- Condition to list activities:
    -- An activity is listed if the user has a streak defined for it,
    -- OR if the user has ever logged this activity.
    WHERE (s.user_id = p_user_id) -- Ensures that if a streak exists, it's for the current user
       OR EXISTS (
            SELECT 1 FROM public.activity_logs al_check
            WHERE al_check.user_id = p_user_id AND al_check.activity_id = a.id
        )
    ORDER BY
        a.name;
END;
$$;


ALTER FUNCTION "public"."get_user_activity_streaks"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."legend_state_handle_timestamps"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
    BEGIN
        IF (TG_OP = 'INSERT') THEN
            NEW.created_at := NOW();
            NEW.updated_at := NOW();
            -- Ensure 'deleted' defaults to false if not explicitly set and column exists
            IF TG_TABLE_NAME IN ('activities', 'activity_logs', 'activity_streaks', 'locations') THEN -- Add other tables if needed
                IF NEW.deleted IS NULL THEN
                    NEW.deleted := FALSE;
                END IF;
            END IF;
        ELSIF (TG_OP = 'UPDATE') THEN
            -- Keep the original created_at value, only update updated_at
            NEW.created_at := OLD.created_at;
            NEW.updated_at := NOW();
        END IF;
        RETURN NEW;
    END;
    $$;


ALTER FUNCTION "public"."legend_state_handle_timestamps"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_specific_activity_streak_on_log_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    log_week_start_date DATE;
    activity_days_in_log_week INTEGER;
    streak_record public.activity_streaks%ROWTYPE;
BEGIN
    log_week_start_date := date_trunc('week', NEW.completed_at AT TIME ZONE 'UTC')::DATE;

    RAISE NOTICE '[TRIGGER] UserID: %, ActivityID: %. LogID: %. Completed: %. LogWeekStart: %',
        NEW.user_id, NEW.activity_id, NEW.id, NEW.completed_at, log_week_start_date;

    SELECT * INTO streak_record
    FROM public.activity_streaks AS s
    WHERE s.user_id = NEW.user_id AND s.activity_id = NEW.activity_id;

    IF NOT FOUND THEN
        RAISE NOTICE '[TRIGGER] UserID: %, ActivityID: %. No activity_streaks record. Streak not updated.',
            NEW.user_id, NEW.activity_id;
        RETURN NEW;
    END IF;

    RAISE NOTICE '[TRIGGER] UserID: %, ActivityID: %. Found streak record ID: %. Goal: %. Current: %. Longest: %. LastCompletedWeek: %',
        NEW.user_id, NEW.activity_id, streak_record.id, streak_record.streak_goal, streak_record.current_streak, streak_record.longest_streak, streak_record.last_completed_week;

    IF streak_record.streak_goal IS NULL OR streak_record.streak_goal <= 0 THEN
        RAISE NOTICE '[TRIGGER] UserID: %, ActivityID: %. Streak goal is % (null or <=0). Streak not updated.',
            NEW.user_id, NEW.activity_id, streak_record.streak_goal;
        RETURN NEW;
    END IF;

    SELECT COUNT(DISTINCT date_trunc('day', al.completed_at AT TIME ZONE 'UTC'))
    INTO activity_days_in_log_week
    FROM public.activity_logs AS al
    WHERE al.user_id = NEW.user_id
      AND al.activity_id = NEW.activity_id
      AND date_trunc('week', al.completed_at AT TIME ZONE 'UTC')::DATE = log_week_start_date;

    RAISE NOTICE '[TRIGGER] UserID: %, ActivityID: %. Distinct activity days in week %: %. Goal: %.',
        NEW.user_id, NEW.activity_id, log_week_start_date, activity_days_in_log_week, streak_record.streak_goal;

    IF activity_days_in_log_week >= streak_record.streak_goal THEN
        RAISE NOTICE '[TRIGGER] UserID: %, ActivityID: %. Goal MET for week %.',
            NEW.user_id, NEW.activity_id, log_week_start_date;

        IF streak_record.last_completed_week IS NULL OR streak_record.last_completed_week != log_week_start_date THEN
            RAISE NOTICE '[TRIGGER] UserID: %, ActivityID: %. Week % is a new completed week. Previous last_completed_week: %.',
                NEW.user_id, NEW.activity_id, log_week_start_date, streak_record.last_completed_week;

            IF streak_record.last_completed_week = (log_week_start_date - INTERVAL '7 days')::DATE THEN
                streak_record.current_streak := streak_record.current_streak + 1;
                RAISE NOTICE '[TRIGGER] UserID: %, ActivityID: %. CONSECUTIVE week. New current_streak: %.',
                    NEW.user_id, NEW.activity_id, streak_record.current_streak;
            ELSE
                streak_record.current_streak := 1;
                RAISE NOTICE '[TRIGGER] UserID: %, ActivityID: %. NON-CONSECUTIVE or first goal met. New current_streak: 1.',
                    NEW.user_id, NEW.activity_id;
            END IF;

            IF streak_record.current_streak > streak_record.longest_streak THEN
                streak_record.longest_streak := streak_record.current_streak;
                RAISE NOTICE '[TRIGGER] UserID: %, ActivityID: %. New LONGEST_STREAK: %.',
                    NEW.user_id, NEW.activity_id, streak_record.longest_streak;
            END IF;

            streak_record.last_completed_week := log_week_start_date;

            UPDATE public.activity_streaks
            SET current_streak = streak_record.current_streak,
                longest_streak = streak_record.longest_streak,
                last_completed_week = streak_record.last_completed_week,
                updated_at = NOW()
            WHERE id = streak_record.id;

            RAISE NOTICE '[TRIGGER] UserID: %, ActivityID: %. activity_streaks table UPDATED for ID %.',
                NEW.user_id, NEW.activity_id, streak_record.id;
        ELSE
            RAISE NOTICE '[TRIGGER] UserID: %, ActivityID: %. Goal met for week %, but this week was already marked as completed. No change.',
                NEW.user_id, NEW.activity_id, log_week_start_date;
        END IF;
    ELSE
        RAISE NOTICE '[TRIGGER] UserID: %, ActivityID: %. Goal NOT YET MET for week %. Distinct days: %, Goal: %.',
            NEW.user_id, NEW.activity_id, log_week_start_date, activity_days_in_log_week, streak_record.streak_goal;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_specific_activity_streak_on_log_insert"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted" boolean DEFAULT false,
    "category" "public"."activity_category_enum"
);


ALTER TABLE "public"."activities" OWNER TO "postgres";


COMMENT ON TABLE "public"."activities" IS 'Stores the different types of exercises users can log.';



CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "completed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted" boolean DEFAULT false,
    "duration_minutes" integer,
    "source" "text",
    "metrics" "jsonb",
    "activity_id" "uuid"
);


ALTER TABLE "public"."activity_logs" OWNER TO "postgres";


COMMENT ON COLUMN "public"."activity_logs"."duration_minutes" IS 'Duration of the activity in minutes.';



COMMENT ON COLUMN "public"."activity_logs"."source" IS 'How the activity log was created (e.g., manual, geo-fence, timer_app).';



COMMENT ON COLUMN "public"."activity_logs"."metrics" IS 'Flexible JSONB field for activity-specific data (e.g., distance, reps, sets, custom fields).';



CREATE TABLE IF NOT EXISTS "public"."activity_streaks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "streak_goal" integer DEFAULT 1 NOT NULL,
    "current_streak" integer DEFAULT 0 NOT NULL,
    "longest_streak" integer DEFAULT 0 NOT NULL,
    "last_completed_week" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "activity_id" "uuid"
);


ALTER TABLE "public"."activity_streaks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "radius_m" integer DEFAULT 100,
    "address" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "default_activity_id" "uuid"
);


ALTER TABLE "public"."locations" OWNER TO "postgres";


COMMENT ON TABLE "public"."locations" IS 'Stores predefined locations where users can log activities (e.g., gyms, parks).';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "discord_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted" boolean DEFAULT false,
    "name" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."activities"
    ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_streaks"
    ADD CONSTRAINT "activity_streaks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_activity_logs_user_completed" ON "public"."activity_logs" USING "btree" ("user_id", "completed_at");



CREATE OR REPLACE TRIGGER "handle_timestamps_trigger" BEFORE INSERT OR UPDATE ON "public"."activities" FOR EACH ROW EXECUTE FUNCTION "public"."legend_state_handle_timestamps"();



CREATE OR REPLACE TRIGGER "handle_timestamps_trigger" BEFORE INSERT OR UPDATE ON "public"."activity_logs" FOR EACH ROW EXECUTE FUNCTION "public"."legend_state_handle_timestamps"();



CREATE OR REPLACE TRIGGER "handle_timestamps_trigger" BEFORE INSERT OR UPDATE ON "public"."activity_streaks" FOR EACH ROW EXECUTE FUNCTION "public"."legend_state_handle_timestamps"();



CREATE OR REPLACE TRIGGER "handle_timestamps_trigger" BEFORE INSERT OR UPDATE ON "public"."locations" FOR EACH ROW EXECUTE FUNCTION "public"."legend_state_handle_timestamps"();



CREATE OR REPLACE TRIGGER "handle_timestamps_trigger" BEFORE INSERT OR UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."legend_state_handle_timestamps"();



CREATE OR REPLACE TRIGGER "trg_update_specific_activity_streak_on_log" AFTER INSERT ON "public"."activity_logs" FOR EACH ROW EXECUTE FUNCTION "public"."update_specific_activity_streak_on_log_insert"();



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id");



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_streaks"
    ADD CONSTRAINT "activity_streaks_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_streaks"
    ADD CONSTRAINT "activity_streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "gyms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_default_activity_id_fkey" FOREIGN KEY ("default_activity_id") REFERENCES "public"."activities"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow admin insert/update/delete for activities" ON "public"."activities" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Allow public read access to activities" ON "public"."activities" FOR SELECT USING (true);



CREATE POLICY "No direct inserts" ON "public"."users" FOR INSERT WITH CHECK (false);



CREATE POLICY "Service role can manage activity streaks" ON "public"."activity_streaks" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can insert_update their own activity streak goals" ON "public"."activity_streaks" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own activity logs" ON "public"."activity_logs" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read their own activity streaks" ON "public"."activity_streaks" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update themselves" ON "public"."users" FOR UPDATE USING ((("id" = "auth"."uid"()) AND ("deleted" IS NOT TRUE))) WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "Users can view themselves" ON "public"."users" FOR SELECT USING ((("id" = "auth"."uid"()) AND ("deleted" IS NOT TRUE)));



ALTER TABLE "public"."activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "activity_logs_delete_policy" ON "public"."activity_logs" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "activity_logs_insert_policy" ON "public"."activity_logs" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "activity_logs_read_policy" ON "public"."activity_logs" FOR SELECT USING (true);



CREATE POLICY "activity_logs_update_policy" ON "public"."activity_logs" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."activity_streaks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_insert_policy" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "users_read_policy" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "users_update_policy" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_rollover_activity_streaks_weekly"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_rollover_activity_streaks_weekly"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_rollover_activity_streaks_weekly"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_activity_streaks"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_activity_streaks"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_activity_streaks"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."legend_state_handle_timestamps"() TO "anon";
GRANT ALL ON FUNCTION "public"."legend_state_handle_timestamps"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."legend_state_handle_timestamps"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_specific_activity_streak_on_log_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_specific_activity_streak_on_log_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_specific_activity_streak_on_log_insert"() TO "service_role";



GRANT ALL ON TABLE "public"."activities" TO "anon";
GRANT ALL ON TABLE "public"."activities" TO "authenticated";
GRANT ALL ON TABLE "public"."activities" TO "service_role";



GRANT ALL ON TABLE "public"."activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_logs" TO "service_role";



GRANT ALL ON TABLE "public"."activity_streaks" TO "anon";
GRANT ALL ON TABLE "public"."activity_streaks" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_streaks" TO "service_role";



GRANT ALL ON TABLE "public"."locations" TO "anon";
GRANT ALL ON TABLE "public"."locations" TO "authenticated";
GRANT ALL ON TABLE "public"."locations" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






RESET ALL;
