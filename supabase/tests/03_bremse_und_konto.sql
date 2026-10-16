-- Schreib-Bremse, Ping und Konto löschen
begin;
select test.vorbereiten();

-- Schreib-Bremse (innerhalb einer Transaktion ist now() fest, das zweite Speichern kommt also "sofort")
select test.als('00000000-0000-0000-0000-00000000000a');
select test.klappt($$insert into public.user_state(user_id, data) values ('00000000-0000-0000-0000-00000000000a', '{"projects":[]}')$$, 'Erstes Speichern klappt');
select test.fehler($$update public.user_state set data = '{"projects":[1]}' where user_id = '00000000-0000-0000-0000-00000000000a'$$, 'zu_schnell', 'Sofort nochmal speichern wird gebremst');
select test.admin();
alter table public.user_state disable trigger user_state_brake; alter table public.user_state disable trigger user_state_touch;
update public.user_state set updated_at = now() - interval '1 second';
alter table public.user_state enable trigger user_state_brake; alter table public.user_state enable trigger user_state_touch;
select test.als('00000000-0000-0000-0000-00000000000a');
select test.klappt($$update public.user_state set data = '{"projects":[1]}' where user_id = '00000000-0000-0000-0000-00000000000a'$$, 'Nach einer Sekunde klappt es wieder');
select test.klappt($$insert into public.kal(name) values ('Anna')$$, 'Knit-Along-Balken anlegen klappt');
select test.fehler($$update public.kal set pct = 5$$, 'zu_schnell', 'Knit-Along-Balken wird ebenfalls gebremst');

-- Ping für den Keep-Alive
select test.anon();
select test.ok(public.ping() is not null, 'Ping funktioniert ohne Anmeldung');
select test.fehler('select public.delete_my_account()', 'permission denied', 'Konto löschen geht nicht ohne Anmeldung');

-- Konto löschen: alles von Anna weg, Lea bleibt unberührt
select test.admin();
insert into public.tausch(id, user_id, name, garn) values ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000a', 'Anna', 'Mint');
insert into public.tausch(id, user_id, name, garn) values ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-00000000000b', 'Lea', 'Rosa');
insert into public.tausch_wunsch(tausch_id, user_id, name) values ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000b', 'Lea'), ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-00000000000a', 'Anna');
insert into public.kal(user_id, name) values ('00000000-0000-0000-0000-00000000000b', 'Lea');
select test.als('00000000-0000-0000-0000-00000000000a');
select public.delete_my_account();
select test.admin();
select test.ok(not exists(select 1 from auth.users where id = '00000000-0000-0000-0000-00000000000a'), 'Annas Konto ist gelöscht');
select test.ok(not exists(select 1 from public.user_state where user_id = '00000000-0000-0000-0000-00000000000a'), 'Annas Stand ist gelöscht');
select test.ok(not exists(select 1 from public.kal where user_id = '00000000-0000-0000-0000-00000000000a'), 'Annas Knit-Along-Balken ist gelöscht');
select test.ok(not exists(select 1 from public.tausch where user_id = '00000000-0000-0000-0000-00000000000a'), 'Annas Angebote sind gelöscht');
select test.ok(not exists(select 1 from public.tausch_wunsch where user_id = '00000000-0000-0000-0000-00000000000a'), 'Annas Wünsche sind gelöscht');
select test.ok(not exists(select 1 from public.kreis_mitglied where user_id = '00000000-0000-0000-0000-00000000000a'), 'Annas Mitgliedschaft ist gelöscht');
select test.ok(exists(select 1 from public.kal where user_id = '00000000-0000-0000-0000-00000000000b')
  and exists(select 1 from public.tausch where user_id = '00000000-0000-0000-0000-00000000000b')
  and exists(select 1 from public.kreis_mitglied where user_id = '00000000-0000-0000-0000-00000000000b'), 'Leas Daten bleiben erhalten');
select test.fertig();
rollback;
