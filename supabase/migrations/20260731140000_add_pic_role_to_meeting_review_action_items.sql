alter table public.meeting_review_action_items
add column pic_role text;

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
      description, pic_name, pic_email, pic_role, due_date, due_time, priority,
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
      nullif(action ->> 'picRole', ''),
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
