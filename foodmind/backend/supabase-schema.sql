-- Supabase SQL Editor で実行してください

create table if not exists items (
  id          text        primary key,
  name        text        not null,
  category    text        not null check (category in ('fridge', 'freezer', 'vegetable', 'pantry')),
  quantity    integer     not null check (quantity >= 0),
  expiry_days integer     not null check (expiry_days >= 0),
  created_at  timestamptz not null default now()
);

create table if not exists consumption_logs (
  id         text        primary key,
  food_id    text,
  amount     integer     not null check (amount > 0),
  waste      boolean     not null default false,
  used_at    timestamptz not null default now()
);

-- MVP では RLS を無効化（本番運用時は有効化推奨）
alter table items disable row level security;
alter table consumption_logs disable row level security;
