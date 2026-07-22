# MVP Acceptance Criteria

This document translates the approved PRD into development-ready acceptance criteria for the Smart Meeting Workspace MVP.

## AC-01 Authentication and Workspace Access

### Scope

Registration, login, logout, protected routes, profile data, and first-login empty state.

### Acceptance Criteria

1. Given a user has no active session, when the website is opened, then the Login page is displayed.
2. Given valid registration data, when the user creates an account, then the account and profile are created without partial records.
3. Given valid credentials, when the user signs in, then the Dashboard opens.
4. Given invalid credentials, when sign-in is attempted, then access is rejected with a safe error message.
5. Given an unauthenticated user opens a protected route, when the request is evaluated, then the user is redirected to Login.
6. Given the user signs out, when logout succeeds, then protected workspace data is no longer accessible.
7. Given no official records exist, when the user enters the workspace for the first time, then useful empty states are displayed.

## AC-02 Project Management

### Scope

Create, edit, archive, restore, reopen, list, select, and complete projects.

### Acceptance Criteria

1. Given a valid project name, when the user saves a project, then it is created with status `Active`.
2. Given an empty project name, when the user submits the form, then creation is blocked and a field-level error is shown.
3. Given an Active project, when the user selects it, then it becomes available as meeting context.
4. Given a Done or Archived project, when the user creates a meeting, then that project cannot be selected.
5. Given no official action items remain unfinished, when the user confirms Mark as Done, then the project becomes `Done`.
6. Given an official action item remains `To Do`, `In Progress`, or `Blocked`, when completion is attempted, then the project remains `Active`.
7. Given a Done project, when Reopen succeeds, then the project becomes `Active`.
8. Given an Active or Done project, when Archive is confirmed, then the project becomes `Archived`.
9. Given an Archived project, when Restore succeeds, then the project becomes `Active`.
10. Archived projects are excluded from Active and Completed project counts.

## AC-03 Meeting Intake and Source Storage

### Scope

Meeting metadata, uploaded files, pasted notes, source validation, source preservation, and draft creation.

### Acceptance Criteria

1. Given the user selects New Meeting, when the form opens, then project, date, title, participants, upload, and paste-note inputs are available.
2. Given valid metadata and at least one valid source, when Save & Continue to Review is selected, then the meeting draft and original sources are saved.
3. Given no uploaded file and no pasted text, when the user continues, then the process is blocked.
4. Given a supported text-based PDF, DOCX, or TXT file, when upload and parsing succeed, then the original file is stored privately and readable text is saved.
5. Given multiple valid files, when the user continues, then each file is stored as a separate ordered meeting source.
6. Given valid files and pasted text are both provided, when the user continues, then all sources are used together.
7. Given an unsupported, empty, oversized, scanned, image-only, or password-protected file, when validation runs, then the file is rejected with a clear message.
8. Given a save or parsing failure, when the error occurs, then already entered metadata and valid sources are preserved for retry.
9. Original source content remains unchanged after review, publication, or action-item editing.

## AC-04 AI Extraction

### Scope

Gemini request, structured output, validation, normalization, failure handling, and retry.

### Acceptance Criteria

1. Given valid meeting source text, when Process with AI is selected, then the server sends the source and approved schema to Gemini.
2. Given Gemini returns valid structured output, when validation succeeds, then editable draft outcomes appear in Human Review.
3. Given Gemini returns invalid or incomplete JSON, when validation fails, then the response is not presented as a successful extraction.
4. Given AI processing fails, when the failure is shown, then Retry and Continue Manually remain available.
5. Given the source does not mention a PIC, deadline, time, or priority, when extraction completes, then the related value remains null.
6. Given the source includes a date without a time, when extraction completes, then the date is retained and time remains null.
7. Given AI processing runs, when it is not yet complete, then a clear loading state is shown.
8. Every extraction attempt records provider, model, status, timing, and sanitized failure information.
9. Gemini output never becomes official without human approval.

## AC-05 Human Review

### Scope

Original notes visibility, AI/manual method selection, editable outcomes, draft action items, and draft isolation.

### Acceptance Criteria

1. Given Human Review opens, when the page loads, then Original Meeting Notes are visible.
2. Given the user selects Process with AI, when processing succeeds, then draft fields are prefilled and editable.
3. Given the user selects Continue Manually, when the page updates, then the same review structure is shown with empty editable sections.
4. The user can add, edit, and remove decisions, blockers, unresolved questions, and draft action items.
5. Editing one draft action item does not modify another draft row.
6. Deleted draft items are excluded from publication.
7. Missing PIC displays `Unknown`.
8. Missing deadline displays `Not Mentioned`.
9. A date without a time displays `Time Not Mentioned`.
10. Draft data is excluded from Dashboard, Reminders, Search, official Action Items, and completion calculations.
11. A failed draft save preserves the last valid draft and in-progress input where feasible.
12. Review remains available when AI is unavailable.

## AC-06 Approve and Publish

### Scope

Validation, confirmation, atomic publication, official records, and redirect.

### Acceptance Criteria

1. Given the draft is valid, when Approve & Publish is selected, then a confirmation dialog is shown.
2. Given the user cancels confirmation, when the dialog closes, then no official data is created.
3. Given publication succeeds, when the transaction completes, then approved meeting outcomes and official action items are created together.
4. Every newly published action item receives status `To Do`.
5. Published action items remain linked to their project and source meeting.
6. Given publication fails, when the transaction rolls back, then no partial official records remain.
7. Given publication succeeds, when the process finishes, then the user is redirected to Meeting Detail.
8. Dashboard and other official modules use the new records only after publication succeeds.

## AC-07 Meeting Records and Lifecycle

### Scope

Meeting list, Meeting Detail, original source, approved outcomes, official actions, and meeting status.

### Acceptance Criteria

1. Published meetings appear in the meeting list with their latest status.
2. Meeting Detail displays project, title, date, participants, original sources, approved summary, decisions, blockers, unresolved questions, and official action items.
3. Given a published meeting has no action items, when publication succeeds, then its status becomes `Completed`.
4. Given a published meeting has an unfinished action item, when its state is evaluated, then its status is `Processing`.
5. Given the final unfinished action becomes `Done`, when the update succeeds, then the meeting becomes `Completed`.
6. Passing a deadline does not complete the meeting.
7. Unpublished drafts are not available as official Meeting Detail records.

## AC-08 Action Item Management

### Scope

Official action CRUD, four-status board, filters, source linkage, and deadline presentation.

### Acceptance Criteria

1. Only official action items are shown on the Action Items page.
2. Items are grouped into `To Do`, `In Progress`, `Blocked`, and `Done`.
3. Each item displays project, title, description, PIC, deadline, priority, status, and source meeting where available.
4. The user can create a manual action item.
5. The user can edit valid action-item fields without changing original meeting notes.
6. The user can delete an action item only after confirmation.
7. Given a valid status change, when saving succeeds, then the Action Items page and related meeting reflect the latest state.
8. Given project or status filters are applied, when results load, then only matching official items appear.
9. Given no records match the filters, when the query completes, then an empty state is shown.
10. Overdue is displayed as an urgency condition and never replaces the four workflow statuses.

## AC-09 Deadline and Reminder Rules

### Scope

Urgency calculation, reminder list, read state, and action navigation.

### Acceptance Criteria

1. Given an unfinished official action is past its deadline, when urgency is calculated, then it is `Overdue`.
2. Given an unfinished action is due on the current workspace date, then it is `Due Today`.
3. Given an unfinished action is due within three days, then it is `Due Soon`.
4. Given an unfinished action is due within seven days but outside Due Soon, then it is `Due This Week`.
5. Given an unfinished action is due later than seven days, then it is `Upcoming`.
6. Given no deadline exists, then urgency is `No Deadline`.
7. Done actions are excluded from active urgency and reminder lists.
8. Given a reminder is selected, when the linked action exists, then the official action opens.
9. Missing deadlines never produce reminders.
10. Urgency calculation uses the approved workspace timezone.

## AC-10 Dashboard and Data Consistency

### Scope

Official counts, recent meetings, nearest deadline, reminder count, and cross-module consistency.

### Acceptance Criteria

1. Dashboard displays Active and Done project counts.
2. Dashboard displays Processing and Completed meeting counts.
3. Dashboard displays open, due-this-week, overdue, and completed action-item counts.
4. Dashboard displays nearest deadline, unread reminder count, and recent meetings.
5. Draft and failed publication data do not affect official totals.
6. Given an official record changes, when affected pages reload or refresh, then Dashboard, Projects, Meetings, Action Items, and Reminders show the same latest state.
7. Given no official records exist, when Dashboard opens, then zero values and useful empty states are shown.
8. Given an aggregate query fails, when the page responds, then misleading totals are not displayed.

## AC-11 Search and People Directory

### Search, P1

1. Search includes published Projects, Meetings, and Action Items only.
2. Given a keyword is submitted, matching records are shown.
3. Filters may narrow results by record type, project, status, and date where available.
4. Selecting a result opens the relevant record.
5. Draft records never appear.

### People Directory, P1

1. The user can add, edit, and remove lightweight PIC records.
2. PIC records may contain name, email, team, and role.
3. A PIC record does not create an application account.
4. A selected PIC can be reused in action-item forms.

## AC-12 Account Settings

### Acceptance Criteria

1. Only the authenticated workspace owner can access Account Settings.
2. Full name, current position, and email are displayed from the current account.
3. Valid profile changes are saved with a success message.
4. Email changes follow the approved verification flow.
5. Password changes follow the approved verification flow.
6. Current password values are never displayed.
7. Failed verification or save does not replace existing account data.

## AC-13 General Quality and Security

1. Protected workspace data is unavailable without a valid session.
2. Each user-owned record is isolated through database policies.
3. Uploaded meeting files remain private.
4. Server-only keys are never exposed to browser code.
5. Most non-AI pages should become usable within three seconds under normal MVP usage.
6. AI operations display progress until completion or failure.
7. Main pages remain usable on laptop and tablet widths.
8. All user inputs have visible labels.
9. Required inputs have clear required-state indicators.
10. Every failed operation shows a clear message and next action.
11. Lint and production build pass before merge.
12. No feature is considered complete until its GitHub Issue acceptance criteria are met.
