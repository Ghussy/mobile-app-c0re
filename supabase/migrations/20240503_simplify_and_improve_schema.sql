-- Drop all previous tables and functions
DROP TABLE IF EXISTS public.user_activity CASCADE;
DROP TABLE IF EXISTS public.user_dates CASCADE;
DROP TABLE IF EXISTS public.gym_goals CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP FUNCTION IF EXISTS public.get_leaderboard(bigint);
DROP FUNCTION IF EXISTS public.get_leaderboard(uuid);
DROP FUNCTION IF EXISTS public.get_user_information(uuid);
DROP FUNCTION IF EXISTS public.delete_user(uuid);
DROP FUNCTION IF EXISTS public.log_identity_insert();
DROP VIEW IF EXISTS public.identity_view;

-- Create simplified tables
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    streak_goal INTEGER NOT NULL DEFAULT 3,  -- Default goal is 3 times per week
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE public.activities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- User activity log (when they completed activities)
CREATE TABLE public.activity_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    activity_id INTEGER NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    notes TEXT
);

-- Create index for faster querying
CREATE INDEX idx_activity_logs_user_completed ON public.activity_logs (user_id, completed_at);
CREATE INDEX idx_activity_logs_activity ON public.activity_logs (activity_id);

-- Insert a default activity (Gym)
INSERT INTO public.activities (name, description) 
VALUES ('Gym', 'Going to the gym for a workout session');

-- Function to update user streak when they log an activity
CREATE OR REPLACE FUNCTION public.update_user_streak() 
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to update streaks when activity is logged
CREATE TRIGGER update_streak_on_activity_log
    AFTER INSERT ON public.activity_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_streak();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id, 
        display_name, 
        avatar_url,
        streak_goal
    ) VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User ' || substr(NEW.id::text, 1, 6)),
        NEW.raw_user_meta_data->>'avatar_url',
        3  -- Default streak goal (3 times per week)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile when auth user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to get leaderboard sorted by current streak
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
    rank INTEGER, 
    user_id UUID, 
    display_name TEXT, 
    current_streak INTEGER, 
    streak_goal INTEGER,
    avatar_url TEXT
) AS $$
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
$$ LANGUAGE plpgsql;

-- Set appropriate permissions
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can read all users
CREATE POLICY users_read_policy ON public.users
    FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY users_update_policy ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Everyone can read activities
CREATE POLICY activities_read_policy ON public.activities
    FOR SELECT USING (true);

-- Only authenticated users can create activities
CREATE POLICY activities_insert_policy ON public.activities
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Activity creator can update their activities
CREATE POLICY activities_update_policy ON public.activities
    FOR UPDATE USING (auth.uid() = created_by);

-- Users can read all activity logs
CREATE POLICY activity_logs_read_policy ON public.activity_logs
    FOR SELECT USING (true);

-- Users can only create logs for themselves
CREATE POLICY activity_logs_insert_policy ON public.activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own logs
CREATE POLICY activity_logs_update_policy ON public.activity_logs
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own logs
CREATE POLICY activity_logs_delete_policy ON public.activity_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE (display_name, avatar_url, streak_goal) ON public.users TO authenticated;

GRANT SELECT ON public.activities TO authenticated;
GRANT INSERT ON public.activities TO authenticated;
GRANT UPDATE ON public.activities TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_logs TO authenticated;
GRANT USAGE ON SEQUENCE public.activity_logs_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE public.activities_id_seq TO authenticated; 