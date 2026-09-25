-- ============================================================
-- SCHEMA COMPLETO — ANTARES STOCK FLOW
-- Rode esse arquivo inteiro no SQL Editor do seu projeto Supabase
-- (Dashboard > SQL Editor > New query > colar > Run)
-- ============================================================

-- Extensão para gerar UUIDs
create extension if not exists "pgcrypto";

-- ---------- ENUMS ----------
create type product_status as enum ('disponivel', 'reservado', 'vendido');
create type movement_type as enum ('entrada', 'saida');
create type user_role as enum ('admin', 'gerente', 'vendedor');

-- ---------- PRODUCTS ----------
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text,
  category text,
  size text,
  image_url text,
  cost_price numeric(10,2) not null default 0,
  sale_price numeric(10,2) not null default 0,
  status product_status not null default 'disponivel',
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- MOVEMENTS ----------
create table movements (
  id uuid primary key default gen_random_uuid(),
  type movement_type not null,
  description text not null,
  amount numeric(10,2) not null default 0,
  quantity integer not null default 1,
  occurred_at date not null,
  product_id uuid references products(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- PROFILES (espelha auth.users) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

-- ---------- USER_ROLES ----------
create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role user_role not null,
  unique (user_id)
);

-- ---------- TRIGGER: cria profile automaticamente ao criar usuário ----------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- Regra simples: qualquer usuário autenticado pode ler/gravar.
-- Ajuste depois se quiser regras mais restritas por papel.
-- ============================================================

alter table products enable row level security;
alter table movements enable row level security;
alter table profiles enable row level security;
alter table user_roles enable row level security;

create policy "authenticated_read_products" on products
  for select using (auth.role() = 'authenticated');
create policy "authenticated_write_products" on products
  for insert with check (auth.role() = 'authenticated');
create policy "authenticated_update_products" on products
  for update using (auth.role() = 'authenticated');
create policy "authenticated_delete_products" on products
  for delete using (auth.role() = 'authenticated');

create policy "authenticated_read_movements" on movements
  for select using (auth.role() = 'authenticated');
create policy "authenticated_write_movements" on movements
  for insert with check (auth.role() = 'authenticated');
create policy "authenticated_delete_movements" on movements
  for delete using (auth.role() = 'authenticated');

create policy "authenticated_read_profiles" on profiles
  for select using (auth.role() = 'authenticated');

create policy "authenticated_read_roles" on user_roles
  for select using (auth.role() = 'authenticated');

-- ============================================================
-- PRIMEIRO USUÁRIO ADMIN
-- Depois de criar seu usuário em Authentication > Users,
-- rode o comando abaixo trocando o e-mail:
-- ============================================================
-- insert into user_roles (user_id, role)
-- select id, 'admin' from auth.users where email = 'seuemail@antares.com';
