
-- Add an icon column to channels table
ALTER TABLE public.channels 
ADD COLUMN icon text DEFAULT 'Hash';

-- Create a table for file attachments
CREATE TABLE public.message_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  file_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for message_attachments
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for message_attachments
CREATE POLICY "Users can view attachments for messages they can see" 
  ON public.message_attachments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.messages 
      WHERE messages.id = message_attachments.message_id
    )
  );

CREATE POLICY "Users can create attachments for their own messages" 
  ON public.message_attachments 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages 
      WHERE messages.id = message_attachments.message_id 
      AND messages.user_id = auth.uid()
    )
  );

-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-files',
  'chat-files',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/json', 'text/plain', 'audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg']
);

-- Create storage policies for chat files
CREATE POLICY "Anyone can view chat files" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'chat-files');

CREATE POLICY "Authenticated users can upload chat files" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'chat-files' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own chat files" 
  ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'chat-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own chat files" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'chat-files' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
