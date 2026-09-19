-- Leaderboard table for Build-A-Brain Co.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

create table if not exists public.leaderboard (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 1 and 20),
  accuracy     integer not null check (accuracy between 0 and 1000),
  fairness     integer not null check (fairness between 0 and 1000),
  transparency integer not null check (transparency between 0 and 1000),
  -- Computed by the database so a submitted total can never disagree with
  -- the three-axis breakdown it came from.
  total        integer generated always as (accuracy + fairness + transparency) stored,
  created_at   timestamptz not null default now()
);

create index if not exists leaderboard_total_idx
  on public.leaderboard (total desc, created_at asc);

-- Row Level Security: the browser uses the public "anon" key, so these
-- policies are the only thing controlling what visitors can do. Anyone can
-- read scores and add a new one; nobody can edit or delete them.
alter table public.leaderboard enable row level security;

drop policy if exists "Anyone can read scores" on public.leaderboard;
create policy "Anyone can read scores"
  on public.leaderboard for select
  to anon
  using (true);

drop policy if exists "Anyone can submit a score" on public.leaderboard;
create policy "Anyone can submit a score"
  on public.leaderboard for insert
  to anon
  with check (true);
