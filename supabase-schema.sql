-- ============================================================
-- SKON STUDIO CRM — Supabase schema + seed
-- Run order: paste this whole file into Supabase → SQL Editor → Run
-- Idempotent: safe to re-run during development.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- 1. LEADS TABLE
-- ============================================================
create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  lead_id         integer,
  lead_type       text not null check (lead_type in ('B2B','B2C')),
  date_received   date,
  prospect_name   text not null,
  company_name    text,
  job_title       text,
  email           text,
  phone           text,
  source          text,
  project_type    text,
  budget_range    text,
  status          text,
  notes           text,
  stage           text not null default 'New'
                  check (stage in ('New','Contacted','In Discussion','Proposal Sent','Won','Lost')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references auth.users(id) on delete set null,
  updated_by      uuid references auth.users(id) on delete set null
);

create index if not exists leads_stage_idx          on public.leads(stage);
create index if not exists leads_lead_type_idx      on public.leads(lead_type);
create index if not exists leads_date_received_idx  on public.leads(date_received desc);

-- ============================================================
-- 2. TRIGGERS — keep updated_at and audit fields fresh
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;

drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

create or replace function public.set_created_by()
returns trigger language plpgsql as $$
begin
  if new.created_by is null then new.created_by := auth.uid(); end if;
  if new.updated_by is null then new.updated_by := auth.uid(); end if;
  return new;
end $$;

drop trigger if exists leads_created_by on public.leads;
create trigger leads_created_by
  before insert on public.leads
  for each row execute function public.set_created_by();

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- Only authenticated users (you + your partner) can read/write.
-- Anonymous users get nothing.
-- ============================================================
alter table public.leads enable row level security;

drop policy if exists "auth read"   on public.leads;
drop policy if exists "auth insert" on public.leads;
drop policy if exists "auth update" on public.leads;
drop policy if exists "auth delete" on public.leads;

create policy "auth read"   on public.leads for select using (auth.role() = 'authenticated');
create policy "auth insert" on public.leads for insert with check (auth.role() = 'authenticated');
create policy "auth update" on public.leads for update using (auth.role() = 'authenticated');
create policy "auth delete" on public.leads for delete using (auth.role() = 'authenticated');

-- ============================================================
-- 4. REALTIME
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'leads'
  ) then
    execute 'alter publication supabase_realtime add table public.leads';
  end if;
end $$;

-- ============================================================
-- 5. SEED — your existing 12 B2B leads from Lead Tracker.xlsx
-- Stage was inferred from the Status column:
--   • Status mentions "Not interested" or "Maternity Leave" → Lost
--   • Has touchpoints (email/call/linkedin) → Contacted
--   • Empty status → New
-- ============================================================
insert into public.leads
  (lead_id, lead_type, date_received, prospect_name, company_name, job_title, email, phone, source, status, notes, stage)
values
  (1,  'B2B', '2026-03-24', 'Lauren Klein',          'JOIVY',                              'Group Director of Strategic Partnerships', 'lauren.klein@joivy.com',                                          '0034 934 63 71 95',                  'Lusha',     E'Email Sent\nCall Not Answered',                                       null,                                                  'Contacted'),
  (2,  'B2B', '2026-03-24', 'Charo Van Hulst',       'THIRDHOME',                          'Partnership Manager',                       'charo@thirdhome.com',                                             '0034 673 675 638',                   'Lusha',     E'Email Sent (Not interested)\nPhone Number Found Through Her Email',  null,                                                  'Lost'),
  (3,  'B2B', '2026-03-24', 'Giles Adams',           'THIRDHOME',                          'Partner and President',                     E'giles@thirdhome.com\ngiles@3rdhome.com',                         '0044 7899 914916',                   'Lusha',     E'Email Sent\nCall Not Answered',                                       null,                                                  'Contacted'),
  (4,  'B2B', '2026-03-24', 'Wade Shealy',           'THIRDHOME',                          'Founder, CEO and Chairman',                 E'wade@thirdhome.com\nwade@3rdhome.com',                           '001 615-887-1962',                   'Lusha',     E'Email Sent\nLinkedIn Message Sent\nCall Not Answered',                null,                                                  'Contacted'),
  (5,  'B2B', '2026-03-26', 'Dan Barham',            'DOVER STREET MARKET (INTERNATIONAL)', 'Senior Operations Manager',                'danbarham@doverstreetmarket.com',                                 '0044 7811 498028',                   'Lusha',     E'Email Sent\nCall Not Answered\nLinkedIn Message Sent',                null,                                                  'Contacted'),
  (6,  'B2B', '2026-03-26', 'Melissa Ait-Ouakli',    'JACQUEMUS',                          'Commercial Director',                       'melissa.ait-ouakli@jacquemus.com',                                '0033 6 31 97 96 35',                 'Lusha',     E'Call Not Answered\nEmail Sent\nLinkedIn Message Sent',                null,                                                  'Contacted'),
  (7,  'B2B', '2026-02-04', 'Hinnerk Hansen',        'IMPACT HUB',                         'Co-Founder & Managing Director',            E'hinnerk.hansen@impacthub.net\nhinnerk.hansen@socialimpactaward.net', E'0043 650 3517327\n0049 172 1721327', 'Lusha',     E'Phones unavailable\nEmail Sent\nLinkedIn Message Sent',               'Out of Office until the 6th of April',                'Contacted'),
  (8,  'B2B', '2026-02-04', 'Anna Bodenseher',       'IMPACT HUB',                         'Partnership Lead',                          'anna.bodenseher@impacthub.net',                                   '–',                                  'Lusha',     E'Email Sent\nLinkedIn Message Sent',                                   'Extended Maternity Leave. Referred Leon Moser',       'Lost'),
  (9,  'B2B', '2026-02-04', 'Leon Moser',            'IMPACT HUB',                         'Partnership Manager',                       'leon.moser@impacthub.net',                                        '–',                                  'From Anna', E'Email Sent\nLinkedIn Message Sent',                                   null,                                                  'Contacted'),
  (10, 'B2B', '2026-04-19', 'Alfredo Villalonga',    'IMPACT HUB',                         'Co-Managing Director',                      E'avillalonga@southhope.org\nalfredo.villalonga@impacthub.net',    E'0052 81 8088 8726\n0052 81 8374 9080', 'Lusha',  null,                                                                   null,                                                  'New'),
  (11, 'B2B', '2026-04-19', 'Petr Skvaril',          'IMPACT HUB',                         'Global Partnerships Director',              'petr.skvaril@impacthub.net',                                      'linkedin.com/in/petrskvaril',        'LinkedIn',  null,                                                                   null,                                                  'New'),
  (12, 'B2B', '2026-04-19', 'Alberto Masetti-Zannini','IMPACT HUB',                        'Global Development Director',               '–',                                                               'linkedin.com/in/amasettizannini',    'LinkedIn',  null,                                                                   null,                                                  'New')
on conflict do nothing;
