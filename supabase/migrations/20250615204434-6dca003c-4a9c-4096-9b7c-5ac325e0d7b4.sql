
-- Create level_config table to store level configurations
CREATE TABLE public.level_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level_number INTEGER NOT NULL UNIQUE,
  level_name TEXT NOT NULL,
  required_xp INTEGER NOT NULL,
  color TEXT DEFAULT '#8B5CF6',
  icon TEXT DEFAULT '⭐',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default level configurations
INSERT INTO public.level_config (level_number, level_name, required_xp, color, icon) VALUES
(1, 'Người mới', 0, '#10B981', '🌱'),
(2, 'Học viên', 1000, '#3B82F6', '📚'),
(3, 'Tích cực', 2500, '#8B5CF6', '⚡'),
(4, 'Chuyên gia', 5000, '#F59E0B', '🎯'),
(5, 'Bậc thầy', 8500, '#EF4444', '🏆'),
(6, 'Huyền thoại', 15000, '#EC4899', '👑'),
(7, 'Siêu sao', 25000, '#6366F1', '🌟'),
(8, 'Vô địch', 40000, '#8B5CF6', '💎'),
(9, 'Thần thoại', 65000, '#F59E0B', '🔥'),
(10, 'Bất bại', 100000, '#EF4444', '🚀');

-- Add RLS policies
ALTER TABLE public.level_config ENABLE ROW LEVEL SECURITY;

-- Everyone can view level config
CREATE POLICY "Everyone can view level config" ON public.level_config
  FOR SELECT TO authenticated USING (true);

-- Admins can manage level config
CREATE POLICY "Admins can manage level config" ON public.level_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update the calculate_level function to use level_config
CREATE OR REPLACE FUNCTION public.calculate_level_from_config(total_xp INTEGER)
RETURNS TABLE(level_number INTEGER, level_name TEXT, color TEXT, icon TEXT, progress INTEGER) AS $$
DECLARE
  current_level RECORD;
  next_level RECORD;
  level_progress INTEGER := 0;
BEGIN
  -- Find the highest level that the user qualifies for
  SELECT lc.level_number, lc.level_name, lc.color, lc.icon, lc.required_xp
  INTO current_level
  FROM public.level_config lc
  WHERE lc.required_xp <= total_xp
  ORDER BY lc.level_number DESC
  LIMIT 1;
  
  -- If no level found, return level 1
  IF current_level IS NULL THEN
    SELECT lc.level_number, lc.level_name, lc.color, lc.icon, lc.required_xp
    INTO current_level
    FROM public.level_config lc
    WHERE lc.level_number = 1;
  END IF;
  
  -- Find next level for progress calculation
  SELECT lc.required_xp
  INTO next_level
  FROM public.level_config lc
  WHERE lc.level_number = current_level.level_number + 1;
  
  -- Calculate progress to next level
  IF next_level IS NOT NULL THEN
    level_progress := LEAST(100, GREATEST(0, 
      ROUND(((total_xp - current_level.required_xp) * 100.0 / 
             (next_level.required_xp - current_level.required_xp))::numeric, 0)::INTEGER
    ));
  ELSE
    level_progress := 100; -- Max level reached
  END IF;
  
  RETURN QUERY SELECT 
    current_level.level_number, 
    current_level.level_name, 
    current_level.color, 
    current_level.icon, 
    level_progress;
END;
$$ LANGUAGE plpgsql STABLE;

-- Update user_stats trigger to use new level calculation
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  level_info RECORD;
BEGIN
  -- Get level info from new function
  SELECT * FROM public.calculate_level_from_config(
    CASE WHEN TG_OP = 'INSERT' THEN NEW.xp_earned
         ELSE (SELECT total_xp FROM public.user_stats WHERE user_id = NEW.user_id) + NEW.xp_earned
    END
  ) INTO level_info;

  INSERT INTO public.user_stats (user_id, total_xp, level, last_activity, updated_at)
  VALUES (
    NEW.user_id,
    NEW.xp_earned,
    level_info.level_number,
    NEW.created_at,
    NEW.created_at
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = user_stats.total_xp + NEW.xp_earned,
    level = level_info.level_number,
    last_activity = NEW.created_at,
    updated_at = NEW.created_at;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
