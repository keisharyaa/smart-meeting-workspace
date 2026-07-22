-- ============================================================
-- Smart Meeting Workspace
-- Private Storage bucket for meeting source files
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'meeting-files',
  'meeting-files',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Expected object path:
-- {user_id}/{meeting_id}/{unique_file_name}
--
-- Example:
-- 8b2.../4ca.../20260721-meeting-notes.pdf

create policy "Users can upload their own meeting files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'meeting-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can view their own meeting files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'meeting-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can update their own meeting files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'meeting-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
)
with check (
  bucket_id = 'meeting-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

create policy "Users can delete their own meeting files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'meeting-files'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);