create extension if not exists pgcrypto;

create table if not exists public.inspection_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  company text not null,
  phone text not null,
  city text not null,
  site_type text not null,
  scope text not null,
  service text not null,
  details text,
  requested_checks text[] not null default '{}',
  status text not null default 'new' check (status in ('new', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inspection_requests_user_created_idx
  on public.inspection_requests (user_id, created_at desc);

alter table public.inspection_requests enable row level security;

drop policy if exists "Users can read their own inspection requests" on public.inspection_requests;
create policy "Users can read their own inspection requests"
  on public.inspection_requests for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own inspection requests" on public.inspection_requests;
create policy "Users can create their own inspection requests"
  on public.inspection_requests for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own inspection requests" on public.inspection_requests;
create policy "Users can update their own inspection requests"
  on public.inspection_requests for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own inspection requests" on public.inspection_requests;
create policy "Users can delete their own inspection requests"
  on public.inspection_requests for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_inspection_requests_updated_at on public.inspection_requests;
create trigger set_inspection_requests_updated_at
before update on public.inspection_requests
for each row execute function public.set_updated_at();
