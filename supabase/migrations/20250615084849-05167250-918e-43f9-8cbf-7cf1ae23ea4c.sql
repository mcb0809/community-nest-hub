
-- Create posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'vip', 'draft')),
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create post_attachments table
CREATE TABLE public.post_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('file', 'asset', 'collection')),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  meta JSONB DEFAULT '{}',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Anyone can view public posts" 
  ON public.posts 
  FOR SELECT 
  USING (visibility = 'public');

CREATE POLICY "VIP users can view VIP posts" 
  ON public.posts 
  FOR SELECT 
  USING (
    visibility = 'vip' AND 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role IN ('vip', 'admin')
    )
  );

CREATE POLICY "Users can view their own posts" 
  ON public.posts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create posts" 
  ON public.posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
  ON public.posts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any post" 
  ON public.posts 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can delete their own posts" 
  ON public.posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any post" 
  ON public.posts 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enable RLS on post_attachments
ALTER TABLE public.post_attachments ENABLE ROW LEVEL SECURITY;

-- Post attachments policies
CREATE POLICY "Anyone can view attachments of public posts" 
  ON public.post_attachments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE id = post_id AND visibility = 'public'
    )
  );

CREATE POLICY "VIP users can view attachments of VIP posts" 
  ON public.post_attachments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE id = post_id AND visibility = 'vip' AND
      EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE id = auth.uid() AND role IN ('vip', 'admin')
      )
    )
  );

CREATE POLICY "Users can view attachments of their own posts" 
  ON public.post_attachments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage attachments of their own posts" 
  ON public.post_attachments 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE id = post_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.posts 
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- Create storage bucket for post attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-attachments', 'post-attachments', true);

-- Storage policies for post-attachments bucket
CREATE POLICY "Anyone can view post attachments" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'post-attachments');

CREATE POLICY "Authenticated users can upload post attachments" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'post-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own post attachments" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'post-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own post attachments" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'post-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes for better performance
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_visibility ON public.posts(visibility);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_tags ON public.posts USING GIN(tags);
CREATE INDEX idx_post_attachments_post_id ON public.post_attachments(post_id);
