
-- Create table to track course progress
CREATE TABLE public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_lessons INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create table to track lesson progress
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  watch_time_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Policies for course_progress
CREATE POLICY "Users can view their own course progress" ON public.course_progress 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own course progress" ON public.course_progress 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own course progress" ON public.course_progress 
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for lesson_progress
CREATE POLICY "Users can view their own lesson progress" ON public.lesson_progress 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own lesson progress" ON public.lesson_progress 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own lesson progress" ON public.lesson_progress 
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_course_progress_user_id ON public.course_progress(user_id);
CREATE INDEX idx_course_progress_course_id ON public.course_progress(course_id);
CREATE INDEX idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);

-- Function to update course progress when lesson is completed
CREATE OR REPLACE FUNCTION update_course_progress()
RETURNS TRIGGER AS $$
DECLARE
  course_id_var UUID;
  total_lessons_count INTEGER;
  completed_lessons_count INTEGER;
  progress_percent INTEGER;
BEGIN
  -- Get course_id from lesson via module
  SELECT m.course_id INTO course_id_var
  FROM lessons l
  JOIN modules m ON l.module_id = m.id
  WHERE l.id = NEW.lesson_id;

  -- Count total lessons in the course
  SELECT COUNT(*) INTO total_lessons_count
  FROM lessons l
  JOIN modules m ON l.module_id = m.id
  WHERE m.course_id = course_id_var;

  -- Count completed lessons for this user in this course
  SELECT COUNT(*) INTO completed_lessons_count
  FROM lesson_progress lp
  JOIN lessons l ON lp.lesson_id = l.id
  JOIN modules m ON l.module_id = m.id
  WHERE m.course_id = course_id_var 
    AND lp.user_id = NEW.user_id 
    AND lp.is_completed = true;

  -- Calculate progress percentage
  progress_percent := CASE 
    WHEN total_lessons_count > 0 THEN (completed_lessons_count * 100 / total_lessons_count)
    ELSE 0
  END;

  -- Update or insert course progress
  INSERT INTO course_progress (
    user_id, 
    course_id, 
    total_lessons, 
    completed_lessons, 
    progress_percentage,
    completed_at,
    updated_at
  )
  VALUES (
    NEW.user_id,
    course_id_var,
    total_lessons_count,
    completed_lessons_count,
    progress_percent,
    CASE WHEN progress_percent = 100 THEN NEW.completed_at ELSE NULL END,
    now()
  )
  ON CONFLICT (user_id, course_id) DO UPDATE SET
    total_lessons = total_lessons_count,
    completed_lessons = completed_lessons_count,
    progress_percentage = progress_percent,
    completed_at = CASE WHEN progress_percent = 100 THEN NEW.completed_at ELSE NULL END,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update course progress
CREATE TRIGGER trigger_update_course_progress
  AFTER INSERT OR UPDATE OF is_completed ON lesson_progress
  FOR EACH ROW
  WHEN (NEW.is_completed = true)
  EXECUTE FUNCTION update_course_progress();
