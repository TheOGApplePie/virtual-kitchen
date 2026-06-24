-- Virtual Kitchen — Supabase schema
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
-- Replaces the old Prisma/Postgres schema now that the app talks to Supabase directly.

create table if not exists inventory_items (
  id          bigint generated always as identity primary key,
  category    text not null,
  name        text not null,
  quantity    numeric not null default 0,
  count       integer not null default 1,
  unit        text not null,
  location    text not null default '',
  expiry_date date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists inventory_items_location_idx on inventory_items (location);

create table if not exists recipes (
  id          bigint generated always as identity primary key,
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists recipe_ingredients (
  id        bigint generated always as identity primary key,
  recipe_id bigint not null references recipes (id) on delete cascade,
  name      text not null,
  quantity  numeric not null,
  unit      text not null
);

create index if not exists recipe_ingredients_recipe_id_idx on recipe_ingredients (recipe_id);

-- Keep updated_at current on every row update.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists inventory_items_set_updated_at on inventory_items;
create trigger inventory_items_set_updated_at
  before update on inventory_items
  for each row execute function set_updated_at();

drop trigger if exists recipes_set_updated_at on recipes;
create trigger recipes_set_updated_at
  before update on recipes
  for each row execute function set_updated_at();

-- RLS: open policies for now (single-household prototype, no auth yet).
-- Tighten these once household accounts/auth are introduced.
alter table inventory_items enable row level security;
alter table recipes enable row level security;
alter table recipe_ingredients enable row level security;

drop policy if exists "inventory_items_all" on inventory_items;
create policy "inventory_items_all" on inventory_items for all using (true) with check (true);

drop policy if exists "recipes_all" on recipes;
create policy "recipes_all" on recipes for all using (true) with check (true);

drop policy if exists "recipe_ingredients_all" on recipe_ingredients;
create policy "recipe_ingredients_all" on recipe_ingredients for all using (true) with check (true);
