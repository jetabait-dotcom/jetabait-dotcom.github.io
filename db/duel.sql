-- 7 Wonders Duel state is accessed only by the JWT-protected duel-game Edge Function.
-- Its server key never leaves the function. Player capabilities are SHA-256 hashed with Auth user ids.
create table if not exists public.duel_rooms (
 code text primary key check (code ~ '^[A-F0-9]{10}$'),
 hash_a text not null, hash_b text,
 names jsonb not null, state jsonb not null,
 version bigint not null default 1, updated_at timestamptz not null default now()
);
alter table public.duel_rooms enable row level security;
revoke all on public.duel_rooms from public, anon, authenticated;
grant all on public.duel_rooms to service_role;
create index if not exists duel_rooms_updated_idx on public.duel_rooms(updated_at);
create index if not exists duel_rooms_creator_idx on public.duel_rooms(hash_a,updated_at);
do $$ begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='duel_rooms' and policyname='duel_deny_direct_access') then
  create policy duel_deny_direct_access on public.duel_rooms for all to anon,authenticated using(false) with check(false);
 end if;
end $$;
