-- Klicker – Datenbank-Setup für Supabase
-- Im Supabase-Dashboard: SQL Editor → New query → alles einfügen → Run.
-- Kann gefahrlos mehrmals ausgeführt werden.

create table if not exists public.clicks (
  id       bigint generated always as identity primary key,
  ts       timestamptz not null default now(),
  name     text not null check (char_length(name) between 1 and 30),
  accepted boolean not null            -- true = gezählt, false = abgelehnt (Sperre)
);
create index if not exists clicks_accepted_ts on public.clicks (accepted, ts desc);

-- Jeder darf lesen, aber niemand darf direkt schreiben.
-- Schreiben geht nur über die Funktion click() unten.
alter table public.clicks enable row level security;
drop policy if exists "alle duerfen lesen" on public.clicks;
create policy "alle duerfen lesen" on public.clicks
  for select to anon, authenticated using (true);

-- Ein Klick. Die Sperre (pg_advisory_xact_lock) sorgt dafür, dass gleichzeitige
-- Klicks nacheinander geprüft werden: Innerhalb von 5 Sekunden zählt nur einer.
create or replace function public.click(p_name text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := left(coalesce(nullif(btrim(regexp_replace(coalesce(p_name, ''), '[[:cntrl:]]', '', 'g')), ''), 'Anonym'), 30);
  v_last timestamptz;
  v_now  timestamptz;
  v_ok   boolean;
begin
  perform pg_advisory_xact_lock(4242424242);
  v_now := clock_timestamp();
  select max(ts) into v_last from clicks where accepted;
  v_ok := v_last is null or v_now - v_last >= interval '5 seconds';
  insert into clicks (ts, name, accepted) values (v_now, v_name, v_ok);
  return json_build_object(
    'ok', v_ok,
    'retryInMs', case when v_ok then 5000
                      else ceil(extract(epoch from (v_last + interval '5 seconds' - v_now)) * 1000) end
  );
end;
$$;

-- Gesamter Stand für die Webseite in einer Abfrage.
create or replace function public.get_state()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'serverNow',      (extract(epoch from clock_timestamp()) * 1000)::bigint,
    'cooldownMs',     5000,
    'lastAcceptedTs', (select (extract(epoch from max(ts)) * 1000)::bigint from clicks where accepted),
    'total',          (select count(*) from clicks where accepted),
    'thisHour',       (select count(*) from clicks where accepted and ts >= date_trunc('hour', now())),
    'records', coalesce((
      select json_agg(r order by r.count desc, r."hourStart" desc)
      from (
        select (extract(epoch from date_trunc('hour', ts)) * 1000)::bigint as "hourStart",
               count(*) as count
        from clicks where accepted
        group by 1 order by 2 desc, 1 desc limit 5
      ) r), '[]'::json),
    'logs', coalesce((
      select json_agg(l order by l.id desc)
      from (
        select id, (extract(epoch from ts) * 1000)::bigint as ts, name, accepted
        from clicks order by id desc limit 50
      ) l), '[]'::json)
  );
$$;

revoke all on function public.click(text), public.get_state() from public;
grant execute on function public.click(text), public.get_state() to anon, authenticated;

-- Live-Updates: neue Klicks an alle offenen Seiten senden.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'clicks'
  ) then
    alter publication supabase_realtime add table public.clicks;
  end if;
end $$;
