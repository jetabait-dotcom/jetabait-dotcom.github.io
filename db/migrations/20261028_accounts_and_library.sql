-- Supabase Auth owns credentials and sessions. All application data is owner-scoped.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.library_entries (
  owner_id uuid not null references auth.users(id) on delete cascade,
  entry_id text not null check (char_length(entry_id) between 1 and 250),
  payload jsonb,
  deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_id, entry_id),
  constraint library_payload_shape check (
    (deleted and payload is null) or
    (not deleted and payload is not null and jsonb_typeof(payload) = 'object'
      and payload ?& array['id','title','kind','status','progress']
      and jsonb_typeof(payload->'title') = 'string'
      and char_length(payload->>'title') between 1 and 250
      and payload->>'id' = entry_id
      and payload->>'kind' in ('anime','movie')
      and payload->>'status' in ('planned','watching','completed','paused')
      and octet_length(payload::text) <= 64000)
  )
);

create function public.jetabait_set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.jetabait_set_updated_at();
create trigger library_entries_updated_at before update on public.library_entries
for each row execute function public.jetabait_set_updated_at();

alter table public.profiles enable row level security;
alter table public.library_entries enable row level security;
revoke all on public.profiles, public.library_entries from anon, authenticated;
grant select, insert, update, delete on public.profiles, public.library_entries to authenticated;

create policy profiles_owner_select on public.profiles for select to authenticated
using ((select auth.uid()) = id);
create policy profiles_owner_insert on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);
create policy profiles_owner_update on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy profiles_owner_delete on public.profiles for delete to authenticated
using ((select auth.uid()) = id);
create policy library_owner_select on public.library_entries for select to authenticated
using ((select auth.uid()) = owner_id);
create policy library_owner_insert on public.library_entries for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy library_owner_update on public.library_entries for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy library_owner_delete on public.library_entries for delete to authenticated
using ((select auth.uid()) = owner_id);
