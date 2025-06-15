
-- Update the member_leaderboard view to count posts directly from the posts table
DROP VIEW IF EXISTS public.member_leaderboard;

CREATE VIEW public.member_leaderboard AS
SELECT 
  up.id,
  up.display_name as name,
  up.avatar_url as avatar,
  up.email,
  up.created_at as joined_at,
  COALESCE(us.total_xp, 0) as total_xp,
  COALESCE(us.level, 1) as level,
  COALESCE(public.calculate_level_progress(us.total_xp, us.level), 0) as level_progress,
  COALESCE(us.courses_completed, 0) as courses_completed,
  COALESCE(us.current_streak, 0) as streak_days,
  COALESCE(us.longest_streak, 0) as longest_streak,
  COALESCE(us.total_online_hours, 0) as total_online_hours,
  COALESCE(us.last_activity, up.created_at) as last_activity,
  COALESCE(us.likes_count, 0) as likes_count,
  COALESCE(us.comments_count, 0) as comments_count,
  COALESCE(us.shares_count, 0) as shares_count,
  -- Count posts directly from posts table
  COALESCE(post_counts.posts_count, 0) as posts_count,
  false as is_online -- This would need real-time presence tracking
FROM public.user_profiles up
LEFT JOIN public.user_stats us ON up.id = us.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as posts_count
  FROM public.posts 
  WHERE visibility = 'public'
  GROUP BY user_id
) post_counts ON up.id = post_counts.user_id
ORDER BY us.total_xp DESC NULLS LAST;
