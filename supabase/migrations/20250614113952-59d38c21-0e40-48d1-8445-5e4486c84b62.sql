
-- Create modules table
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Drop existing lessons table and recreate with module relationship
DROP TABLE IF EXISTS public.lessons;

CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT,
  content_md TEXT,
  attachment_url TEXT,
  is_preview BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on modules table
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view modules" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Anyone can create modules" ON public.modules FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update modules" ON public.modules FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete modules" ON public.modules FOR DELETE USING (true);

-- Enable RLS on lessons table
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Anyone can create lessons" ON public.lessons FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update lessons" ON public.lessons FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete lessons" ON public.lessons FOR DELETE USING (true);
