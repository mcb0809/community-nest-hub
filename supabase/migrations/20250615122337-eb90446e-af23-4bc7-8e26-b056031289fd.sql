
-- Add new XP configuration entries for streak and online time
INSERT INTO public.xp_config (key, value, description) VALUES
('daily_login', 100, 'XP earned for daily login streak'),
('hourly_online', 20, 'XP earned per hour online');

-- Update user_stats table to track online time
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS total_online_hours DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_date DATE,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;

-- Create function to handle daily login and streak calculation
CREATE OR REPLACE FUNCTION public.handle_daily_login(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  current_stats RECORD;
  streak_xp INTEGER;
  result JSONB;
BEGIN
  -- Get current user stats
  SELECT * INTO current_stats 
  FROM public.user_stats 
  WHERE user_id = user_id_param;
  
  -- Get daily login XP value
  SELECT value INTO streak_xp 
  FROM public.xp_config 
  WHERE key = 'daily_login';
  
  -- If user stats don't exist, create them
  IF current_stats IS NULL THEN
    INSERT INTO public.user_stats (user_id, last_login_date, current_streak, longest_streak)
    VALUES (user_id_param, CURRENT_DATE, 1, 1);
    
    -- Log XP for first login
    INSERT INTO public.xp_logs (user_id, action_type, xp_earned, description)
    VALUES (user_id_param, 'daily_login', streak_xp, 'First daily login streak');
    
    result := jsonb_build_object(
      'streak_continued', true,
      'current_streak', 1,
      'xp_earned', streak_xp
    );
  ELSE
    -- Check if it's a new day
    IF current_stats.last_login_date IS NULL OR current_stats.last_login_date < CURRENT_DATE THEN
      DECLARE
        new_streak INTEGER;
        new_longest_streak INTEGER;
      BEGIN
        -- Calculate new streak
        IF current_stats.last_login_date = CURRENT_DATE - INTERVAL '1 day' THEN
          -- Consecutive day
          new_streak := COALESCE(current_stats.current_streak, 0) + 1;
        ELSE
          -- Streak broken or first login
          new_streak := 1;
        END IF;
        
        new_longest_streak := GREATEST(COALESCE(current_stats.longest_streak, 0), new_streak);
        
        -- Update user stats
        UPDATE public.user_stats 
        SET 
          last_login_date = CURRENT_DATE,
          current_streak = new_streak,
          longest_streak = new_longest_streak,
          updated_at = now()
        WHERE user_id = user_id_param;
        
        -- Log daily login XP
        INSERT INTO public.xp_logs (user_id, action_type, xp_earned, description)
        VALUES (user_id_param, 'daily_login', streak_xp, 
                FORMAT('Daily login streak: %s days', new_streak));
        
        result := jsonb_build_object(
          'streak_continued', true,
          'current_streak', new_streak,
          'xp_earned', streak_xp
        );
      END;
    ELSE
      -- Already logged in today
      result := jsonb_build_object(
        'streak_continued', false,
        'current_streak', COALESCE(current_stats.current_streak, 0),
        'xp_earned', 0
      );
    END IF;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle hourly online time XP
CREATE OR REPLACE FUNCTION public.log_online_time(user_id_param UUID, hours_online DECIMAL)
RETURNS VOID AS $$
DECLARE
  hourly_xp INTEGER;
  total_xp INTEGER;
BEGIN
  -- Get hourly XP value
  SELECT value INTO hourly_xp 
  FROM public.xp_config 
  WHERE key = 'hourly_online';
  
  -- Calculate total XP for the session
  total_xp := FLOOR(hours_online * hourly_xp);
  
  -- Only log if there's XP to give
  IF total_xp > 0 THEN
    -- Update total online hours in user_stats
    INSERT INTO public.user_stats (user_id, total_online_hours, updated_at)
    VALUES (user_id_param, hours_online, now())
    ON CONFLICT (user_id) DO UPDATE SET
      total_online_hours = user_stats.total_online_hours + hours_online,
      updated_at = now();
    
    -- Log online time XP
    INSERT INTO public.xp_logs (user_id, action_type, xp_earned, description)
    VALUES (user_id_param, 'hourly_online', total_xp, 
            FORMAT('Online time: %.2f hours', hours_online));
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
