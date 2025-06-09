-- Create custom types (enums) for better data consistency
CREATE TYPE public.cooking_level AS ENUM ('Beginner', 'Intermediate', 'Advanced', 'Professional');
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard', 'expert');
CREATE TYPE public.cuisine_type AS ENUM (
    'american', 'italian', 'chinese', 'japanese', 'mexican', 'indian',
    'french', 'thai', 'mediterranean', 'korean', 'vietnamese', 'other'
);
CREATE TYPE public.dietary_restriction AS ENUM (
    'vegetarian', 'vegan', 'gluten_free', 'dairy_free',
    'nut_free', 'halal', 'kosher', 'none'
);
CREATE TYPE public.meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snack', 'dessert');
CREATE TYPE public.activity_type AS ENUM ('saved', 'comment', 'rating', 'created', 'updated', 'deleted');

-- Modify profiles table to use enum
ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS profiles_cooking_level_check,
    ALTER COLUMN cooking_level TYPE cooking_level USING cooking_level::cooking_level;

-- Modify recipes table to use enums and add constraints
ALTER TABLE public.recipes
    ALTER COLUMN difficulty TYPE difficulty_level USING difficulty::difficulty_level,
    ALTER COLUMN cuisine_type TYPE cuisine_type USING cuisine_type::cuisine_type,
    ALTER COLUMN prep_time_minutes SET NOT NULL,
    ALTER COLUMN cook_time_minutes SET NOT NULL,
    ALTER COLUMN servings SET NOT NULL,
    ADD CONSTRAINT recipes_prep_time_check CHECK (prep_time_minutes >= 0),
    ADD CONSTRAINT recipes_cook_time_check CHECK (cook_time_minutes >= 0),
    ADD CONSTRAINT recipes_servings_check CHECK (servings > 0),
    ADD CONSTRAINT recipes_calories_check CHECK (calories_per_serving > 0);

-- Modify meal_plan_items to use enum
ALTER TABLE public.meal_plan_items
    ALTER COLUMN meal_type TYPE meal_type USING meal_type::meal_type;

-- Modify user_activity to use enum
ALTER TABLE public.user_activity
    DROP CONSTRAINT IF EXISTS user_activity_type_check,
    ALTER COLUMN type TYPE activity_type USING type::activity_type;

-- Add missing foreign key constraints
ALTER TABLE public.meal_plans
    ADD CONSTRAINT meal_plans_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.shopping_lists
    ADD CONSTRAINT shopping_lists_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.recipes
    ADD CONSTRAINT recipes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.favorite_recipes
    ADD CONSTRAINT favorite_recipes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create a categories_closure table for hierarchical category queries
CREATE TABLE IF NOT EXISTS public.categories_closure (
    ancestor_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
    descendant_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
    depth integer NOT NULL,
    PRIMARY KEY (ancestor_id, descendant_id)
);

-- Create trigger function to maintain categories closure table
CREATE OR REPLACE FUNCTION maintain_categories_closure()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Insert self-reference
        INSERT INTO categories_closure (ancestor_id, descendant_id, depth)
        VALUES (NEW.id, NEW.id, 0);

        -- Insert paths from ancestors
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

-- Create trigger for categories closure maintenance
CREATE TRIGGER maintain_categories_closure_trigger
AFTER INSERT OR DELETE ON public.categories
FOR EACH ROW EXECUTE FUNCTION maintain_categories_closure();

-- Create function to get all ancestor categories
CREATE OR REPLACE FUNCTION get_category_ancestors(category_id uuid)
RETURNS TABLE (id uuid, name text, depth integer) AS $$
    SELECT c.id, c.name, cc.depth
    FROM categories_closure cc
    JOIN categories c ON c.id = cc.ancestor_id
    WHERE cc.descendant_id = category_id
    ORDER BY cc.depth DESC;
$$ LANGUAGE sql;

-- Create function to get all descendant categories
CREATE OR REPLACE FUNCTION get_category_descendants(category_id uuid)
RETURNS TABLE (id uuid, name text, depth integer) AS $$
    SELECT c.id, c.name, cc.depth
    FROM categories_closure cc
    JOIN categories c ON c.id = cc.descendant_id
    WHERE cc.ancestor_id = category_id
    ORDER BY cc.depth ASC;
$$ LANGUAGE sql;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_user_category ON public.recipes(user_id, category_id);
CREATE INDEX IF NOT EXISTS idx_recipes_cuisine_difficulty ON public.recipes(cuisine_type, difficulty);
CREATE INDEX IF NOT EXISTS idx_meal_plans_date_range ON public.meal_plans(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_meal_plan_items_date ON public.meal_plan_items(planned_date);
CREATE INDEX IF NOT EXISTS idx_categories_closure_ancestor ON public.categories_closure(ancestor_id);
CREATE INDEX IF NOT EXISTS idx_categories_closure_descendant ON public.categories_closure(descendant_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type_date ON public.user_activity(type, created_at);

-- Add cascade delete to relevant foreign keys
ALTER TABLE public.recipe_dietary_restrictions
    DROP CONSTRAINT IF EXISTS recipe_dietary_restrictions_recipe_id_fkey,
    ADD CONSTRAINT recipe_dietary_restrictions_recipe_id_fkey 
    FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;

ALTER TABLE public.recipe_ratings
    DROP CONSTRAINT IF EXISTS recipe_ratings_recipe_id_fkey,
    ADD CONSTRAINT recipe_ratings_recipe_id_fkey 
    FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;

-- Add NOT NULL constraints where appropriate
ALTER TABLE public.connected_accounts
    ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.user_activity
    ALTER COLUMN user_id SET NOT NULL;

-- Add unique constraints
ALTER TABLE public.profile_categories
    ADD CONSTRAINT profile_categories_unique_profile_category 
    UNIQUE (profile_id, category_id);

ALTER TABLE public.recipe_ratings
    ADD CONSTRAINT recipe_ratings_unique_user_recipe 
    UNIQUE (user_id, recipe_id);

-- Create materialized view for recipe statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS recipe_statistics AS
SELECT 
    r.id as recipe_id,
    r.name as recipe_name,
    r.user_id,
    COUNT(DISTINCT fr.id) as favorite_count,
    COUNT(DISTINCT rr.id) as rating_count,
    COALESCE(AVG(rr.rating), 0) as average_rating,
    COUNT(DISTINCT mpi.id) as times_planned
FROM recipes r
LEFT JOIN favorite_recipes fr ON r.id = fr.recipe_id
LEFT JOIN recipe_ratings rr ON r.id = rr.recipe_id
LEFT JOIN meal_plan_items mpi ON r.id = mpi.recipe_id
GROUP BY r.id, r.name, r.user_id;

-- Create function to refresh recipe statistics
CREATE OR REPLACE FUNCTION refresh_recipe_statistics()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY recipe_statistics;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh recipe statistics
CREATE TRIGGER refresh_recipe_stats_on_favorite
AFTER INSERT OR DELETE OR UPDATE ON favorite_recipes
FOR EACH STATEMENT EXECUTE FUNCTION refresh_recipe_statistics();

CREATE TRIGGER refresh_recipe_stats_on_rating
AFTER INSERT OR DELETE OR UPDATE ON recipe_ratings
FOR EACH STATEMENT EXECUTE FUNCTION refresh_recipe_statistics();

CREATE TRIGGER refresh_recipe_stats_on_meal_plan
AFTER INSERT OR DELETE OR UPDATE ON meal_plan_items
FOR EACH STATEMENT EXECUTE FUNCTION refresh_recipe_statistics(); 