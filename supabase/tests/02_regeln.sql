-- Wer darf was sehen und ändern (Row Level Security)
begin;
select test.vorbereiten();
select test.admin();
insert into public.user_state(user_id, data) values ('00000000-0000-0000-0000-00000000000a', '{"projects":[]}'), ('00000000-0000-0000-0000-00000000000f', '{"projects":[]}');
insert into public.kal(user_id, name, proj, pct) values ('00000000-0000-0000-0000-00000000000a', 'Anna', 'Schal', 40);
insert into public.tausch(id, user_id, name, garn) values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'Anna', 'Cotton 8 – Mint');

-- Ohne Anmeldung: nichts
select test.anon();
select test.ok(test.zeilen('select * from public.user_state') = 0, 'Ohne Anmeldung: kein gespeicherter Stand sichtbar');
select test.ok(test.zeilen('select * from public.kal') = 0, 'Ohne Anmeldung: kein Knit-Along sichtbar');
select test.ok(test.zeilen('select * from public.tausch') = 0, 'Ohne Anmeldung: keine Tauschbörse sichtbar');

-- Angemeldet, aber ohne Code (nicht im Kreis): nichts, auch nicht der eigene alte Stand
select test.als('00000000-0000-0000-0000-00000000000f');
select test.ok(test.zeilen('select * from public.kal') = 0, 'Fremde ohne Code: kein Knit-Along sichtbar');
select test.ok(test.zeilen('select * from public.tausch') = 0, 'Fremde ohne Code: keine Tauschbörse sichtbar');
select test.ok(test.zeilen('select * from public.user_state') = 0, 'Fremde ohne Code: auch eigener Stand gesperrt');
select test.fehler($$insert into public.kal(user_id, name) values ('00000000-0000-0000-0000-00000000000f', 'X')$$, 'row-level security', 'Fremde ohne Code: kein Knit-Along-Balken');
select test.fehler($$insert into public.tausch(user_id, name, garn) values ('00000000-0000-0000-0000-00000000000f', 'X', 'Garn')$$, 'row-level security', 'Fremde ohne Code: kein Tauschangebot');
select test.fehler($$insert into public.tausch_wunsch(tausch_id, user_id, name) values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000f', 'X')$$, 'row-level security', 'Fremde ohne Code: kein Wunsch');

-- Lea (im Kreis)
select test.als('00000000-0000-0000-0000-00000000000b');
select test.ok(test.zeilen('select * from public.kal') = 1, 'Lea sieht Annas Knit-Along-Balken');
select test.ok(test.zeilen('select * from public.tausch') = 1, 'Lea sieht Annas Tauschangebot');
select test.ok(test.zeilen('select * from public.user_state') = 0, 'Lea sieht Annas gespeicherten Stand nicht');
select test.klappt($$insert into public.user_state(user_id, data) values ('00000000-0000-0000-0000-00000000000b', '{"projects":[]}')$$, 'Lea kann ihren eigenen Stand speichern');
select test.fehler($$insert into public.user_state(user_id, data) values ('00000000-0000-0000-0000-00000000000a', '{}')$$, 'row-level security|duplicate', 'Lea kann nicht in Annas Stand schreiben');
select test.ok(test.betroffen($$update public.kal set pct = 99 where user_id = '00000000-0000-0000-0000-00000000000a'$$) = 0, 'Lea kann Annas Balken nicht ändern');
select test.ok(test.betroffen($$delete from public.tausch where id = '10000000-0000-0000-0000-000000000001'$$) = 0, 'Lea kann Annas Angebot nicht löschen');
select test.fehler($$insert into public.kal(user_id, name) values ('00000000-0000-0000-0000-00000000000a', 'Fake')$$, 'row-level security|duplicate', 'Lea kann keinen Balken für Anna anlegen');
select test.klappt($$insert into public.tausch_wunsch(tausch_id, name) values ('10000000-0000-0000-0000-000000000001', 'Lea')$$, 'Lea kann „Hätte ich gern“ drücken');
select test.fehler($$insert into public.tausch_wunsch(tausch_id, user_id, name) values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'Anna')$$, 'row-level security', 'Lea kann keinen Wunsch im Namen von Anna anlegen');
select test.fehler($$insert into public.tausch(user_id, name, garn, col) values ('00000000-0000-0000-0000-00000000000b', 'Lea', 'Garn', 'rot')$$, 'check', 'Ungültige Farbe wird abgelehnt');
select test.fehler($$insert into public.tausch(user_id, name, garn) values ('00000000-0000-0000-0000-00000000000b', 'Lea', repeat('x', 81))$$, 'check', 'Zu langer Garnname wird abgelehnt');

-- Anna (im Kreis, Besitzerin)
select test.als('00000000-0000-0000-0000-00000000000a');
select test.ok(test.zeilen('select * from public.tausch_wunsch') = 1, 'Anna sieht Leas Wunsch');
select test.ok(test.betroffen($$delete from public.tausch where id = '10000000-0000-0000-0000-000000000001'$$) = 1, 'Anna kann ihr eigenes Angebot löschen');
select test.ok(test.zeilen('select * from public.tausch_wunsch') = 0, 'Mit dem Angebot verschwinden die Wünsche');

-- Höchstens 30 Angebote
select test.klappt($$insert into public.tausch(name, garn) select 'Anna', 'Garn ' || i from generate_series(1, 30) i$$, '30 Angebote sind erlaubt');
select test.fehler($$insert into public.tausch(name, garn) values ('Anna', 'Nummer 31')$$, 'zu_viele_angebote', 'Das 31. Angebot wird abgelehnt');

-- Größe des gespeicherten Stands
select test.fehler($$update public.user_state set data = jsonb_build_object('projects', '[]'::jsonb, 'x', (select string_agg(md5(i::text), '') from generate_series(1, 40000) i)) where user_id = '00000000-0000-0000-0000-00000000000a'$$, 'user_state_size|zu_schnell', 'Zu großer Stand (über 512 KB) wird abgelehnt');
select test.fertig();
rollback;
