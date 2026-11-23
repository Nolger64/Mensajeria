create schema aura_private;
revoke all on schema aura_private from public, anon, authenticated;

create table aura_private.state (
  key text primary key check (key in ('operation', 'agenda')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object')
);

insert into aura_private.state (key, payload) values
  ('operation', '{}'),
  ('agenda', '{"services":[],"sessions":[],"windows":[],"appointments":[]}');

create table aura_private.api_config (
  singleton boolean primary key default true check (singleton),
  signing_key text not null default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''))
);
insert into aura_private.api_config default values;

create table aura_private.auth_removals (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);

alter table aura_private.state enable row level security;
alter table aura_private.api_config enable row level security;
alter table aura_private.auth_removals enable row level security;
revoke all on all tables in schema aura_private from public, anon, authenticated;
