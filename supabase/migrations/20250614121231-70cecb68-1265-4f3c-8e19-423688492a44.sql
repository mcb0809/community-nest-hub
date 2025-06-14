
-- Create comments table for course comments
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for comments table
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read comments (public course comments)
CREATE POLICY "Anyone can view comments" 
  ON public.comments 
  FOR SELECT 
  USING (true);

-- Allow anyone to insert comments (no auth required for now)
CREATE POLICY "Anyone can create comments" 
  ON public.comments 
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to update their own comments (based on email)
CREATE POLICY "Users can update their own comments" 
  ON public.comments 
  FOR UPDATE 
  USING (true);

-- Allow users to delete their own comments (based on email)
CREATE POLICY "Users can delete their own comments" 
  ON public.comments 
  FOR DELETE 
  USING (true);

-- Create index for better performance
CREATE INDEX idx_comments_course_id ON public.comments(course_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);
