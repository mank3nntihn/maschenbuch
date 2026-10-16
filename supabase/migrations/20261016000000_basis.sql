-- Maschenbuch: Stand der Datenbank am 16.10.2026 (vorher nur direkt in Supabase angelegt).
-- Tabellen, Regeln (Row Level Security), Trigger und Funktionen.

-- ---------- Hilfsfunktionen ----------
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;

-- Schreib-Bremse: dieselbe Zeile höchstens alle 0,5 Sekunden ändern
create or replace function public.write_brake() returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and old.updated_at > now() - interval '500 milliseconds' then
    raise exception 'zu_schnell' using errcode = 'P0001', hint = 'Bitte kurz warten';
  end if;
  return new;
end $$;

-- Für den täglichen Keep-Alive (kostenloses Projekt pausiert sonst)
create or replace function public.ping() returns timestamptz language sql stable set search_path = '' as $$ select now() $$;
revoke all on function public.ping() from public;
grant execute on function public.ping() to anon, authenticated;

-- ---------- Eigener Stand (Projekte, Garnlager, Einstellungen) ----------
create table if not exists public.user_state (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  constraint user_state_size check (pg_column_size(data) < 524288)
);
alter table public.user_state enable row level security;
create policy "eigener Stand lesen"   on public.user_state for select to authenticated using ((select auth.uid()) = user_id);
create policy "eigener Stand anlegen" on public.user_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "eigener Stand ändern"  on public.user_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "eigener Stand löschen" on public.user_state for delete to authenticated using ((select auth.uid()) = user_id);
create trigger user_state_brake before update on public.user_state for each row execute function public.write_brake();
create trigger user_state_touch before insert or update on public.user_state for each row execute function public.touch_updated_at();

-- ---------- Knit-Along: ein Balken pro Person ----------
create table if not exists public.kal (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 24),
  proj text not null default '' check (char_length(proj) <= 40),
  pct smallint not null default 0 check (pct between 0 and 100),
  row_no integer not null default 0 check (row_no >= 0),
  total integer not null default 0 check (total >= 0),
  col text not null default '#f4a6c6' check (col ~ '^#[0-9a-fA-F]{6}$'),
  updated_at timestamptz not null default now()
);
alter table public.kal enable row level security;
create policy "Knit-Along lesen"          on public.kal for select to authenticated using (true);
create policy "eigenen Balken anlegen"    on public.kal for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "eigenen Balken ändern"     on public.kal for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "eigenen Balken entfernen"  on public.kal for delete to authenticated using ((select auth.uid()) = user_id);
create trigger kal_brake before update on public.kal for each row execute function public.write_brake();
create trigger kal_touch before insert or update on public.kal for each row execute function public.touch_updated_at();

-- ---------- Tauschbörse ----------
create table if not exists public.tausch (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 24),
  garn text not null check (char_length(garn) between 1 and 80),
  col text not null default '#f4a6c6' check (col ~ '^#[0-9a-fA-F]{6}$'),
  menge text not null default '' check (char_length(menge) <= 30),
  notiz text not null default '' check (char_length(notiz) <= 120),
  created_at timestamptz not null default now()
);
create index if not exists tausch_user_idx on public.tausch(user_id);
alter table public.tausch enable row level security;
create policy "Tauschbörse lesen"       on public.tausch for select to authenticated using (true);
create policy "eigenes Angebot anlegen"  on public.tausch for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "eigenes Angebot ändern"   on public.tausch for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "eigenes Angebot löschen"  on public.tausch for delete to authenticated using ((select auth.uid()) = user_id);

create table if not exists public.tausch_wunsch (
  tausch_id uuid not null references public.tausch(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 24),
  created_at timestamptz not null default now(),
  primary key (tausch_id, user_id)
);
create index if not exists tausch_wunsch_user_idx on public.tausch_wunsch(user_id);
alter table public.tausch_wunsch enable row level security;
create policy "Wünsche lesen"           on public.tausch_wunsch for select to authenticated using (true);
create policy "eigenen Wunsch anlegen"  on public.tausch_wunsch for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "eigenen Wunsch löschen"  on public.tausch_wunsch for delete to authenticated using ((select auth.uid()) = user_id);

-- Höchstens 30 Angebote pro Person
create or replace function public.tausch_limit() returns trigger language plpgsql set search_path = '' as $$
begin
  if (select count(*) from public.tausch where user_id = new.user_id) >= 30 then raise exception 'zu_viele_angebote'; end if;
  return new;
end $$;
create trigger tausch_limit before insert on public.tausch for each row execute function public.tausch_limit();

-- ---------- Eigenes Konto samt Daten löschen ----------
create or replace function public.delete_my_account() returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'nicht angemeldet'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ---------- Live-Änderungen (Realtime) ----------
alter publication supabase_realtime add table public.user_state, public.kal, public.tausch, public.tausch_wunsch;
