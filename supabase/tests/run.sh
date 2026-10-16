#!/usr/bin/env bash
# Datenbank-Tests ausführen. Verbindung über DB_URL (Standard: lokales Supabase von "supabase start").
# Fehlgeschlagene Prüfungen erscheinen in GitHub als rote Hinweise (::error::).
DB_URL=${DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}
cd "$(dirname "$0")"
psql "$DB_URL" -q -v ON_ERROR_STOP=1 -f _hilfe.sql >/dev/null || exit 1
fail=0
for f in [0-9]*.sql; do
  echo "== $f"
  out=$(psql "$DB_URL" -q -o /dev/null -v ON_ERROR_STOP=1 -f "$f" 2>&1); rc=$?
  echo "$out" | sed -n 's/^.*NOTICE:  //p'
  if [ $rc -ne 0 ]; then
    fail=1
    echo "$out" | grep -v NOTICE | sed 's/^/   /'
    echo "$out" | sed -n 's/^.*NOTICE:  FEHLER – /::error title=Datenbank-Test '"$f"'::/p'
    echo "$out" | grep -E "ERROR" | grep -v "Prüfungen fehlgeschlagen" | sed 's/^.*ERROR: */::error title=Abbruch in '"$f"'::/'
  fi
done
exit $fail
