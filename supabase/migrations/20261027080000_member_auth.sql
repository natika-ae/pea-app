-- Spec 003: member registration and login.
-- Passwords, sessions and the LEARNER role (app_metadata.role) live in
-- Supabase Auth. This table holds the profile fields and lockout state.

create type public.member_type as enum ('EMPLOYEE', 'PUBLIC');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  member_type public.member_type not null,
  full_name text not null
    check (full_name = btrim(full_name) and char_length(full_name) between 2 and 100),
  -- Copy of auth.users.email, so duplicates can be checked and lockout
  -- state looked up by email (BR-02).
  email text not null unique
    check (email = lower(btrim(email))),
  -- Text, not a number, so leading zeros are kept.
  employee_id text unique
    check (employee_id ~ '^[0-9]{6}$'),
  affiliation text,
  consented_at timestamptz not null,
  failed_login_count integer not null default 0
    check (failed_login_count >= 0),
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  -- BR-04: only employees have an employee ID and affiliation.
  constraint profiles_employee_fields check (
    (member_type = 'EMPLOYEE' and employee_id is not null and affiliation is not null)
    or (member_type = 'PUBLIC' and employee_id is null and affiliation is null)
  )
);

comment on table public.profiles is
  'Member profile and login lockout state (spec 003). Server-only: accessed with the secret key.';

-- Only the server (secret key / service_role) reads or writes profiles.
-- RLS is on with no policies, so the Data API returns nothing to anon or
-- authenticated even if they are granted access later by mistake.
alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant select, insert, update, delete on table public.profiles to service_role;
