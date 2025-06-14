
-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'workshop',
  format TEXT NOT NULL DEFAULT 'online',
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  instructor TEXT,
  location TEXT,
  meeting_link TEXT,
  max_attendees INTEGER NOT NULL DEFAULT 50,
  registered INTEGER NOT NULL DEFAULT 0,
  registered_users JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'upcoming',
  recording TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users
);

-- Add Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy for reading events (public can view)
CREATE POLICY "Anyone can view events" 
  ON public.events 
  FOR SELECT 
  USING (true);

-- Policy for admin operations (only admins can modify)
CREATE POLICY "Only admins can modify events" 
  ON public.events 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create event registrations table
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for registrations
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Users can view their own registrations
CREATE POLICY "Users can view their own registrations" 
  ON public.event_registrations 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can register for events
CREATE POLICY "Users can register for events" 
  ON public.event_registrations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all registrations
CREATE POLICY "Admins can view all registrations" 
  ON public.event_registrations 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
