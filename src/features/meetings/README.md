# Meetings

## Owner

Keisha

## Core Rule

A meeting may contain multiple uploaded files and pasted text together. Never model or implement the flow as one meeting equals one source.

## Sprint 1: Meeting Notes Intake

Implemented flow:

1. User opens `/meetings` and selects **New Meeting**.
2. User selects one Active project.
3. User enters meeting title, date, optional time, and participant names.
4. User uploads zero or more supported files and/or pastes notes.
5. The browser uploads files directly to the private Supabase `meeting-files` bucket through signed upload URLs.
6. The server downloads and parses every uploaded source.
7. Every source is stored as a separate `meeting_sources` row with stable `source_order`.
8. The user is sent to `/meetings/[meetingId]/review`.
9. Human Review can display every preserved original source.

## Supported Sources

- text-based PDF
- DOCX
- TXT
- pasted text
- multiple files plus pasted text

Scanned PDFs, image-only PDFs, password-protected files, empty files, unsupported formats, and oversized files are rejected.

## Main Files

```text
src/app/(workspace)/meetings/page.tsx
src/app/(workspace)/meetings/new/page.tsx
src/app/(workspace)/meetings/[meetingId]/review/page.tsx
src/components/meetings/meeting-intake-form.tsx
src/features/meetings/actions.ts
src/features/meetings/parser.ts
src/features/meetings/queries.ts
src/features/meetings/repository.ts
src/features/meetings/review-queries.ts
src/features/meetings/rules.ts
src/features/meetings/service.ts
src/features/meetings/types.ts
src/config/upload.ts
```

## Persistence and Failure Handling

- Meeting drafts remain unpublished.
- Original uploaded files stay in the private bucket.
- Parsed text is saved in `meeting_sources.raw_text`.
- Pasted text is preserved unchanged after trimming outer whitespace.
- If parsing or persistence fails, uploaded objects and the incomplete meeting draft are cleaned up.
- The client keeps entered metadata, selected files, and pasted notes available for retry.
- Direct-to-Supabase signed uploads avoid sending large files through the Next.js/Vercel request body.

## Acceptance Criteria

- At least one valid source is required.
- PDF, DOCX, and TXT are supported.
- Multiple valid files are stored separately.
- Pasted text may be combined with uploaded files.
- Original files stay private.
- Source order is stable.
- Draft data is excluded from official modules.
- Human Review remains available when AI fails.
