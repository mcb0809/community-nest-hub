
-- Add XP configuration for chat messages if not exists
INSERT INTO public.xp_config (key, value, description) 
VALUES ('send_message', 50, 'XP earned for sending a chat message')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description;

-- Add messages_count column to user_stats if not exists
ALTER TABLE public.user_stats 
ADD COLUMN IF NOT EXISTS messages_count INTEGER DEFAULT 0;

-- Update the recalculate_user_stats function to include messages count
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
      messages_count,
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
      COALESCE(SUM(CASE WHEN action_type = 'send_message' THEN 1 ELSE 0 END), 0) as messages_count,
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
      messages_count = EXCLUDED.messages_count,
      last_activity = EXCLUDED.last_activity,
      updated_at = EXCLUDED.updated_at;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the member_leaderboard view to include messages_count
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
  COALESCE(us.messages_count, 0) as messages_count,
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
