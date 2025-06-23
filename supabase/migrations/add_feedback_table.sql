create table if not exists public.feedback (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.feedback enable row level security;

create policy "Anyone can insert feedback"
  on public.feedback for insert
  with check (true);
  
create policy "Admins can view all feedback"
  on public.feedback for select
  using (true);

create policy "Anyone can insert feedback"
  on public.feedback for insert
  with check (true);