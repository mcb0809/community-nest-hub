
-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  total_hours NUMERIC DEFAULT 0,
  price NUMERIC DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table with foreign key to courses
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_free_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for course files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-files', 'course-files', true);

-- Create storage policies for course-files bucket
CREATE POLICY "Anyone can view course files" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-files');

CREATE POLICY "Anyone can upload course files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'course-files');

CREATE POLICY "Anyone can update course files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'course-files');

CREATE POLICY "Anyone can delete course files" ON storage.objects
  FOR DELETE USING (bucket_id = 'course-files');

-- Enable RLS on courses table (optional - making it public for now)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Anyone can create courses" ON public.courses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update courses" ON public.courses FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete courses" ON public.courses FOR DELETE USING (true);

-- Enable RLS on lessons table
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Anyone can create lessons" ON public.lessons FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update lessons" ON public.lessons FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete lessons" ON public.lessons FOR DELETE USING (true);
