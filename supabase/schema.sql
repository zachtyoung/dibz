-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamptz default now() not null,
  email text not null,
  display_name text,
  avatar_url text,
  phone_verified boolean default false not null,
  id_verified boolean default false not null
);

-- Listings
create table if not exists public.listings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  user_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  price numeric(10,2) not null default 0,
  category text not null,
  condition text,
  location text not null,
  lat double precision not null,
  lng double precision not null,
  city_slug text not null,
  image_url text,
  seller_name text not null,
  is_garage_sale boolean default false not null,
  sale_type text,
  sale_date text,
  sale_date_iso date,
  posted_hours_ago integer,
  is_active boolean default true not null
);

-- Messages
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  listing_id uuid references public.listings(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  read boolean default false not null
);

-- Indexes for fast city + geo queries
create index if not exists listings_city_slug_idx on public.listings(city_slug);
create index if not exists listings_lat_lng_idx on public.listings(lat, lng);
create index if not exists listings_is_garage_sale_idx on public.listings(is_garage_sale);
create index if not exists listings_sale_date_iso_idx on public.listings(sale_date_iso);
create index if not exists messages_recipient_id_idx on public.messages(recipient_id);
create index if not exists messages_listing_id_idx on public.messages(listing_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.messages enable row level security;

-- Profiles: users can read all, update only their own
create policy "profiles_read_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Listings: anyone can read active listings, owners can insert/update/delete
create policy "listings_read_active" on public.listings for select using (is_active = true);
create policy "listings_insert_auth" on public.listings for insert with check (auth.uid() = user_id);
create policy "listings_update_own" on public.listings for update using (auth.uid() = user_id);
create policy "listings_delete_own" on public.listings for delete using (auth.uid() = user_id);

-- Messages: only sender/recipient can read, only sender can insert
create policy "messages_read_own" on public.messages for select using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "messages_insert_auth" on public.messages for insert with check (auth.uid() = sender_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
