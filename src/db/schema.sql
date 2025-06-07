-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create profiles table to link with auth.users
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique,
    full_name text,
    email text unique,
    avatar_url text,
    bio text,
    website text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create categories table
create table public.categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    slug text not null unique,
    description text,
    image_url text,
    parent_id uuid references public.categories(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create difficulty levels enum
create type public.difficulty_level as enum ('easy', 'medium', 'hard', 'expert');

-- Create cuisine types enum
create type public.cuisine_type as enum (
    'american', 'italian', 'chinese', 'japanese', 'mexican', 'indian', 
    'french', 'thai', 'mediterranean', 'korean', 'vietnamese', 'other'
);

-- Create dietary restrictions enum
create type public.dietary_restriction as enum (
    'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 
    'nut_free', 'halal', 'kosher', 'none'
);

-- Create recipes table
create table public.recipes (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    slug text not null unique,
    description text,
    ingredients jsonb not null default '[]'::jsonb,
    instructions jsonb not null default '[]'::jsonb,
    prep_time_minutes integer,
    cook_time_minutes integer,
    total_time_minutes integer generated always as (prep_time_minutes + cook_time_minutes) stored,
    servings integer,
    difficulty difficulty_level default 'medium',
    cuisine_type cuisine_type default 'other',
    calories_per_serving integer,
    image_url text,
    video_url text,
    source_url text,
    notes text,
    is_private boolean default false,
    is_featured boolean default false,
    category_id uuid references public.categories(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create recipe_dietary_restrictions table (many-to-many)
create table public.recipe_dietary_restrictions (
    id uuid default uuid_generate_v4() primary key,
    recipe_id uuid references public.recipes(id) on delete cascade not null,
    restriction dietary_restriction not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(recipe_id, restriction)
);

-- Create recipe ratings table
create table public.recipe_ratings (
    id uuid default uuid_generate_v4() primary key,
    recipe_id uuid references public.recipes(id) on delete cascade not null,
    user_id uuid references public.profiles(id) on delete cascade not null,
    rating integer check (rating >= 1 and rating <= 5) not null,
    comment text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(recipe_id, user_id)
);

-- Create favorite recipes table
create table public.favorite_recipes (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    recipe_id uuid references public.recipes(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, recipe_id)
);

-- Create shopping lists table
create table public.shopping_lists (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create shopping list items table
create table public.shopping_list_items (
    id uuid default uuid_generate_v4() primary key,
    shopping_list_id uuid references public.shopping_lists(id) on delete cascade not null,
    recipe_id uuid references public.recipes(id) on delete set null,
    ingredient jsonb not null,
    is_checked boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create meal plans table
create table public.meal_plans (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    name text not null,
    start_date date not null,
    end_date date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create meal plan items table
create table public.meal_plan_items (
    id uuid default uuid_generate_v4() primary key,
    meal_plan_id uuid references public.meal_plans(id) on delete cascade not null,
    recipe_id uuid references public.recipes(id) on delete cascade not null,
    planned_date date not null,
    meal_type text not null,
    servings integer not null,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index recipes_user_id_idx on public.recipes(user_id);
create index recipes_category_id_idx on public.recipes(category_id);
create index recipes_cuisine_type_idx on public.recipes(cuisine_type);
create index recipes_difficulty_idx on public.recipes(difficulty);
create index recipes_created_at_idx on public.recipes(created_at desc);
create index recipes_is_featured_idx on public.recipes(is_featured) where is_featured = true;
create index recipe_ratings_recipe_id_idx on public.recipe_ratings(recipe_id);
create index recipe_ratings_user_id_idx on public.recipe_ratings(user_id);
create index favorite_recipes_user_id_idx on public.favorite_recipes(user_id);
create index favorite_recipes_recipe_id_idx on public.favorite_recipes(recipe_id);
create index shopping_lists_user_id_idx on public.shopping_lists(user_id);
create index meal_plans_user_id_idx on public.meal_plans(user_id);
create index meal_plan_items_planned_date_idx on public.meal_plan_items(planned_date);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_dietary_restrictions enable row level security;
alter table public.recipe_ratings enable row level security;
alter table public.favorite_recipes enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.meal_plans enable row level security;
alter table public.meal_plan_items enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone"
    on public.profiles for select
    using (true);

create policy "Users can insert their own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- Create policies for categories
create policy "Categories are viewable by everyone"
    on public.categories for select
    using (true);

create policy "Categories are insertable by authenticated users"
    on public.categories for insert
    to authenticated
    with check (true);

create policy "Categories are updatable by authenticated users"
    on public.categories for update
    to authenticated
    using (true);

-- Create policies for recipes
create policy "Public recipes are viewable by everyone"
    on public.recipes for select
    using (not is_private or auth.uid() = user_id);

create policy "Users can insert their own recipes"
    on public.recipes for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own recipes"
    on public.recipes for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can delete their own recipes"
    on public.recipes for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create policies for recipe ratings
create policy "Recipe ratings are viewable by everyone"
    on public.recipe_ratings for select
    using (true);

create policy "Users can insert their own ratings"
    on public.recipe_ratings for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own ratings"
    on public.recipe_ratings for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can delete their own ratings"
    on public.recipe_ratings for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create policies for favorite recipes
create policy "Users can view their own favorite recipes"
    on public.favorite_recipes for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own favorite recipes"
    on public.favorite_recipes for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can delete their own favorite recipes"
    on public.favorite_recipes for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create policies for shopping lists
create policy "Users can view their own shopping lists"
    on public.shopping_lists for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own shopping lists"
    on public.shopping_lists for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own shopping lists"
    on public.shopping_lists for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can delete their own shopping lists"
    on public.shopping_lists for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create policies for meal plans
create policy "Users can view their own meal plans"
    on public.meal_plans for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own meal plans"
    on public.meal_plans for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own meal plans"
    on public.meal_plans for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can delete their own meal plans"
    on public.meal_plans for delete
    to authenticated
    using (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_profiles_updated_at
    before update on public.profiles
    for each row
    execute function public.handle_updated_at();

create trigger handle_categories_updated_at
    before update on public.categories
    for each row
    execute function public.handle_updated_at();

create trigger handle_recipes_updated_at
    before update on public.recipes
    for each row
    execute function public.handle_updated_at();

create trigger handle_recipe_ratings_updated_at
    before update on public.recipe_ratings
    for each row
    execute function public.handle_updated_at();

create trigger handle_shopping_lists_updated_at
    before update on public.shopping_lists
    for each row
    execute function public.handle_updated_at();

create trigger handle_shopping_list_items_updated_at
    before update on public.shopping_list_items
    for each row
    execute function public.handle_updated_at();

create trigger handle_meal_plans_updated_at
    before update on public.meal_plans
    for each row
    execute function public.handle_updated_at();

-- Create function to handle user profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, username, full_name, email, avatar_url)
    values (
        new.id,
        new.raw_user_meta_data->>'username',
        new.raw_user_meta_data->>'full_name',
        new.email,
        new.raw_user_meta_data->>'avatar_url'
    );
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create profile for new users
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Insert default categories
insert into public.categories (name, slug, description) values
    ('Breakfast', 'breakfast', 'Morning meals and brunch recipes'),
    ('Lunch', 'lunch', 'Midday meals and light dishes'),
    ('Dinner', 'dinner', 'Evening meals and main courses'),
    ('Appetizers', 'appetizers', 'Starters and small bites'),
    ('Soups', 'soups', 'Soups, stews, and broths'),
    ('Salads', 'salads', 'Fresh and healthy salads'),
    ('Main Dishes', 'main-dishes', 'Primary course recipes'),
    ('Side Dishes', 'side-dishes', 'Complementary dishes'),
    ('Desserts', 'desserts', 'Sweet treats and desserts'),
    ('Snacks', 'snacks', 'Light bites and appetizers'),
    ('Beverages', 'beverages', 'Drinks and cocktails'),
    ('Baking', 'baking', 'Breads, pastries, and baked goods'),
    ('Grilling', 'grilling', 'Barbecue and grilled dishes'),
    ('Healthy', 'healthy', 'Nutritious and wholesome recipes'),
    ('Quick & Easy', 'quick-and-easy', 'Fast and simple recipes')
on conflict (name) do nothing; 