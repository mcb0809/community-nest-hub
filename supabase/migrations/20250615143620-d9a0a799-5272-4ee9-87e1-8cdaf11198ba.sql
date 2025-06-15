
-- Add missing columns to user_stats table (retry)
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS posts_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0;

-- Create function to recalculate all user stats
CREATE OR REPLACE FUNCTION public.recalculate_user_stats(target_user_id UUID DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- If target_user_id is provided, only recalculate for that user
  -- Otherwise recalculate for all users
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM public.xp_logs 
    WHERE (target_user_id IS NULL OR user_id = target_user_id)
  LOOP
    -- Calculate totals from xp_logs
    INSERT INTO public.user_stats (
      user_id, 
      total_xp, 
      level,
      posts_count,
      likes_count,
      comments_count,
      shares_count,
      last_activity,
      updated_at
    )
    SELECT 
      user_record.user_id,
      COALESCE(SUM(xp_earned), 0) as total_xp,
      public.calculate_level(COALESCE(SUM(xp_earned), 0)) as level,
      COALESCE(SUM(CASE WHEN action_type = 'write_post' THEN 1 ELSE 0 END), 0) as posts_count,
      COALESCE(SUM(CASE WHEN action_type = 'like' THEN 1 ELSE 0 END), 0) as likes_count,
      COALESCE(SUM(CASE WHEN action_type = 'comment' THEN 1 ELSE 0 END), 0) as comments_count,
      COALESCE(SUM(CASE WHEN action_type = 'share' THEN 1 ELSE 0 END), 0) as shares_count,
      MAX(created_at) as last_activity,
      NOW() as updated_at
    FROM public.xp_logs 
    WHERE user_id = user_record.user_id
    ON CONFLICT (user_id) DO UPDATE SET
      total_xp = EXCLUDED.total_xp,
      level = EXCLUDED.level,
      posts_count = EXCLUDED.posts_count,
      likes_count = EXCLUDED.likes_count,
      comments_count = EXCLUDED.comments_count,
      shares_count = EXCLUDED.shares_count,
      last_activity = EXCLUDED.last_activity,
      updated_at = EXCLUDED.updated_at;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log XP actions
CREATE OR REPLACE FUNCTION public.log_xp_action(
  p_user_id UUID,
  p_action_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_related_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  xp_value INTEGER;
BEGIN
  -- Get XP value from config
  SELECT value INTO xp_value 
  FROM public.xp_config 
  WHERE key = p_action_type;
  
  -- If action not found in config, return 0
  IF xp_value IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Insert XP log
  INSERT INTO public.xp_logs (user_id, action_type, xp_earned, description, created_at)
  VALUES (p_user_id, p_action_type, xp_value, p_description, NOW());
  
  RETURN xp_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function for level progress calculation
CREATE OR REPLACE FUNCTION public.calculate_level_progress(total_xp INTEGER, current_level INTEGER)
RETURNS INTEGER AS $$
DECLARE
  level_thresholds INTEGER[] := ARRAY[1000, 1500, 2000, 2800, 4000, 6000, 8500, 12000, 18000, 25000];
  current_threshold INTEGER;
  prev_threshold INTEGER := 0;
  acc_xp INTEGER := 0;
  i INTEGER;
BEGIN
  -- Calculate accumulated XP for previous levels
  FOR i IN 1..(current_level - 1) LOOP
    IF i <= array_length(level_thresholds, 1) THEN
      acc_xp := acc_xp + level_thresholds[i];
    END IF;
  END LOOP;
  
  -- Get current level threshold
  IF current_level <= array_length(level_thresholds, 1) THEN
    current_threshold := level_thresholds[current_level];
  ELSE
    current_threshold := 25000; -- Max level threshold
  END IF;
  
  -- Calculate progress percentage
  IF current_threshold = 0 THEN
    RETURN 100;
  END IF;
  
  RETURN LEAST(100, GREATEST(0, ROUND(((total_xp - acc_xp) * 100.0 / current_threshold)::numeric, 0)::INTEGER));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create simplified view for complete member stats
CREATE OR REPLACE VIEW public.member_leaderboard AS
SELECT 
  up.id,
  up.display_name as name,
  up.avatar_url as avatar,
  up.email,
  up.created_at as joined_at,
  COALESCE(us.total_xp, 0) as total_xp,
  COALESCE(us.level, 1) as level,
  COALESCE(us.courses_completed, 0) as courses_completed,
  COALESCE(us.posts_count, 0) as posts_count,
  COALESCE(us.likes_count, 0) as likes_count,
  COALESCE(us.comments_count, 0) as comments_count,
  COALESCE(us.shares_count, 0) as shares_count,
  COALESCE(us.current_streak, 0) as streak_days,
  COALESCE(us.longest_streak, 0) as longest_streak,
  COALESCE(us.total_online_hours, 0) as total_online_hours,
  us.last_activity,
  -- Online status: active in last 30 minutes
  CASE 
    WHEN us.last_activity IS NOT NULL 
    AND us.last_activity > NOW() - INTERVAL '30 minutes' 
    THEN true 
    ELSE false 
  END as is_online,
  -- Calculate level progress using helper function
  public.calculate_level_progress(COALESCE(us.total_xp, 0), COALESCE(us.level, 1)) as level_progress
FROM public.user_profiles up
LEFT JOIN public.user_stats us ON up.id = us.user_id
ORDER BY COALESCE(us.total_xp, 0) DESC;

-- Grant permissions
GRANT SELECT ON public.member_leaderboard TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_xp_action(UUID, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recalculate_user_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_level_progress(INTEGER, INTEGER) TO authenticated;
