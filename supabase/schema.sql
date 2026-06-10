-- ============================================================
-- STRIDE — Supabase schema
-- Run this in your Supabase SQL editor to set up all tables
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── Profiles ────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  name         text        not null,
  email        text        not null unique,
  avatar_url   text,
  timezone     text        not null default 'Africa/Nairobi',
  onboarded    boolean     not null default false,
  created_at   timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "Users can view own profile"   on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- ─── Goals ───────────────────────────────────────────────────────────────────
create table if not exists goals (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references profiles(id) on delete cascade,
  title           text        not null,
  description     text,
  type            text        not null check (type in ('habit','milestone')),
  category        text        not null default 'personal',
  status          text        not null default 'active' check (status in ('active','completed','paused','archived')),
  target_date     date,
  checkin_time    time,
  current_streak  int         not null default 0,
  longest_streak  int         not null default 0,
  freeze_count    int         not null default 2,
  progress        int         not null default 0 check (progress between 0 and 100),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table goals enable row level security;
create policy "Users manage own goals" on goals for all using (auth.uid() = user_id);

-- ─── Milestones ───────────────────────────────────────────────────────────────
create table if not exists milestones (
  id            uuid        primary key default gen_random_uuid(),
  goal_id       uuid        not null references goals(id) on delete cascade,
  user_id       uuid        not null references profiles(id) on delete cascade,
  title         text        not null,
  due_date      date,
  completed     boolean     not null default false,
  completed_at  timestamptz,
  sort_order    int         not null default 0,
  created_at    timestamptz not null default now()
);

alter table milestones enable row level security;
create policy "Users manage own milestones" on milestones for all using (auth.uid() = user_id);

-- ─── Streak days ──────────────────────────────────────────────────────────────
create table if not exists streak_days (
  id           uuid        primary key default gen_random_uuid(),
  goal_id      uuid        not null references goals(id) on delete cascade,
  user_id      uuid        not null references profiles(id) on delete cascade,
  date         date        not null,
  checked_in   boolean     not null default false,
  freeze_used  boolean     not null default false,
  created_at   timestamptz not null default now(),
  unique (goal_id, date)
);

alter table streak_days enable row level security;
create policy "Users manage own streak days" on streak_days for all using (auth.uid() = user_id);

-- ─── Check-ins ────────────────────────────────────────────────────────────────
create table if not exists check_ins (
  id               uuid        primary key default gen_random_uuid(),
  goal_id          uuid        not null references goals(id) on delete cascade,
  user_id          uuid        not null references profiles(id) on delete cascade,
  date             date        not null,
  note             text,
  mood             int         not null check (mood between 1 and 5),
  progress_update  int         check (progress_update between 0 and 100),
  created_at       timestamptz not null default now(),
  unique (goal_id, date)
);

alter table check_ins enable row level security;
create policy "Users manage own check-ins" on check_ins for all using (auth.uid() = user_id);

-- ─── Daily missions ───────────────────────────────────────────────────────────
create table if not exists daily_missions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references profiles(id) on delete cascade,
  date        date        not null,
  mission     text        not null,
  created_at  timestamptz not null default now(),
  unique (user_id, date)
);

alter table daily_missions enable row level security;
create policy "Users manage own missions" on daily_missions for all using (auth.uid() = user_id);

-- ─── Weekly reviews ───────────────────────────────────────────────────────────
create table if not exists weekly_reviews (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references profiles(id) on delete cascade,
  week_start          date        not null,
  what_done           text        not null default '',
  what_skipped        text        not null default '',
  what_blocked        text        not null default '',
  what_learned        text        not null default '',
  next_week_mission   text        not null default '',
  created_at          timestamptz not null default now(),
  unique (user_id, week_start)
);

alter table weekly_reviews enable row level security;
create policy "Users manage own reviews" on weekly_reviews for all using (auth.uid() = user_id);

-- ─── Trigger: create profile on signup ───────────────────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
