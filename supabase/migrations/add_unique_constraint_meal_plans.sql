-- Add a unique constraint on (user_id, name) for meal_plans to support upsert with onConflict
alter table public.meal_plans
add constraint meal_plans_user_id_name_unique unique (user_id, name);