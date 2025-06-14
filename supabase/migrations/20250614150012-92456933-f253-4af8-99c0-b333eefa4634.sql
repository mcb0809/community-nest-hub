
-- Update existing user to admin role
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Get the user ID for the existing email
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'machbang1@gmail.com';
    
    -- Update or insert into user_profiles with admin role
    INSERT INTO public.user_profiles (id, display_name, avatar_url, role)
    VALUES (admin_user_id, 'Admin User', null, 'admin')
    ON CONFLICT (id) DO UPDATE SET 
        role = 'admin',
        display_name = 'Admin User';
END $$;
