create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  page text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint analytics_events_event_name_check check (
    event_name in (
      'dashboard_viewed',
      'meeting_published',
      'action_status_updated',
      'reminder_opened',
      'project_mark_done_blocked'
    )
  )
);

create index if not exists analytics_events_user_id_created_at_idx
  on public.analytics_events (user_id, created_at desc);

create index if not exists analytics_events_event_name_created_at_idx
  on public.analytics_events (event_name, created_at desc);

alter table public.analytics_events enable row level security;

create policy "Users can view their own analytics events"
  on public.analytics_events
  for select
  using (user_id = auth.uid());

create policy "Users can create their own analytics events"
  on public.analytics_events
  for insert
  with check (user_id = auth.uid());
