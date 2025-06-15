
-- Check if send_message XP config exists and add it if missing
INSERT INTO public.xp_config (key, value, description)
VALUES ('send_message', 5, 'XP earned for sending a chat message')
ON CONFLICT (key) DO UPDATE SET
  value = 5,
  description = 'XP earned for sending a chat message',
  updated_at = now();
