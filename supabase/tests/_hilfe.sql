-- Kleine Test-Hilfen (laufen vor jeder Testdatei). Ergebnis jeder Prüfung: "ok – …" oder "FEHLER – …"
create schema if not exists test;
create table if not exists test.ergebnis(nr serial, ok boolean, name text);
grant usage on schema test to anon, authenticated;
grant all on test.ergebnis to anon, authenticated;
grant usage on sequence test.ergebnis_nr_seq to anon, authenticated;

create or replace function test.ok(b boolean, name text) returns void language plpgsql as $$
begin
  insert into test.ergebnis(ok, name) values (coalesce(b, false), name);
  raise notice '%', case when coalesce(b, false) then 'ok     – ' else 'FEHLER – ' end || name;
end $$;
-- Erwartet einen Fehler, dessen Meldung zum Muster passt
create or replace function test.fehler(sql text, muster text, name text) returns void language plpgsql as $$
declare m text;
begin
  begin execute sql; m := null; exception when others then m := sqlerrm; end;
  perform test.ok(m is not null and m ~* muster, name || case when m is null then ' (kam kein Fehler)' when m ~* muster then '' else ' (Meldung: ' || m || ')' end);
end $$;
-- Erwartet, dass es ohne Fehler klappt
create or replace function test.klappt(sql text, name text) returns void language plpgsql as $$
declare m text;
begin
  begin execute sql; m := null; exception when others then m := sqlerrm; end;
  perform test.ok(m is null, name || coalesce(' (Fehler: ' || m || ')', ''));
end $$;
-- Anzahl Zeilen, die die aktuelle Rolle sieht
create or replace function test.zeilen(sql text) returns bigint language plpgsql as $$
declare n bigint; begin execute 'select count(*) from (' || sql || ') x' into n; return n; end $$;
-- Anzahl Zeilen, die eine Änderung tatsächlich getroffen hat
create or replace function test.betroffen(sql text) returns bigint language plpgsql as $$
declare n bigint; begin execute sql; get diagnostics n = row_count; return n; end $$;
-- Rollen wechseln wie bei echten Anfragen über die App
create or replace function test.als(uid uuid) returns void language plpgsql as $$
begin
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end $$;
create or replace function test.anon() returns void language plpgsql as $$
begin
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', '', true);
  perform set_config('role', 'anon', true);
end $$;
create or replace function test.admin() returns void language plpgsql as $$
begin perform set_config('role', 'postgres', true); perform set_config('request.jwt.claims', '', true); end $$;
create or replace function test.ip(ip text) returns void language plpgsql as $$
begin perform set_config('request.headers', json_build_object('x-forwarded-for', ip || ', 10.0.0.1')::text, true); end $$;
-- Testfreundinnen und Code für die Tests
create or replace function test.vorbereiten() returns void language plpgsql as $$
begin
  truncate test.ergebnis;
  insert into auth.users(id, email) values
    ('00000000-0000-0000-0000-00000000000a', 'anna@test'),
    ('00000000-0000-0000-0000-00000000000b', 'lea@test'),
    ('00000000-0000-0000-0000-00000000000f', 'fremd@test');
  insert into public.kreis(id, code_hash) values (1, extensions.crypt('gizzyundleo', extensions.gen_salt('bf')))
    on conflict (id) do update set code_hash = excluded.code_hash;
  insert into public.kreis_mitglied(user_id) values ('00000000-0000-0000-0000-00000000000a'), ('00000000-0000-0000-0000-00000000000b');
end $$;
create or replace function test.fertig() returns void language plpgsql as $$
declare f int; n int;
begin
  perform test.admin();
  select count(*) filter (where not ok), count(*) into f, n from test.ergebnis;
  if f > 0 then raise exception '% von % Prüfungen fehlgeschlagen', f, n; end if;
  raise notice 'Alle % Prüfungen bestanden', n;
end $$;
grant execute on all functions in schema test to anon, authenticated;
