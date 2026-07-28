-- M05: isolated Human Review draft persistence.

create table public.meeting_review_drafts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  processing_method text not null,
  source_extraction_run_id uuid references public.extraction_runs(id) on delete set null,
  summary text not null default '',
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint meeting_review_drafts_meeting_unique unique (meeting_id),
  constraint meeting_review_drafts_method_valid
    check (processing_method in ('ai', 'manual')),
  constraint meeting_review_drafts_version_positive check (version > 0)
);

create table public.meeting_review_outcomes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  review_draft_id uuid not null references public.meeting_review_drafts(id) on delete cascade,
  outcome_type public.outcome_type not null,
  content text not null default '',
  source_reference text,
  display_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint meeting_review_outcomes_order_nonnegative check (display_order >= 0),
  constraint meeting_review_outcomes_order_unique
    unique (review_draft_id, outcome_type, display_order)
);

create table public.meeting_review_action_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  review_draft_id uuid not null references public.meeting_review_drafts(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete restrict,
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  title text not null default '',
  description text,
  pic_name text,
  pic_email text,
  due_date date,
  due_time time,
  priority public.action_item_priority,
  clarification_status text not null,
  source_reference text,
  display_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint meeting_review_actions_clarification_valid
    check (clarification_status in ('clear', 'needs_clarification')),
  constraint meeting_review_actions_order_nonnegative check (display_order >= 0),
  constraint meeting_review_actions_order_unique unique (review_draft_id, display_order),
  constraint meeting_review_actions_time_requires_date
    check (due_date is not null or due_time is null)
);

create index meeting_review_drafts_owner_idx
  on public.meeting_review_drafts(owner_id);
create index meeting_review_outcomes_parent_idx
  on public.meeting_review_outcomes(review_draft_id, outcome_type, display_order);
create index meeting_review_actions_parent_idx
  on public.meeting_review_action_items(review_draft_id, display_order);

create trigger meeting_review_drafts_set_updated_at
before update on public.meeting_review_drafts
for each row execute function public.set_updated_at();

create trigger meeting_review_outcomes_set_updated_at
before update on public.meeting_review_outcomes
for each row execute function public.set_updated_at();

create trigger meeting_review_actions_set_updated_at
before update on public.meeting_review_action_items
for each row execute function public.set_updated_at();

alter table public.meeting_review_drafts enable row level security;
alter table public.meeting_review_outcomes enable row level security;
alter table public.meeting_review_action_items enable row level security;

create policy "Users can manage their own meeting review drafts"
on public.meeting_review_drafts for all to authenticated
using (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.meetings
    where meetings.id = meeting_id
      and meetings.owner_id = (select auth.uid())
      and meetings.is_published = false
  )
)
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.meetings
    where meetings.id = meeting_id
      and meetings.owner_id = (select auth.uid())
      and meetings.is_published = false
  )
);

create policy "Users can manage their own meeting review outcomes"
on public.meeting_review_outcomes for all to authenticated
using (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.meeting_review_drafts
    where meeting_review_drafts.id = review_draft_id
      and meeting_review_drafts.owner_id = (select auth.uid())
  )
)
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.meeting_review_drafts
    where meeting_review_drafts.id = review_draft_id
      and meeting_review_drafts.owner_id = (select auth.uid())
  )
);

create policy "Users can manage their own meeting review actions"
on public.meeting_review_action_items for all to authenticated
using (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.meeting_review_drafts
    where meeting_review_drafts.id = review_draft_id
      and meeting_review_drafts.owner_id = (select auth.uid())
  )
)
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.meeting_review_drafts
    where meeting_review_drafts.id = review_draft_id
      and meeting_review_drafts.owner_id = (select auth.uid())
  )
);

create or replace function public.save_meeting_review_draft(
  draft_id uuid,
  expected_version integer,
  draft_summary text,
  draft_method text,
  draft_outcomes jsonb,
  draft_actions jsonb,
  extraction_run_id uuid default null
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_draft public.meeting_review_drafts%rowtype;
  outcome jsonb;
  action jsonb;
  next_version integer;
begin
  select * into current_draft
  from public.meeting_review_drafts
  where id = draft_id
    and owner_id = auth.uid()
  for update;

  if not found then
    raise exception 'review_draft_not_found';
  end if;

  if current_draft.version <> expected_version then
    raise exception 'review_draft_version_conflict';
  end if;

  if draft_method not in ('ai', 'manual') then
    raise exception 'review_draft_invalid_method';
  end if;

  if extraction_run_id is not null and not exists (
    select 1 from public.extraction_runs
    where id = extraction_run_id
      and owner_id = current_draft.owner_id
      and meeting_id = current_draft.meeting_id
      and status = 'success'
  ) then
    raise exception 'review_extraction_run_invalid';
  end if;

  if jsonb_typeof(draft_outcomes) <> 'array'
    or jsonb_typeof(draft_actions) <> 'array' then
    raise exception 'review_draft_invalid_payload';
  end if;

  next_version := current_draft.version + 1;

  update public.meeting_review_drafts
  set summary = draft_summary,
      processing_method = draft_method,
      source_extraction_run_id = extraction_run_id,
      version = next_version
  where id = draft_id;

  delete from public.meeting_review_outcomes
  where review_draft_id = draft_id;

  for outcome in select value from jsonb_array_elements(draft_outcomes)
  loop
    insert into public.meeting_review_outcomes (
      owner_id, review_draft_id, outcome_type, content,
      source_reference, display_order
    ) values (
      current_draft.owner_id,
      draft_id,
      (outcome ->> 'outcomeType')::public.outcome_type,
      coalesce(outcome ->> 'content', ''),
      nullif(outcome ->> 'sourceReference', ''),
      (outcome ->> 'displayOrder')::integer
    );
  end loop;

  delete from public.meeting_review_action_items
  where review_draft_id = draft_id;

  for action in select value from jsonb_array_elements(draft_actions)
  loop
    if (action ->> 'meetingId')::uuid <> current_draft.meeting_id then
      raise exception 'review_draft_invalid_meeting';
    end if;

    if (action ->> 'projectId')::uuid <> (
      select project_id from public.meetings where id = current_draft.meeting_id
    ) then
      raise exception 'review_draft_invalid_project';
    end if;

    insert into public.meeting_review_action_items (
      owner_id, review_draft_id, project_id, meeting_id, title,
      description, pic_name, pic_email, due_date, due_time, priority,
      clarification_status, source_reference, display_order
    ) values (
      current_draft.owner_id,
      draft_id,
      (action ->> 'projectId')::uuid,
      current_draft.meeting_id,
      coalesce(action ->> 'title', ''),
      nullif(action ->> 'description', ''),
      nullif(action ->> 'picName', ''),
      nullif(action ->> 'picEmail', ''),
      nullif(action ->> 'dueDate', '')::date,
      nullif(action ->> 'dueTime', '')::time,
      nullif(action ->> 'priority', '')::public.action_item_priority,
      action ->> 'clarificationStatus',
      nullif(action ->> 'sourceReference', ''),
      (action ->> 'displayOrder')::integer
    );
  end loop;

  return next_version;
end;
$$;

grant execute on function public.save_meeting_review_draft(
  uuid, integer, text, text, jsonb, jsonb, uuid
) to authenticated;

create or replace function public.initialize_meeting_review_draft(
  target_meeting_id uuid,
  draft_summary text,
  draft_method text,
  draft_outcomes jsonb,
  draft_actions jsonb,
  extraction_run_id uuid default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_draft_id uuid;
begin
  if not exists (
    select 1 from public.meetings
    where id = target_meeting_id
      and owner_id = auth.uid()
      and is_published = false
  ) then
    raise exception 'review_meeting_not_found';
  end if;

  if extraction_run_id is not null and not exists (
    select 1 from public.extraction_runs
    where id = extraction_run_id
      and owner_id = auth.uid()
      and meeting_id = target_meeting_id
      and status = 'success'
  ) then
    raise exception 'review_extraction_run_invalid';
  end if;

  insert into public.meeting_review_drafts (
    owner_id, meeting_id, processing_method,
    source_extraction_run_id, summary
  ) values (
    auth.uid(), target_meeting_id, draft_method,
    extraction_run_id, draft_summary
  )
  returning id into new_draft_id;

  perform public.save_meeting_review_draft(
    new_draft_id,
    1,
    draft_summary,
    draft_method,
    draft_outcomes,
    draft_actions,
    extraction_run_id
  );

  return new_draft_id;
end;
$$;

grant execute on function public.initialize_meeting_review_draft(
  uuid, text, text, jsonb, jsonb, uuid
) to authenticated;
