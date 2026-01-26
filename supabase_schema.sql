-- Create tables

-- Friends
create table if not exists public.friends (
  id uuid not null primary key,
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Expenses
create table if not exists public.expenses (
  id uuid not null primary key,
  created_by uuid references auth.users not null,
  amount numeric not null,
  description text not null,
  category text not null,
  type text not null check (type in ('income', 'expense')),
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  payer_id uuid -- Can be user_id (auth.users) or friend_id (public.friends)
);

-- Expense Splits
create table if not exists public.expense_splits (
  id uuid default gen_random_uuid() primary key,
  expense_id uuid references public.expenses on delete cascade not null,
  friend_id uuid references public.friends(id) on delete set null,
  is_user boolean not null default false,
  amount numeric not null,
  percentage numeric
);

-- Enable RLS
alter table public.friends enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;

-- Policies for Friends
create policy "Users can view their own friends" on public.friends for select using (auth.uid() = user_id);
create policy "Users can insert their own friends" on public.friends for insert with check (auth.uid() = user_id);
create policy "Users can delete their own friends" on public.friends for delete using (auth.uid() = user_id);

-- Policies for Expenses
create policy "Users can view their own expenses" on public.expenses for select using (auth.uid() = created_by);
create policy "Users can insert their own expenses" on public.expenses for insert with check (auth.uid() = created_by);
create policy "Users can delete their own expenses" on public.expenses for delete using (auth.uid() = created_by);

-- Policies for Expense Splits
create policy "Users can view splits for their expenses" on public.expense_splits for select using (
  exists (select 1 from public.expenses where id = expense_splits.expense_id and created_by = auth.uid())
);
create policy "Users can insert splits for their expenses" on public.expense_splits for insert with check (
  exists (select 1 from public.expenses where id = expense_splits.expense_id and created_by = auth.uid())
);
