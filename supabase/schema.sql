-- Invoice App schema for Supabase (Postgres)
-- Run this once in Supabase → SQL Editor after creating your free project.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  biller_name text not null default '',
  tagline text default '',
  address text default '',
  gst_no text default '',
  pan_no text default '',
  state_code text default '27',
  phone text default '',
  email text default '',
  bank_name text default '',
  account_no text default '',
  ifsc_code text default '',
  branch text default '',
  proprietor_name text default '',
  updated_at timestamptz default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_name text not null,
  address text default '',
  phone_no text default '',
  mobile_no text default '',
  gst_no text default '',
  pan_no text default '',
  state_code text default '',
  email_id text default '',
  created_at timestamptz default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_name text not null,
  rate numeric(14,2) not null default 0,
  description text default '',
  created_at timestamptz default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  doc_type text not null default 'tax_invoice' check (doc_type in ('quotation','tax_invoice')),
  bill_number integer not null default 0,
  client_id uuid not null references public.clients(id),
  invoice_date date not null default current_date,
  sac_code text default '',
  gst_rate numeric(6,2) not null default 18,
  cgst_pct numeric(6,2) not null default 0,
  sgst_pct numeric(6,2) not null default 0,
  igst_pct numeric(6,2) not null default 0,
  sub_total numeric(14,2) not null default 0,
  cgst numeric(14,2) not null default 0,
  sgst numeric(14,2) not null default 0,
  igst numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  item_id uuid null references public.items(id) on delete set null,
  item_name text not null,
  type_name text not null default 'SFT',
  quantity numeric(14,2) not null default 0,
  rate numeric(14,2) not null default 0,
  line_total numeric(14,2) not null default 0
);

create index if not exists idx_clients_user on public.clients(user_id);
create index if not exists idx_items_user on public.items(user_id);
create index if not exists idx_invoices_user on public.invoices(user_id);
create index if not exists idx_invoices_date on public.invoices(invoice_date);
create index if not exists idx_invoice_items_invoice on public.invoice_items(invoice_id);

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "clients_own" on public.clients;
create policy "clients_own" on public.clients for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "items_own" on public.items;
create policy "items_own" on public.items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "invoices_own" on public.invoices;
create policy "invoices_own" on public.invoices for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "invoice_items_own" on public.invoice_items;
create policy "invoice_items_own" on public.invoice_items for all
  using (exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid()))
  with check (exists (select 1 from public.invoices i where i.id = invoice_id and i.user_id = auth.uid()));

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, biller_name, email, proprietor_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
