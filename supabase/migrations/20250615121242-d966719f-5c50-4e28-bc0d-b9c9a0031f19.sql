
-- Create user_stats table to store XP, level, and activity data
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  posts_count INTEGER NOT NULL DEFAULT 0,
  courses_completed INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create XP logs table to track XP history
CREATE TABLE public.xp_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  xp_earned INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create XP configuration table
CREATE TABLE public.xp_config (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default XP values
INSERT INTO public.xp_config (key, value, description) VALUES
('like', 100, 'XP earned for liking a post'),
('comment', 200, 'XP earned for commenting on a post'),
('share', 300, 'XP earned for sharing a post'),
('complete_course', 400, 'XP earned for completing a course'),
('write_post', 350, 'XP earned for writing a post');

-- Add RLS policies
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_config ENABLE ROW LEVEL SECURITY;

-- Policies for user_stats
CREATE POLICY "Users can view their own stats" ON public.user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stats" ON public.user_stats
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for xp_logs
CREATE POLICY "Users can view their own XP logs" ON public.xp_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all XP logs" ON public.xp_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for xp_config
CREATE POLICY "Everyone can view XP config" ON public.xp_config
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage XP config" ON public.xp_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION public.calculate_level(total_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Simple level calculation: level = floor(sqrt(total_xp / 100)) + 1
  RETURN FLOOR(SQRT(total_xp::FLOAT / 100)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update user stats when XP is logged
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id, total_xp, level, last_activity, updated_at)
  VALUES (
    NEW.user_id,
    NEW.xp_earned,
    public.calculate_level(NEW.xp_earned),
    NEW.created_at,
    NEW.created_at
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = user_stats.total_xp + NEW.xp_earned,
    level = public.calculate_level(user_stats.total_xp + NEW.xp_earned),
    last_activity = NEW.created_at,
    updated_at = NEW.created_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update user stats when XP is logged
CREATE TRIGGER update_user_stats_trigger
  AFTER INSERT ON public.xp_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_stats();
