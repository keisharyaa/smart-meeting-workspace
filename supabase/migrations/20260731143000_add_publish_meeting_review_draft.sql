create or replace function public.publish_meeting_review_draft(
  target_meeting_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_meeting public.meetings%rowtype;
  current_draft public.meeting_review_drafts%rowtype;
  draft_outcome public.meeting_review_outcomes%rowtype;
  draft_action public.meeting_review_action_items%rowtype;
  action_count integer;
begin
  select * into current_meeting
  from public.meetings
  where id = target_meeting_id
    and owner_id = auth.uid()
  for update;

  if not found then
    raise exception 'publish_meeting_not_found';
  end if;

  if current_meeting.is_published = true then
    raise exception 'publish_meeting_already_published';
  end if;

  select * into current_draft
  from public.meeting_review_drafts
  where meeting_id = target_meeting_id
    and owner_id = auth.uid()
  for update;

  if not found then
    raise exception 'publish_review_draft_not_found';
  end if;

  delete from public.meeting_outcomes
  where meeting_id = target_meeting_id
    and owner_id = auth.uid();

  delete from public.action_items
  where meeting_id = target_meeting_id
    and owner_id = auth.uid()
    and is_official = true;

  for draft_outcome in
    select *
    from public.meeting_review_outcomes
    where review_draft_id = current_draft.id
      and owner_id = auth.uid()
    order by outcome_type, display_order
  loop
    insert into public.meeting_outcomes (
      owner_id,
      meeting_id,
      outcome_type,
      content,
      source_reference,
      display_order
    ) values (
      auth.uid(),
      target_meeting_id,
      draft_outcome.outcome_type,
      draft_outcome.content,
      draft_outcome.source_reference,
      draft_outcome.display_order
    );
  end loop;

  action_count := 0;

  for draft_action in
    select *
    from public.meeting_review_action_items
    where review_draft_id = current_draft.id
      and owner_id = auth.uid()
    order by display_order
  loop
    action_count := action_count + 1;

    insert into public.action_items (
      owner_id,
      project_id,
      meeting_id,
      title,
      description,
      pic_name,
      due_date,
      due_time,
      priority,
      status,
      source_reference,
      is_official,
      published_at
    ) values (
      auth.uid(),
      draft_action.project_id,
      target_meeting_id,
      draft_action.title,
      draft_action.description,
      draft_action.pic_name,
      draft_action.due_date,
      draft_action.due_time,
      draft_action.priority,
      'todo',
      draft_action.source_reference,
      true,
      now()
    );
  end loop;

  update public.meetings
  set approved_summary = current_draft.summary,
      is_published = true,
      published_at = now(),
      status = case
        when action_count > 0 then 'processing'::public.meeting_status
        else 'completed'::public.meeting_status
      end
  where id = target_meeting_id
    and owner_id = auth.uid();

  return target_meeting_id;
end;
$$;

grant execute on function public.publish_meeting_review_draft(uuid) to authenticated;
