-- Migration to add activity-specific streaks
-- This keeps the existing global streak system and adds activity-specific streaks

-- Create activity streaks table
CREATE TABLE public.activity_streaks (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    activity_id INTEGER NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    streak_goal INTEGER NOT NULL DEFAULT 3,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_completed_week DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, activity_id)
);

-- Function to handle activity-specific streaks
CREATE OR REPLACE FUNCTION public.update_activity_streak() 
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to update activity-specific streaks
CREATE TRIGGER update_activity_streak_on_log
    AFTER INSERT ON public.activity_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_activity_streak();

-- Initialize activity streaks for existing users and activities
INSERT INTO public.activity_streaks (user_id, activity_id, streak_goal)
SELECT u.id, a.id, u.streak_goal
FROM public.users u
CROSS JOIN public.activities a
ON CONFLICT (user_id, activity_id) DO NOTHING;

-- Add permissions
ALTER TABLE public.activity_streaks ENABLE ROW LEVEL SECURITY;

-- Users can read their own activity streaks
CREATE POLICY activity_streaks_read_policy ON public.activity_streaks
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own streak goals
CREATE POLICY activity_streaks_update_policy ON public.activity_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, UPDATE ON public.activity_streaks TO authenticated;
GRANT USAGE ON SEQUENCE public.activity_streaks_id_seq TO authenticated;

-- Add API for getting user's activity streaks
CREATE OR REPLACE FUNCTION public.get_user_activity_streaks(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    activity_id INTEGER,
    activity_name TEXT,
    streak_goal INTEGER,
    current_streak INTEGER,
    longest_streak INTEGER,
    this_week_count INTEGER
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER; 