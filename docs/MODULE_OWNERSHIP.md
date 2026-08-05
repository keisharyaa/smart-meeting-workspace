# Module Ownership

## Keisha

Owns Authentication and Workspace, Meeting Notes Intake, AI Extraction Engine, Human Review and Approval, Meeting Records and Traceability, and Deployment and Product Readiness.

Main deliverables:

- Login and registration
- Profile and protected routes
- Meeting intake
- File upload and parsing
- Paste-text input
- Gemini integration
- AI output contract
- Manual processing fallback
- Human Review page
- Approve and Publish flow
- Meeting list and Meeting Detail
- Original source preservation
- Repository, Supabase, Vercel, and environment setup

## Olivia

Owns Project Management, People or Assignee Directory, Action Item Management, Dashboard and Monitoring, Reminders and Notifications, and Search and Filtering.

Main deliverables:

- Project CRUD and lifecycle
- Lightweight PIC directory
- Published action item CRUD
- Four-status action board
- Deadline and urgency presentation
- Dashboard
- In-app reminders
- Search and filtering
- Project completion logic

## Shared Contracts

The following require agreement from both developers:

- `action_items` schema
- meeting publication state
- status enums
- deadline categories
- shared TypeScript types
- Supabase clients
- authentication session model
- navigation structure
- shared UI components
- RLS policies
- Approve and Publish transaction
- Dashboard aggregation rules

## User Guide

The User Guide is a shared, user-facing product reference. Its content is
versioned with the application and must reflect implemented behavior rather
than planned or unsupported features.

Changes to workspace navigation, user-facing workflows, terminology, statuses,
deadline conditions, missing-value labels, or publication behavior require a
User Guide review by the owner of the affected module. Changes that cross module
boundaries require agreement from both developers.
