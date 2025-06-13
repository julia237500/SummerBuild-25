-- Update cooking_level validation and add bio column
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_cooking_level_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_cooking_level_check 
    CHECK (cooking_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert'));

-- Add bio column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS(SELECT column_name 
                 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;
END $$;

-- Create insert policy for profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can create their own profile'
    ) THEN
        CREATE POLICY "Users can create their own profile"
            ON public.profiles FOR INSERT
            WITH CHECK (auth.uid() = id);
    END IF;
END $$;
