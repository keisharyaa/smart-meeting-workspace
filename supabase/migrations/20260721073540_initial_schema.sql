-- ============================================================
-- Smart Meeting Workspace
-- Initial Database Schema
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

create type public.project_status as enum (
  'active',
  'done',
  'archived'
);

create type public.meeting_status as enum (
  'draft',
  'processing',
  'completed'
);

create type public.meeting_source_type as enum (
  'file',
  'pasted_text'
);

create type public.extraction_status as enum (
  'pending',
  'processing',
  'success',
  'failed'
);

create type public.action_item_status as enum (
  'todo',
  'in_progress',
  'blocked',
  'done'
);

create type public.action_item_priority as enum (
  'low',
  'medium',
  'high'
);

create type public.outcome_type as enum (
  'decision',
  'blocker',
  'unresolved_question'
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- PROFILES
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  current_position text,
  timezone text not null default 'Asia/Jakarta',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- ============================================================
-- PROJECTS
-- ============================================================

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  status public.project_status not null default 'active',
  completed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint projects_name_not_blank
    check (length(trim(name)) > 0)
);

create index projects_owner_id_idx
  on public.projects(owner_id);

create index projects_owner_status_idx
  on public.projects(owner_id, status);

create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

-- ============================================================
-- PEOPLE DIRECTORY
-- P1, but included in initial schema to stabilize references.
-- ============================================================

create table public.people (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  team text,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint people_name_not_blank
    check (length(trim(name)) > 0)
);

create index people_owner_id_idx
  on public.people(owner_id);

create trigger people_set_updated_at
before update on public.people
for each row
execute function public.set_updated_at();

-- ============================================================
-- MEETINGS
-- ============================================================

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete restrict,

  title text not null,
  meeting_date date not null,
  meeting_time time,
  participants text[] not null default '{}',

  status public.meeting_status not null default 'draft',
  is_published boolean not null default false,
  published_at timestamptz,

  approved_summary text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint meetings_title_not_blank
    check (length(trim(title)) > 0),

  constraint meetings_publish_consistency
    check (
      (is_published = false and published_at is null)
      or
      (is_published = true and published_at is not null)
    )
);

create index meetings_owner_id_idx
  on public.meetings(owner_id);

create index meetings_project_id_idx
  on public.meetings(project_id);

create index meetings_owner_status_idx
  on public.meetings(owner_id, status);

create index meetings_owner_published_idx
  on public.meetings(owner_id, is_published);

create trigger meetings_set_updated_at
before update on public.meetings
for each row
execute function public.set_updated_at();

-- ============================================================
-- MEETING SOURCES
--
-- One meeting may contain:
-- - multiple uploaded files
-- - pasted text
-- - uploaded files and pasted text together
-- ============================================================

create table public.meeting_sources (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  meeting_id uuid not null references public.meetings(id) on delete cascade,

  source_type public.meeting_source_type not null,

  original_file_name text,
  mime_type text,
  file_size_bytes bigint,
  storage_path text,

  raw_text text not null,
  source_order integer not null,

  created_at timestamptz not null default now(),

  constraint meeting_sources_order_nonnegative
    check (source_order >= 0),

  constraint meeting_sources_file_size_nonnegative
    check (
      file_size_bytes is null
      or file_size_bytes >= 0
    ),

  constraint meeting_sources_raw_text_not_blank
    check (length(trim(raw_text)) > 0),

  constraint meeting_sources_type_fields
    check (
      (
        source_type = 'file'
        and original_file_name is not null
        and mime_type is not null
        and storage_path is not null
      )
      or
      (
        source_type = 'pasted_text'
        and original_file_name is null
        and storage_path is null
      )
    ),

  constraint meeting_sources_unique_order
    unique (meeting_id, source_order)
);

create index meeting_sources_owner_id_idx
  on public.meeting_sources(owner_id);

create index meeting_sources_meeting_id_idx
  on public.meeting_sources(meeting_id);

-- ============================================================
-- EXTRACTION RUNS
-- ============================================================

create table public.extraction_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  meeting_id uuid not null references public.meetings(id) on delete cascade,

  provider text not null default 'google',
  model text not null,

  status public.extraction_status not null default 'pending',

  input_character_count integer,
  duration_ms integer,

  raw_response jsonb,
  normalized_output jsonb,

  error_code text,
  error_message text,

  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),

  constraint extraction_input_count_nonnegative
    check (
      input_character_count is null
      or input_character_count >= 0
    ),

  constraint extraction_duration_nonnegative
    check (
      duration_ms is null
      or duration_ms >= 0
    )
);

create index extraction_runs_owner_id_idx
  on public.extraction_runs(owner_id);

create index extraction_runs_meeting_id_idx
  on public.extraction_runs(meeting_id);

create index extraction_runs_meeting_created_idx
  on public.extraction_runs(meeting_id, created_at desc);

-- ============================================================
-- MEETING OUTCOMES
-- Decisions, blockers, and unresolved questions
-- ============================================================

create table public.meeting_outcomes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  meeting_id uuid not null references public.meetings(id) on delete cascade,

  outcome_type public.outcome_type not null,
  content text not null,
  source_reference text,
  display_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint meeting_outcomes_content_not_blank
    check (length(trim(content)) > 0),

  constraint meeting_outcomes_order_nonnegative
    check (display_order >= 0)
);

create index meeting_outcomes_owner_id_idx
  on public.meeting_outcomes(owner_id);

create index meeting_outcomes_meeting_id_idx
  on public.meeting_outcomes(meeting_id);

create trigger meeting_outcomes_set_updated_at
before update on public.meeting_outcomes
for each row
execute function public.set_updated_at();

-- ============================================================
-- ACTION ITEMS
-- ============================================================

create table public.action_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete restrict,
  meeting_id uuid references public.meetings(id) on delete set null,
  person_id uuid references public.people(id) on delete set null,

  title text not null,
  description text,

  pic_name text,
  due_date date,
  due_time time,

  priority public.action_item_priority,
  status public.action_item_status not null default 'todo',

  source_reference text,

  is_official boolean not null default false,
  published_at timestamptz,

  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint action_items_title_not_blank
    check (length(trim(title)) > 0),

  constraint action_items_publish_consistency
    check (
      (is_official = false and published_at is null)
      or
      (is_official = true and published_at is not null)
    )
);

create index action_items_owner_id_idx
  on public.action_items(owner_id);

create index action_items_project_id_idx
  on public.action_items(project_id);

create index action_items_meeting_id_idx
  on public.action_items(meeting_id);

create index action_items_owner_status_idx
  on public.action_items(owner_id, status);

create index action_items_owner_due_date_idx
  on public.action_items(owner_id, due_date);

create index action_items_official_status_idx
  on public.action_items(owner_id, is_official, status);

create trigger action_items_set_updated_at
before update on public.action_items
for each row
execute function public.set_updated_at();

-- ============================================================
-- NOTIFICATIONS
-- Basic in-app reminders
-- ============================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  action_item_id uuid not null references public.action_items(id) on delete cascade,

  notification_type text not null,
  title text not null,
  message text,

  is_read boolean not null default false,
  read_at timestamptz,

  created_at timestamptz not null default now(),

  constraint notifications_title_not_blank
    check (length(trim(title)) > 0),

  constraint notifications_read_consistency
    check (
      (is_read = false and read_at is null)
      or
      (is_read = true and read_at is not null)
    )
);

create index notifications_owner_id_idx
  on public.notifications(owner_id);

create index notifications_owner_read_idx
  on public.notifications(owner_id, is_read);

create index notifications_action_item_id_idx
  on public.notifications(action_item_id);

-- ============================================================
-- AUTH PROFILE CREATION
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    full_name
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.people enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_sources enable row level security;
alter table public.extraction_runs enable row level security;
alter table public.meeting_outcomes enable row level security;
alter table public.action_items enable row level security;
alter table public.notifications enable row level security;

-- Profiles

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Projects

create policy "Users can view their own projects"
on public.projects
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Users can create their own projects"
on public.projects
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Users can update their own projects"
on public.projects
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own projects"
on public.projects
for delete
to authenticated
using ((select auth.uid()) = owner_id);

-- People

create policy "Users can view their own people"
on public.people
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Users can create their own people"
on public.people
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Users can update their own people"
on public.people
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own people"
on public.people
for delete
to authenticated
using ((select auth.uid()) = owner_id);

-- Meetings

create policy "Users can view their own meetings"
on public.meetings
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Users can create their own meetings"
on public.meetings
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Users can update their own meetings"
on public.meetings
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own meetings"
on public.meetings
for delete
to authenticated
using ((select auth.uid()) = owner_id);

-- Meeting sources

create policy "Users can view their own meeting sources"
on public.meeting_sources
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Users can create their own meeting sources"
on public.meeting_sources
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Users can update their own meeting sources"
on public.meeting_sources
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own meeting sources"
on public.meeting_sources
for delete
to authenticated
using ((select auth.uid()) = owner_id);

-- Extraction runs

create policy "Users can view their own extraction runs"
on public.extraction_runs
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Users can create their own extraction runs"
on public.extraction_runs
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Users can update their own extraction runs"
on public.extraction_runs
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own extraction runs"
on public.extraction_runs
for delete
to authenticated
using ((select auth.uid()) = owner_id);

-- Meeting outcomes

create policy "Users can view their own meeting outcomes"
on public.meeting_outcomes
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Users can create their own meeting outcomes"
on public.meeting_outcomes
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Users can update their own meeting outcomes"
on public.meeting_outcomes
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own meeting outcomes"
on public.meeting_outcomes
for delete
to authenticated
using ((select auth.uid()) = owner_id);

-- Action items

create policy "Users can view their own action items"
on public.action_items
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Users can create their own action items"
on public.action_items
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Users can update their own action items"
on public.action_items
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own action items"
on public.action_items
for delete
to authenticated
using ((select auth.uid()) = owner_id);

-- Notifications

create policy "Users can view their own notifications"
on public.notifications
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Users can create their own notifications"
on public.notifications
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Users can update their own notifications"
on public.notifications
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "Users can delete their own notifications"
on public.notifications
for delete
to authenticated
using ((select auth.uid()) = owner_id);