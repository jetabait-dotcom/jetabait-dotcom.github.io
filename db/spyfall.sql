-- Only the JWT-protected Edge Function accesses hidden game state.
create table if not exists public.spyfall_rooms (
 code text primary key check(code ~ '^[A-F0-9]{8}$'),
 creator_hash text not null, state jsonb not null,
 version bigint not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.spyfall_rooms enable row level security;
revoke all on public.spyfall_rooms from public,anon,authenticated;
grant all on public.spyfall_rooms to service_role;
create index if not exists spyfall_rooms_creator_idx on public.spyfall_rooms(creator_hash,created_at);
create policy spyfall_deny_direct_access on public.spyfall_rooms for all to anon,authenticated using(false) with check(false);
