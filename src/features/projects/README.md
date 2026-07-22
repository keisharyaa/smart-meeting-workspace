# Project Management

## Owner
Olyvia

## Business Rules
1. New projects start as `active`.
2. Only Active projects can be selected for new meetings.
3. A project can become Done only when no official unfinished action remains.
4. Draft action items never affect completion.
5. Archived projects cannot be used for new meetings.
6. Reopen changes Done to Active.
7. Restore changes Archived to Active.

## Acceptance Criteria
- Valid projects can be created.
- Empty names are rejected.
- Status filtering works.
- Projects with unfinished official actions cannot be completed.
- Completed projects can be reopened.
- Archived projects can be restored.
- Loading, empty, success, and error states exist.

## Do Not
- Query Supabase from presentational components.
- Add new project statuses.
- Modify pushed migrations.
