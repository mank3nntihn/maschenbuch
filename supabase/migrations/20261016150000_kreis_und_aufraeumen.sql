-- Freundeskreis mit Einladungscode und täglicher Aufräumdienst.
-- Der Code selbst steht NICHT hier (das Repo ist öffentlich), nur als Hash in der Tabelle kreis.
-- Code setzen/ändern (im Supabase SQL Editor):
--   insert into public.kreis(id, code_hash) values (1, extensions.crypt(lower('NeuerCode'), extensions.gen_salt('bf')))
--   on conflict (id) do update set code_hash = excluded.code_hash;
-- Wer schon Mitglied ist, bleibt es auch nach einem neuen Code.

-- ---------- Tabellen ----------
create table if not exists public.kreis (
  id int primary key default 1 check (id = 1),
  code_hash text not null
);
create table if not exists public.kreis_mitglied (
  user_id uuid primary key references auth.users(id) on delete cascade,
  seit timestamptz not null default now()
);
create table if not exists public.code_versuch (
  ip text not null,
  at timestamptz not null default now()
);
create index if not exists code_versuch_ip_idx on public.code_versuch(ip, at);

-- kreis und code_versuch: nur über die Funktionen unten erreichbar (RLS an, keine Regeln)
alter table public.kreis enable row level security;
alter table public.code_versuch enable row level security;
alter table public.kreis_mitglied enable row level security;
revoke all on public.kreis, public.code_versuch from anon, authenticated;
revoke insert, update, delete on public.kreis_mitglied from anon, authenticated;
create policy "eigene Mitgliedschaft sehen" on public.kreis_mitglied for select to authenticated using ((select auth.uid()) = user_id);

-- Wer schon ein Konto hat, gehört zum Kreis (bestehende Konten nicht aussperren)
insert into public.kreis_mitglied(user_id) select id from auth.users on conflict do nothing;

-- ---------- Funktionen ----------
create or replace function public.ist_mitglied() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.kreis_mitglied where user_id = (select auth.uid()))
$$;

-- IP der Anfrage (für die Bremse gegen Durchprobieren)
create or replace function public.anfrage_ip() returns text language sql stable set search_path = '' as $$
  select coalesce(nullif(btrim(split_part(
    (nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for'), ',', 1)), ''), 'unbekannt')
$$;

-- Code prüfen: Groß-/Kleinschreibung und Leerzeichen am Rand egal.
-- Nach 10 falschen Versuchen in 15 Minuten von derselben IP ist Pause.
create or replace function public.kreis_code_ok(code text) returns boolean language plpgsql security definer set search_path = '' as $$
declare h text; v_ip text := public.anfrage_ip(); ok boolean;
begin
  if (select count(*) from public.code_versuch where ip = v_ip and at > now() - interval '15 minutes') >= 10 then
    raise exception 'zu_viele_versuche' using hint = 'Bitte später nochmal';
  end if;
  select code_hash into h from public.kreis where id = 1;
  ok := h is not null and code is not null and extensions.crypt(lower(btrim(code)), h) = h;
  if not ok then insert into public.code_versuch(ip) values (v_ip); end if;
  return ok;
end $$;

-- Sperrbildschirm der App (auch ohne Anmeldung)
create or replace function public.kreis_code_pruefen(code text) returns boolean language sql security definer set search_path = '' as $$
  select public.kreis_code_ok(code)
$$;

-- Nach der Google-Anmeldung: in den Kreis eintreten (bestehende Mitglieder brauchen den Code nicht mehr)
create or replace function public.kreis_beitreten(code text) returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'nicht angemeldet'; end if;
  if exists(select 1 from public.kreis_mitglied where user_id = auth.uid()) then return true; end if;
  if not public.kreis_code_ok(code) then return false; end if;
  insert into public.kreis_mitglied(user_id) values (auth.uid()) on conflict do nothing;
  return true;
end $$;

revoke all on function public.ist_mitglied(), public.anfrage_ip(), public.kreis_code_ok(text),
  public.kreis_code_pruefen(text), public.kreis_beitreten(text) from public, anon, authenticated;
grant execute on function public.ist_mitglied() to authenticated;
grant execute on function public.kreis_code_pruefen(text) to anon, authenticated;
grant execute on function public.kreis_beitreten(text) to authenticated;

-- ---------- Regeln: nur Mitglieder ----------
drop policy if exists "eigener Stand lesen" on public.user_state;
drop policy if exists "eigener Stand anlegen" on public.user_state;
drop policy if exists "eigener Stand ändern" on public.user_state;
drop policy if exists "eigener Stand löschen" on public.user_state;
create policy "eigener Stand lesen"   on public.user_state for select to authenticated using ((select auth.uid()) = user_id and (select public.ist_mitglied()));
create policy "eigener Stand anlegen" on public.user_state for insert to authenticated with check ((select auth.uid()) = user_id and (select public.ist_mitglied()));
create policy "eigener Stand ändern"  on public.user_state for update to authenticated using ((select auth.uid()) = user_id and (select public.ist_mitglied())) with check ((select auth.uid()) = user_id);
create policy "eigener Stand löschen" on public.user_state for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Knit-Along lesen" on public.kal;
drop policy if exists "eigenen Balken anlegen" on public.kal;
drop policy if exists "eigenen Balken ändern" on public.kal;
drop policy if exists "eigenen Balken entfernen" on public.kal;
create policy "Knit-Along lesen"         on public.kal for select to authenticated using ((select public.ist_mitglied()));
create policy "eigenen Balken anlegen"   on public.kal for insert to authenticated with check ((select auth.uid()) = user_id and (select public.ist_mitglied()));
create policy "eigenen Balken ändern"    on public.kal for update to authenticated using ((select auth.uid()) = user_id and (select public.ist_mitglied())) with check ((select auth.uid()) = user_id);
create policy "eigenen Balken entfernen" on public.kal for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Tauschbörse lesen" on public.tausch;
drop policy if exists "eigenes Angebot anlegen" on public.tausch;
drop policy if exists "eigenes Angebot ändern" on public.tausch;
drop policy if exists "eigenes Angebot löschen" on public.tausch;
create policy "Tauschbörse lesen"       on public.tausch for select to authenticated using ((select public.ist_mitglied()));
create policy "eigenes Angebot anlegen" on public.tausch for insert to authenticated with check ((select auth.uid()) = user_id and (select public.ist_mitglied()));
create policy "eigenes Angebot ändern"  on public.tausch for update to authenticated using ((select auth.uid()) = user_id and (select public.ist_mitglied())) with check ((select auth.uid()) = user_id);
create policy "eigenes Angebot löschen" on public.tausch for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Wünsche lesen" on public.tausch_wunsch;
drop policy if exists "eigenen Wunsch anlegen" on public.tausch_wunsch;
drop policy if exists "eigenen Wunsch löschen" on public.tausch_wunsch;
create policy "Wünsche lesen"          on public.tausch_wunsch for select to authenticated using ((select public.ist_mitglied()));
create policy "eigenen Wunsch anlegen" on public.tausch_wunsch for insert to authenticated with check ((select auth.uid()) = user_id and (select public.ist_mitglied()));
create policy "eigenen Wunsch löschen" on public.tausch_wunsch for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------- Täglicher Aufräumdienst (GitHub Action, siehe .github/workflows/keepalive.yml) ----------
-- Knit-Along-Balken ohne Änderung seit 60 Tagen, Tauschangebote älter als 90 Tage,
-- alte Code-Versuche und Konten, die nach 7 Tagen immer noch nicht im Kreis sind.
create or replace function public.aufraeumen() returns json language plpgsql security definer set search_path = '' as $$
declare a int; b int; c int; d int;
begin
  delete from public.kal where updated_at < now() - interval '60 days'; get diagnostics a = row_count;
  delete from public.tausch where created_at < now() - interval '90 days'; get diagnostics b = row_count;
  delete from public.code_versuch where at < now() - interval '1 day'; get diagnostics c = row_count;
  delete from auth.users u where u.created_at < now() - interval '7 days'
    and not exists(select 1 from public.kreis_mitglied m where m.user_id = u.id); get diagnostics d = row_count;
  return json_build_object('knit_along', a, 'tausch', b, 'code_versuche', c, 'fremde_konten', d);
end $$;
revoke all on function public.aufraeumen() from public, authenticated;
grant execute on function public.aufraeumen() to anon;
