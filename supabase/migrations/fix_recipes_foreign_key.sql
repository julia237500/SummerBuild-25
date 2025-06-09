-- First, ensure we have the correct column name
ALTER TABLE public.recipes
RENAME COLUMN author_id TO user_id;

-- Drop the existing foreign key if it exists
ALTER TABLE public.recipes
DROP CONSTRAINT IF EXISTS recipes_author_id_fkey;

-- Add the correct foreign key constraint with the expected name
ALTER TABLE public.recipes
ADD CONSTRAINT recipes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id); 