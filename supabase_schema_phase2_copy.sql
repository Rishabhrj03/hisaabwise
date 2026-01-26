-- Phase 2: WhatsApp Invites & Groups

-- 1. Update Friends Table for Invitations
alter table public.friends 
add column if not exists phone text,
add column if not exists linked_user_id uuid references auth.users(id);

-- 2. Create Groups Tables
create table if not exists public.groups (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references auth.users(id) not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.group_members (
  group_id uuid references public.groups(id) on delete cascade not null,
  member_id uuid references public.friends(id) on delete cascade not null,
  primary key (group_id, member_id)
);

-- 3. Update Expenses for Groups
alter table public.expenses 
add column if not exists group_id uuid references public.groups(id) on delete set null;

-- 4. Enable RLS for New Tables
alter table public.groups enable row level security;
alter table public.group_members enable row level security;

-- 5. Policies for Groups
-- Users can view groups they created
create policy "Users can view their own groups" on public.groups 
  for select using (auth.uid() = created_by);

create policy "Users can insert their own groups" on public.groups 
  for insert with check (auth.uid() = created_by);

create policy "Users can update their own groups" on public.groups 
  for update using (auth.uid() = created_by);

create policy "Users can delete their own groups" on public.groups 
  for delete using (auth.uid() = created_by);

-- Policies for Group Members
-- Users can manage members for their own groups (indirectly via friends)
create policy "Users can view members of their groups" on public.group_members 
  for select using (
    exists (select 1 from public.groups where id = group_members.group_id and created_by = auth.uid())
  );

create policy "Users can insert members to their groups" on public.group_members 
  for insert with check (
    exists (select 1 from public.groups where id = group_members.group_id and created_by = auth.uid())
  );

create policy "Users can delete members from their groups" on public.group_members 
  for delete using (
    exists (select 1 from public.groups where id = group_members.group_id and created_by = auth.uid())
  );

-- 6. Trigger for Auto-Mapping Users by Phone
-- This function runs when a NEW USER signs up.
create or replace function public.handle_new_user_mapping()
returns trigger as $$
begin
  -- If the new user has a phone number
  if new.phone is not null then
    -- Update friends table where phone matches (and linked_user_id is null)
    -- This links a friend record (created by someone else) to this new real user
    update public.friends
    set linked_user_id = new.id
    where phone = new.phone 
      and linked_user_id is null; 
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication errors on re-runs
drop trigger if exists on_auth_user_created_mapping on auth.users;

create trigger on_auth_user_created_mapping
  after insert on auth.users
  for each row execute procedure public.handle_new_user_mapping();
