
-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  access_level TEXT DEFAULT 'free' CHECK (access_level IN ('free', 'vip')),
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id),
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies for documents
CREATE POLICY "Anyone can view documents" 
  ON public.documents 
  FOR SELECT 
  USING (true);

CREATE POLICY "Only authenticated users can insert documents" 
  ON public.documents 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only the uploader can update documents" 
  ON public.documents 
  FOR UPDATE 
  USING (auth.uid() = uploaded_by);

CREATE POLICY "Only the uploader can delete documents" 
  ON public.documents 
  FOR DELETE 
  USING (auth.uid() = uploaded_by);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true);

-- Create storage policies
CREATE POLICY "Anyone can view documents" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can upload documents" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own documents" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
