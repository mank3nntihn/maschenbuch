-- Nur für lokale Tests ohne Docker: baut die Teile von Supabase nach, die die Migrationen brauchen.
-- In GitHub laufen die Tests gegen ein echtes Supabase (supabase start), dort wird diese Datei nicht benutzt.
do $$ begin
  if not exists(select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
end $$;
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
grant usage on schema extensions to anon, authenticated;
create schema if not exists auth;
grant usage on schema auth to anon, authenticated;
create table if not exists auth.users (id uuid primary key, email text, created_at timestamptz default now());
create or replace function auth.uid() returns uuid language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'))::uuid $$;
grant execute on function auth.uid() to anon, authenticated;
grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
do $$ begin if not exists(select 1 from pg_publication where pubname='supabase_realtime') then create publication supabase_realtime; end if; end $$;
