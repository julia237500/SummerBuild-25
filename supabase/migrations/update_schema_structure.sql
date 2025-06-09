-- Drop existing types if they exist
DROP TYPE IF EXISTS public.cooking_level CASCADE;
DROP TYPE IF EXISTS public.difficulty_level CASCADE;
DROP TYPE IF EXISTS public.cuisine_type CASCADE;
DROP TYPE IF EXISTS public.dietary_restriction CASCADE;
DROP TYPE IF EXISTS public.meal_type CASCADE;
DROP TYPE IF EXISTS public.activity_type CASCADE;

-- ---------------------------------
-- 1. Custom Types (ENUMs)
-- ---------------------------------
CREATE TYPE public.user_cooking_level AS ENUM (
  'Beginner',
  'Intermediate',
  'Advanced',
  'Professional'
);

CREATE TYPE public.recipe_difficulty AS ENUM (
  'Easy',
  'Medium',
  'Hard'
);

CREATE TYPE public.meal_type AS ENUM (
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Dessert'
);

CREATE TYPE public.user_activity_type AS ENUM (
  'created_recipe',
  'updated_recipe',
  'deleted_recipe',
  'rated_recipe',
  'commented_on_recipe',
  'favorited_recipe'
);

-- ---------------------------------
-- 2. Core Tables (Users, Categories)
-- ---------------------------------

-- Update profiles table
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_cooking_level_check;

ALTER TABLE public.profiles
ALTER COLUMN cooking_level TYPE public.user_cooking_level USING cooking_level::text::public.user_cooking_level;

-- Update categories table
ALTER TABLE public.categories
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
DROP CONSTRAINT IF EXISTS categories_parent_id_fkey,
ADD CONSTRAINT categories_parent_id_fkey 
    FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL;

-- ---------------------------------
-- 3. Main Content Table (Recipes)
-- ---------------------------------

-- Update recipes table
ALTER TABLE public.recipes 
DROP COLUMN IF EXISTS cuisine_type,
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ALTER COLUMN user_id TYPE uuid USING user_id::uuid,
ALTER COLUMN user_id SET NOT NULL,
ALTER COLUMN user_id RENAME TO author_id,
ALTER COLUMN difficulty TYPE public.recipe_difficulty USING difficulty::text::public.recipe_difficulty,
ALTER COLUMN difficulty SET DEFAULT 'Medium',
DROP CONSTRAINT IF EXISTS recipes_prep_time_check,
DROP CONSTRAINT IF EXISTS recipes_cook_time_check,
DROP CONSTRAINT IF EXISTS recipes_servings_check,
ADD CONSTRAINT recipes_prep_time_check CHECK (prep_time_minutes >= 0),
ADD CONSTRAINT recipes_cook_time_check CHECK (cook_time_minutes >= 0),
ADD CONSTRAINT recipes_servings_check CHECK (servings > 0),
DROP CONSTRAINT IF EXISTS recipes_user_id_fkey,
ADD CONSTRAINT recipes_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ---------------------------------
-- 4. User Interaction & Join Tables
-- ---------------------------------

-- Update profile_categories table
ALTER TABLE public.profile_categories
DROP CONSTRAINT IF EXISTS profile_categories_pkey,
ADD CONSTRAINT profile_categories_pkey PRIMARY KEY (profile_id, category_id);

-- Update favorite_recipes table
ALTER TABLE public.favorite_recipes
DROP CONSTRAINT IF EXISTS favorite_recipes_pkey,
ADD CONSTRAINT favorite_recipes_pkey PRIMARY KEY (user_id, recipe_id);

-- Update recipe_ratings table
ALTER TABLE public.recipe_ratings
DROP CONSTRAINT IF EXISTS recipe_ratings_pkey,
ADD CONSTRAINT recipe_ratings_pkey PRIMARY KEY (user_id, recipe_id);

-- Update recipe_dietary_restrictions table
ALTER TABLE public.recipe_dietary_restrictions
DROP CONSTRAINT IF EXISTS recipe_dietary_restrictions_pkey,
ADD CONSTRAINT recipe_dietary_restrictions_pkey PRIMARY KEY (recipe_id, restriction);

-- ---------------------------------
-- 5. User Feature Tables
-- ---------------------------------

-- Update meal_plans table
ALTER TABLE public.meal_plans
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ALTER COLUMN name SET NOT NULL;

-- Update meal_plan_items table
ALTER TABLE public.meal_plan_items
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ALTER COLUMN meal_type TYPE public.meal_type USING meal_type::text::public.meal_type;

-- Update shopping_lists table
ALTER TABLE public.shopping_lists
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ALTER COLUMN name SET DEFAULT 'My Shopping List';

-- Update shopping_list_items table
ALTER TABLE public.shopping_list_items
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ---------------------------------
-- 6. User Settings & Activity
-- ---------------------------------

-- Update connected_accounts table
ALTER TABLE public.connected_accounts
DROP CONSTRAINT IF EXISTS connected_accounts_pkey,
ADD CONSTRAINT connected_accounts_pkey PRIMARY KEY (user_id, provider),
ALTER COLUMN provider_user_id SET NOT NULL;

-- Update user_activity table
ALTER TABLE public.user_activity
ALTER COLUMN id SET DEFAULT gen_random_uuid(),
ALTER COLUMN activity_type TYPE public.user_activity_type 
    USING activity_type::text::public.user_activity_type;

-- ---------------------------------
-- 7. Additional Indexes for Performance
-- ---------------------------------
CREATE INDEX IF NOT EXISTS idx_recipes_author_category ON public.recipes(author_id, category_id);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON public.recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_meal_plans_date_range ON public.meal_plans(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_date ON public.meal_plan_items(planned_date);
CREATE INDEX IF NOT EXISTS idx_user_activity_type_date ON public.user_activity(activity_type, created_at);

-- ---------------------------------
-- 8. Categories Closure Table (Retained from previous schema)
-- ---------------------------------
CREATE TABLE IF NOT EXISTS public.categories_closure (
    ancestor_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
    descendant_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
    depth integer NOT NULL,
    PRIMARY KEY (ancestor_id, descendant_id)
);

-- Retain the useful category hierarchy functions
CREATE OR REPLACE FUNCTION get_category_ancestors(category_id uuid)
RETURNS TABLE (id uuid, name text, depth integer) AS $$
    SELECT c.id, c.name, cc.depth
    FROM categories_closure cc
    JOIN categories c ON c.id = cc.ancestor_id
    WHERE cc.descendant_id = category_id
    ORDER BY cc.depth DESC;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION get_category_descendants(category_id uuid)
RETURNS TABLE (id uuid, name text, depth integer) AS $$
    SELECT c.id, c.name, cc.depth
    FROM categories_closure cc
    JOIN categories c ON c.id = cc.descendant_id
    WHERE cc.ancestor_id = category_id
    ORDER BY cc.depth ASC;
$$ LANGUAGE sql;

-- Retain the categories closure maintenance trigger
CREATE OR REPLACE FUNCTION maintain_categories_closure()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO categories_closure (ancestor_id, descendant_id, depth)
        VALUES (NEW.id, NEW.id, 0);

        IF NEW.parent_id IS NOT NULL THEN
            INSERT INTO categories_closure (ancestor_id, descendant_id, depth)
            SELECT ancestor_id, NEW.id, depth + 1
            FROM categories_closure
            WHERE descendant_id = NEW.parent_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM categories_closure
        WHERE descendant_id = OLD.id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER maintain_categories_closure_trigger
AFTER INSERT OR DELETE ON public.categories
FOR EACH ROW EXECUTE FUNCTION maintain_categories_closure();

-- ---------------------------------
-- 9. Recipe Statistics View (Retained from previous schema)
-- ---------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS recipe_statistics AS
SELECT 
    r.id as recipe_id,
    r.name as recipe_name,
    r.author_id,
    COUNT(DISTINCT fr.recipe_id) as favorite_count,
    COUNT(DISTINCT rr.recipe_id) as rating_count,
    COALESCE(AVG(rr.rating), 0) as average_rating,
    COUNT(DISTINCT mpi.recipe_id) as times_planned
FROM recipes r
LEFT JOIN favorite_recipes fr ON r.id = fr.recipe_id
LEFT JOIN recipe_ratings rr ON r.id = rr.recipe_id
LEFT JOIN meal_plan_items mpi ON r.id = mpi.recipe_id
GROUP BY r.id, r.name, r.author_id;

-- Refresh function for recipe statistics
CREATE OR REPLACE FUNCTION refresh_recipe_statistics()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY recipe_statistics;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers to refresh recipe statistics
CREATE TRIGGER refresh_recipe_stats_on_favorite
AFTER INSERT OR DELETE OR UPDATE ON favorite_recipes
FOR EACH STATEMENT EXECUTE FUNCTION refresh_recipe_statistics();

CREATE TRIGGER refresh_recipe_stats_on_rating
AFTER INSERT OR DELETE OR UPDATE ON recipe_ratings
FOR EACH STATEMENT EXECUTE FUNCTION refresh_recipe_statistics();

CREATE TRIGGER refresh_recipe_stats_on_meal_plan
AFTER INSERT OR DELETE OR UPDATE ON meal_plan_items
FOR EACH STATEMENT EXECUTE FUNCTION refresh_recipe_statistics(); 