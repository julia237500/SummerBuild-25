-- Create a junction table for profile-category relationships
CREATE TABLE IF NOT EXISTS public.profile_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(profile_id, category_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profile_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for profile_categories
CREATE POLICY "Users can view their own category preferences"
    ON public.profile_categories FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can update their own category preferences"
    ON public.profile_categories FOR UPDATE
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own category preferences"
    ON public.profile_categories FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own category preferences"
    ON public.profile_categories FOR DELETE
    USING (auth.uid() = profile_id);

-- Create index for faster lookups
CREATE INDEX profile_categories_profile_id_idx ON public.profile_categories(profile_id);
CREATE INDEX profile_categories_category_id_idx ON public.profile_categories(category_id);

-- Create trigger for updated_at
CREATE TRIGGER update_profile_categories_updated_at
    BEFORE UPDATE ON public.profile_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 