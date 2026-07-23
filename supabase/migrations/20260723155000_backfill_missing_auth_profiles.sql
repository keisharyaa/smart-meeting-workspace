-- Backfill profiles for Auth users created before the profile trigger existed.
-- New users continue to receive a profile through public.handle_new_user().

insert into public.profiles (
  id,
  full_name,
  current_position
)
select
  auth_user.id,
  nullif(trim(coalesce(auth_user.raw_user_meta_data ->> 'full_name', '')), ''),
  nullif(trim(coalesce(auth_user.raw_user_meta_data ->> 'current_position', '')), '')
from auth.users as auth_user
where not exists (
  select 1
  from public.profiles as profile
  where profile.id = auth_user.id
)
on conflict (id) do nothing;
