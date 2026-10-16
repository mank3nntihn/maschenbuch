-- Täglicher Aufräumdienst
begin;
select test.vorbereiten();
select test.admin();
insert into auth.users(id, email, created_at) values
  ('00000000-0000-0000-0000-0000000000c1', 'alt-fremd@test', now() - interval '8 days'),
  ('00000000-0000-0000-0000-0000000000c2', 'neu-fremd@test', now() - interval '2 days'),
  ('00000000-0000-0000-0000-0000000000c3', 'alt-mitglied@test', now() - interval '30 days');
insert into public.kreis_mitglied(user_id) values ('00000000-0000-0000-0000-0000000000c3');
insert into public.kal(user_id, name) values ('00000000-0000-0000-0000-00000000000a', 'Anna'), ('00000000-0000-0000-0000-00000000000b', 'Lea');
-- Zeitstempel zurückdatieren (der Trigger würde sonst "jetzt" eintragen)
alter table public.kal disable trigger kal_touch;
alter table public.kal disable trigger kal_brake;
update public.kal set updated_at = now() - interval '61 days' where user_id = '00000000-0000-0000-0000-00000000000a';
update public.kal set updated_at = now() - interval '59 days' where user_id = '00000000-0000-0000-0000-00000000000b';
alter table public.kal enable trigger kal_touch;
alter table public.kal enable trigger kal_brake;
insert into public.tausch(id, user_id, name, garn, created_at) values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'Anna', 'alt', now() - interval '91 days'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000a', 'Anna', 'neu', now() - interval '10 days');
insert into public.tausch_wunsch(tausch_id, user_id, name) values ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000b', 'Lea');
insert into public.code_versuch(ip, at) values ('1.1.1.1', now() - interval '2 days'), ('1.1.1.2', now());

select test.anon();
select test.ok(public.aufraeumen()::jsonb = '{"knit_along":1,"tausch":1,"code_versuche":1,"fremde_konten":1}'::jsonb, 'Aufräumen ohne Anmeldung aufrufbar und meldet, was entfernt wurde');
select test.admin();
select test.ok(not exists(select 1 from public.kal where user_id = '00000000-0000-0000-0000-00000000000a'), 'Knit-Along-Balken älter als 60 Tage ist weg');
select test.ok(exists(select 1 from public.kal where user_id = '00000000-0000-0000-0000-00000000000b'), 'Knit-Along-Balken jünger als 60 Tage bleibt');
select test.ok(not exists(select 1 from public.tausch where garn = 'alt') and exists(select 1 from public.tausch where garn = 'neu'), 'Nur Angebote älter als 90 Tage sind weg');
select test.ok(not exists(select 1 from public.tausch_wunsch), 'Wünsche zu gelöschten Angeboten sind weg');
select test.ok(not exists(select 1 from public.code_versuch where ip = '1.1.1.1') and exists(select 1 from public.code_versuch where ip = '1.1.1.2'), 'Nur alte Code-Versuche sind weg');
select test.ok(not exists(select 1 from auth.users where id = '00000000-0000-0000-0000-0000000000c1'), 'Fremdes Konto ohne Code nach 7 Tagen gelöscht');
select test.ok(exists(select 1 from auth.users where id = '00000000-0000-0000-0000-0000000000c2'), 'Neues Konto ohne Code hat noch Zeit');
select test.ok(exists(select 1 from auth.users where id = '00000000-0000-0000-0000-0000000000c3'), 'Altes Konto im Kreis bleibt');
select test.als('00000000-0000-0000-0000-00000000000a');
select test.fehler('select public.aufraeumen()', 'permission denied', 'Angemeldete brauchen das Aufräumen nicht aufrufen');
select test.fertig();
rollback;
