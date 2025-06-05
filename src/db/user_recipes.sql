-- Create the user_recipes table
create table public.user_recipes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  ingredients text[] not null,
  instructions text[] not null,
  prep_time integer not null,
  cook_time integer not null,
  servings integer not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index on user_id for faster lookups
create index user_recipes_user_id_idx on public.user_recipes(user_id);

-- Enable Row Level Security (RLS)
alter table public.user_recipes enable row level security;

-- Create policies
-- Allow users to view only their own recipes
create policy "Users can view own recipes"
  on public.user_recipes for select
  using (auth.uid() = user_id);

-- Allow users to insert their own recipes
create policy "Users can create recipes"
  on public.user_recipes for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own recipes
create policy "Users can update own recipes"
  on public.user_recipes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow users to delete their own recipes
create policy "Users can delete own recipes"
  on public.user_recipes for delete
  using (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create a trigger to automatically update the updated_at timestamp
create trigger handle_updated_at
  before update on public.user_recipes
  for each row
  execute function public.handle_updated_at(); 