-- MAT Database Schema for Supabase PostgreSQL

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USER LIBRARY TABLE
create table if not exists public.user_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  media_id text not null,
  media jsonb not null,
  status text not null check (status in ('watching', 'completed', 'dropped', 'plan_to_watch')),
  current_episode integer default 0,
  current_season integer default 1,
  progress_percent integer default 0,
  user_rating integer default 0,
  is_favorite boolean default false,
  notes text default '',
  platforms text[] default '{}',
  updated_at timestamptz default now(),
  added_at timestamptz default now()
);

-- 2. WATCH HISTORY TABLE
create table if not exists public.watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  media_id text not null,
  media_title text not null,
  media_poster text not null,
  media_type text not null,
  episode integer,
  season integer,
  watched_at timestamptz default now()
);

-- 3. COLLECTIONS TABLE (Playlists / Custom Folders)
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text default '',
  emoji text default '📁',
  items jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 4. UNIVERSE TIMELINES TABLE (Story Chronology Timelines)
create table if not exists public.universe_timelines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text default '',
  emoji text default '🌌',
  items jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- ENABLE ROW LEVEL SECURITY (RLS)
alter table public.user_library enable row level security;
alter table public.watch_history enable row level security;
alter table public.collections enable row level security;
alter table public.universe_timelines enable row level security;

-- RLS POLICIES FOR USER LIBRARY
drop policy if exists "Users can view own library" on public.user_library;
create policy "Users can view own library" on public.user_library for select using (auth.uid() = user_id);

drop policy if exists "Users can insert into own library" on public.user_library;
create policy "Users can insert into own library" on public.user_library for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own library" on public.user_library;
create policy "Users can update own library" on public.user_library for update using (auth.uid() = user_id);

drop policy if exists "Users can delete from own library" on public.user_library;
create policy "Users can delete from own library" on public.user_library for delete using (auth.uid() = user_id);

-- RLS POLICIES FOR WATCH HISTORY
drop policy if exists "Users can view own history" on public.watch_history;
create policy "Users can view own history" on public.watch_history for select using (auth.uid() = user_id);

drop policy if exists "Users can insert into own history" on public.watch_history;
create policy "Users can insert into own history" on public.watch_history for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete from own history" on public.watch_history;
create policy "Users can delete from own history" on public.watch_history for delete using (auth.uid() = user_id);

-- RLS POLICIES FOR COLLECTIONS
drop policy if exists "Users can view own collections" on public.collections;
create policy "Users can view own collections" on public.collections for select using (auth.uid() = user_id);

drop policy if exists "Users can insert into own collections" on public.collections;
create policy "Users can insert into own collections" on public.collections for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own collections" on public.collections;
create policy "Users can update own collections" on public.collections for update using (auth.uid() = user_id);

drop policy if exists "Users can delete from own collections" on public.collections;
create policy "Users can delete from own collections" on public.collections for delete using (auth.uid() = user_id);

-- RLS POLICIES FOR UNIVERSE TIMELINES
drop policy if exists "Users can view own universe timelines" on public.universe_timelines;
create policy "Users can view own universe timelines" on public.universe_timelines for select using (auth.uid() = user_id);

drop policy if exists "Users can insert into own universe timelines" on public.universe_timelines;
create policy "Users can insert into own universe timelines" on public.universe_timelines for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own universe timelines" on public.universe_timelines;
create policy "Users can update own universe timelines" on public.universe_timelines for update using (auth.uid() = user_id);

drop policy if exists "Users can delete from own universe timelines" on public.universe_timelines;
create policy "Users can delete from own universe timelines" on public.universe_timelines for delete using (auth.uid() = user_id);
