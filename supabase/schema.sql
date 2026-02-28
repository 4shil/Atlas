-- Atlas Database Schema
-- Run this in Supabase Dashboard → SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default 'Traveller',
  bio text default 'Adventure awaits 🌍',
  avatar_url text,
  has_onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Traveller'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- GOALS TABLE
-- ============================================
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text default '',
  image_url text,
  category text not null default 'Travel',
  created_at timestamptz not null default now(),
  timeline_date timestamptz not null,
  completed boolean not null default false,
  completed_at timestamptz,
  notes text default '',
  location_latitude double precision,
  location_longitude double precision,
  location_city text,
  location_country text,
  location_place_id text,
  updated_at timestamptz not null default now()
);

-- Updated_at auto-update trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger goals_updated_at
  before update on public.goals
  for each row execute procedure public.handle_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.profiles enable row level security;
alter table public.goals enable row level security;

-- Profiles: users can only see/edit their own profile
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Goals: users can only see/edit their own goals
create policy "goals_select_own" on public.goals
  for select using (auth.uid() = user_id);

create policy "goals_insert_own" on public.goals
  for insert with check (auth.uid() = user_id);

create policy "goals_update_own" on public.goals
  for update using (auth.uid() = user_id);

create policy "goals_delete_own" on public.goals
  for delete using (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET FOR IMAGES
-- ============================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'goal-images',
  'goal-images',
  true,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do nothing;

-- Storage RLS
create policy "goal_images_upload" on storage.objects
  for insert with check (
    bucket_id = 'goal-images' and auth.uid() is not null
  );

create policy "goal_images_read" on storage.objects
  for select using (bucket_id = 'goal-images');

create policy "goal_images_delete" on storage.objects
  for delete using (
    bucket_id = 'goal-images' and auth.uid()::text = (storage.foldername(name))[1]
  );
