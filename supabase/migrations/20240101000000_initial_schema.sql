-- Habilitar extensiones
create extension if not exists "uuid-ossp";

-- Perfiles (sincronizados desde webhook de Clerk)
-- id es text porque Clerk usa IDs tipo 'user_xxx', no UUIDs
create table if not exists profiles (
  id text primary key,
  username text unique,
  avatar_url text,
  style text[] default '{}',
  city text default 'Tepeji del Río',
  role text default 'skater' check (role in ('skater', 'admin')),
  created_at timestamptz default now()
);

-- Spots
create table if not exists spots (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  latitude float8 not null,
  longitude float8 not null,
  difficulty text not null check (difficulty in ('Fácil', 'Medio', 'Pro')),
  status text default 'Activo' check (status in ('Activo', 'Borrado', 'En obras')),
  added_by text references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Fotos de Spots
create table if not exists spot_photos (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid references spots(id) on delete cascade,
  url text not null,
  uploaded_by text references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- Trucos
create table if not exists tricks (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid references spots(id) on delete cascade,
  posted_by text references profiles(id) on delete set null,
  trick_name text not null,
  media_url text,
  media_type text check (media_type in ('imagen', 'video')),
  vote_count int default 0,
  created_at timestamptz default now()
);

-- Votos (un voto por usuario por truco)
create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  trick_id uuid references tricks(id) on delete cascade,
  user_id text references profiles(id) on delete cascade,
  unique(trick_id, user_id)
);

-- Índices para rendimiento
create index if not exists spots_added_by_idx on spots(added_by);
create index if not exists spots_status_idx on spots(status);
create index if not exists tricks_spot_id_idx on tricks(spot_id);
create index if not exists tricks_posted_by_idx on tricks(posted_by);
create index if not exists tricks_vote_count_idx on tricks(vote_count desc);
create index if not exists votes_trick_id_idx on votes(trick_id);
create index if not exists votes_user_id_idx on votes(user_id);

-- Funciones RPC para votos atómicos
create or replace function increment_vote_count(trick_id uuid)
returns void language sql security definer as $$
  update tricks set vote_count = vote_count + 1 where id = trick_id;
$$;

create or replace function decrement_vote_count(trick_id uuid)
returns void language sql security definer as $$
  update tricks set vote_count = greatest(vote_count - 1, 0) where id = trick_id;
$$;

-- RLS (Row Level Security)
alter table profiles enable row level security;
alter table spots enable row level security;
alter table spot_photos enable row level security;
alter table tricks enable row level security;
alter table votes enable row level security;

-- Políticas: lectura pública para todo
create policy "profiles_select_public" on profiles for select using (true);
create policy "spots_select_public" on spots for select using (true);
create policy "spot_photos_select_public" on spot_photos for select using (true);
create policy "tricks_select_public" on tricks for select using (true);
create policy "votes_select_public" on votes for select using (true);

-- Las escrituras se manejan vía service_role desde las API routes de Next.js
-- (No se necesitan políticas de escritura para anon ya que todo pasa por el backend)

-- Storage buckets (ejecutar desde Supabase Dashboard o CLI)
-- insert into storage.buckets (id, name, public) values ('spot-photos', 'spot-photos', true);
-- insert into storage.buckets (id, name, public) values ('trick-photos', 'trick-photos', true);
-- insert into storage.buckets (id, name, public) values ('trick-videos', 'trick-videos', true);
