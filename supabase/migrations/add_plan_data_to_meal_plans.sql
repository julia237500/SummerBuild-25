-- Add plan_data column to meal_plans table if it does not exist
alter table public.meal_plans
add column if not exists plan_data jsonb;