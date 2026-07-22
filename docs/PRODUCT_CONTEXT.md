# Product Context

## Product Definition

Smart Meeting Workspace is a single-user, AI-assisted web application that helps a workspace owner convert meeting notes into reviewed, structured, and trackable meeting outcomes and action items.

## Project Context

This product is developed as a Digital Product Management internship project at XLSMART. The project applies an end-to-end DPM process covering problem definition, scope prioritization, PRD development, backlog management, technical preparation, testing, deployment, and iteration.

## Problem

Meeting outputs are often distributed across notes, documents, emails, chats, and transcripts. Important commitments may remain buried in long-form content, while action items, PICs, deadlines, decisions, blockers, and unresolved questions are tracked inconsistently.

## Primary User

The primary user is a workspace owner, typically a DPM, PM, Product Owner, BA, or project coordinator. The MVP has one authenticated workspace owner. PICs are lightweight contacts and do not have login accounts.

## Product Objective

1. Transform unstructured meeting notes into structured meeting outcomes and action items using AI.
2. Enable users to review, refine, and approve AI-generated meeting information before publication.
3. Centralize meeting records and action item tracking in one online workspace.
4. Improve visibility of action ownership, deadlines, priorities, and progress status.
5. Deliver a functional MVP that demonstrates the full DPM process from discovery to deployment.

## Core Flow

1. User registers or signs in.
2. User selects or creates an Active project.
3. User creates a meeting and enters meeting metadata.
4. User uploads supported documents, pastes meeting notes, or uses both.
5. The original source is stored and remains unchanged.
6. User opens Human Review.
7. User selects Process with AI or Continue Manually.
8. User reviews and edits summary, decisions, blockers, unresolved questions, and draft action items.
9. User selects Approve & Publish.
10. Approved meeting outcomes become official records.
11. Published action items are created with default status `To Do`.
12. User monitors actions through Action Items, Dashboard, and Reminders.

## Statuses

Project: `Active`, `Done`, `Archived`.

Meeting: `Draft`, `Processing`, `Completed`, `Failed`.

Action Item: `To Do`, `In Progress`, `Blocked`, `Done`.

`Overdue` is a deadline condition, not a workflow status.

## Deadline Categories

- Overdue
- Due Today
- Due Soon
- Due This Week
- Upcoming
- No Deadline

Done action items are excluded from active urgency calculations.

## P0 Scope

- Authentication and profile
- Project management
- Meeting metadata intake
- PDF, DOCX, TXT upload
- Paste meeting notes
- Original source storage
- Document parsing
- Gemini extraction
- Human review
- Manual fallback
- Approve and publish
- Meeting list and detail
- Action item CRUD
- Four-status action board
- Deadline and urgency rules
- Dashboard
- In-app reminders
- Project and status filtering
- Online deployment

## P1 Scope

- People or assignee directory
- Search across published records
- Filters by PIC, due date, record type, and priority
- Progress notes
- Drag-and-drop board
- AI confidence indicators
- Reprocessing with extraction history
- Richer notification center
- Mobile refinement
- User guide

## Out of MVP

- Multi-user collaboration
- PIC login accounts
- Email or WhatsApp reminders
- Jira integration
- Meeting-platform integrations
- Audio transcription
- Speaker detection
- OCR for scanned PDFs
- Advanced analytics
- Cross-meeting intelligence
- Native mobile application

## Key Business Rules

- Only Active projects may be used for new meetings.
- A meeting must have at least one valid source.
- Uploaded files and pasted text may be used together.
- Scanned or image-only PDFs are unsupported.
- AI output remains a draft until publication succeeds.
- Missing PIC uses `Unknown`.
- Missing deadline uses `Not Mentioned`.
- A date without time uses `Time Not Mentioned`.
- A published action starts as `To Do`.
- A meeting is `Processing` while any published action remains unfinished.
- A meeting with no action items is immediately `Completed`.
- A project may become `Done` only when no published action remains `To Do`, `In Progress`, or `Blocked`.
- Archived projects cannot be selected for a new meeting.
- Drafts do not affect Dashboard totals, Reminders, Search, or completion logic.
