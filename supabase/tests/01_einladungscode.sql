-- Einladungscode und Freundeskreis
begin;
select test.vorbereiten();

select test.anon();
select test.ip('203.0.113.1');
select test.ok(public.kreis_code_pruefen('GizzyundLeo'), 'Richtiger Code wird erkannt');
select test.ok(public.kreis_code_pruefen('  gizzyUNDleo '), 'Groß-/Kleinschreibung und Leerzeichen am Rand sind egal');
select test.ok(not public.kreis_code_pruefen('Gizzy'), 'Falscher Code wird abgelehnt');
select test.ok(not public.kreis_code_pruefen(''), 'Leerer Code wird abgelehnt');
select test.ok(not public.kreis_code_pruefen(null), 'Kein Code wird abgelehnt');
select test.fehler('select * from public.kreis', 'permission denied', 'Ohne Anmeldung ist der Code-Hash nicht lesbar');
select test.fehler('select * from public.code_versuch', 'permission denied', 'Ohne Anmeldung sind die Code-Versuche nicht lesbar');
select test.fehler($$select public.kreis_beitreten('GizzyundLeo')$$, 'permission denied', 'Ohne Anmeldung kann niemand beitreten');
select test.fehler($$select public.kreis_code_ok('GizzyundLeo')$$, 'permission denied', 'Interne Prüffunktion ist nicht direkt aufrufbar');

-- Bremse gegen Durchprobieren: 10 falsche Versuche pro IP in 15 Minuten
select test.ip('198.51.100.7');
select public.kreis_code_pruefen('falsch' || i) from generate_series(1, 10) i;
select test.fehler($$select public.kreis_code_pruefen('GizzyundLeo')$$, 'zu_viele_versuche', 'Nach 10 falschen Versuchen ist auch der richtige Code gesperrt');
select test.ip('198.51.100.8');
select test.ok(public.kreis_code_pruefen('GizzyundLeo'), 'Eine andere IP ist davon nicht betroffen');
select test.admin();
update public.code_versuch set at = now() - interval '16 minutes' where ip = '198.51.100.7';
select test.anon(); select test.ip('198.51.100.7');
select test.ok(public.kreis_code_pruefen('GizzyundLeo'), 'Nach 15 Minuten geht es wieder');

-- Beitreten nach der Google-Anmeldung
select test.als('00000000-0000-0000-0000-00000000000f');
select test.ip('203.0.113.9');
select test.ok(not public.kreis_beitreten('falsch'), 'Falscher Code: kein Beitritt');
select test.ok(not public.ist_mitglied(), 'Fremde ist danach kein Mitglied');
select test.fehler($$insert into public.kreis_mitglied(user_id) values ('00000000-0000-0000-0000-00000000000f')$$, 'permission denied', 'Selbst eintragen ohne Code geht nicht');
select test.ok(public.kreis_beitreten('GizzyundLeo'), 'Richtiger Code: Beitritt klappt');
select test.ok(public.ist_mitglied(), 'Danach ist sie Mitglied');
select test.ok(test.zeilen('select * from public.kreis_mitglied') = 1, 'Man sieht nur die eigene Mitgliedschaft');
select test.admin();
update public.kreis set code_hash = extensions.crypt('neuercode', extensions.gen_salt('bf'));
select test.als('00000000-0000-0000-0000-00000000000a');
select test.ok(public.kreis_beitreten('GizzyundLeo'), 'Nach Code-Wechsel bleiben Mitglieder drin (alter Code egal)');
select test.fertig();
rollback;
