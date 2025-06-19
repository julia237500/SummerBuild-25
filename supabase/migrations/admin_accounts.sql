create table if not exists public.admin_accounts (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default admin if not exists
insert into public.admin_accounts (email, password)
select 'admin@abc.com', 'Recipehub123$'
where not exists (
  select 1 from public.admin_accounts where email = 'admin@abc.com'
);

-- Enable RLS and allow select/update for all (for dev, restrict in prod)
alter table public.admin_accounts enable row level security;

create policy "Allow admin login" on public.admin_accounts for select using (true);
create policy "Allow admin update" on public.admin_accounts for update using (true);
