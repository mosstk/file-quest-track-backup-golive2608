
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  username text unique,
  full_name text,
  avatar_url text,
  employee_id text unique,
  company text,
  department text,
  division text,
  role text check (role in ('fa_admin', 'requester', 'receiver')) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create profiles policy
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );
