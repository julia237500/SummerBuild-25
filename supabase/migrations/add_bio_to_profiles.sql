-- Drop bio column if it exists (to avoid errors)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS bio;

-- Add bio column to profiles table
ALTER TABLE public.profiles ADD COLUMN bio TEXT;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
