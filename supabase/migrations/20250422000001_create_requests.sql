
create type public.request_status as enum (
  'pending',
  'approved',
  'rejected',
  'rework',
  'completed'
);

create table public.requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  requester_id uuid references public.profiles(id) not null,
  document_name text not null,
  receiver_email text not null,
  file_path text,
  status public.request_status default 'pending'::public.request_status not null,
  tracking_number text,
  admin_feedback text,
  is_delivered boolean default false,
  approved_by uuid references public.profiles(id)
);

-- Enable RLS
alter table public.requests enable row level security;

-- Create requests policies
create policy "Requesters can create requests"
  on public.requests for insert
  with check (
    auth.uid() = requester_id 
    and exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'requester'
    )
  );

create policy "FA Admins can view all requests"
  on public.requests for select
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'fa_admin'
    )
  );

create policy "Requesters can view their own requests"
  on public.requests for select
  using (
    requester_id = auth.uid()
  );

create policy "Receivers can view approved requests sent to them"
  on public.requests for select
  using (
    status = 'approved' 
    and receiver_email = (
      select email from auth.users where id = auth.uid()
    )
  );

create policy "FA Admins can update any request"
  on public.requests for update
  using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role = 'fa_admin'
    )
  );

create policy "Requesters can update their own pending or rework requests"
  on public.requests for update
  using (
    requester_id = auth.uid()
    and status in ('pending', 'rework')
  );
