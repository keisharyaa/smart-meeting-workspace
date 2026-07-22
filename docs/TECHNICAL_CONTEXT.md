# Technical Context

## Final Stack

| Layer | Technology | Purpose |
|---|---|---|
| Web framework | Next.js App Router | Pages, layouts, server rendering, server actions, route handlers |
| Language | TypeScript | Type-safe application and domain contracts |
| Styling | Tailwind CSS | Responsive styling |
| UI components | shadcn/ui | Reusable application components |
| Database | Supabase PostgreSQL | Structured product data |
| Authentication | Supabase Auth | Registration, login, session, and identity |
| File storage | Supabase Storage | Private original meeting documents |
| AI | Gemini API | Structured extraction from meeting notes |
| Hosting | Vercel | Preview and production deployment |
| Source control | GitHub | Version control, issues, pull requests, deployment integration |

## Architecture Principles

- Cloud-first and online.
- One Next.js application handles presentation and server-side application logic.
- Browser code never receives server-only credentials.
- Supabase is the system of record.
- Gemini produces reviewable drafts only.
- Application rules calculate urgency and lifecycle states.
- Original sources remain unchanged.
- Database changes are versioned through migrations.

## Recommended Structure

```text
src/
├── app/
│   ├── (auth)/
│   ├── (workspace)/
│   └── api/
├── components/
├── features/
├── lib/
├── schemas/
├── types/
└── config/
```

## Client and Server Boundary

Browser-safe: UI components, form state, Supabase anon client, public environment variables.

Server-only: Gemini calls, service role key, file parsing, publication transaction, privileged database operations, AI validation, sensitive logging.

## File Processing

Supported: text-based PDF, DOCX, TXT, pasted text, multiple uploaded files, and uploaded files combined with pasted text.

Unsupported: scanned PDF, image-only file, password-protected file, audio or video transcription.

## Security

- Protect all workspace routes.
- Apply RLS to all user-owned tables.
- Store original files in a private bucket.
- Use storage paths scoped by authenticated user and meeting.
- Do not expose service role credentials.
- Use sanitized demo data.
- Reject unsupported files before AI processing.

## Deployment

- `main` deploys to Vercel Production.
- Pull requests receive Preview deployments.
- `develop` is the integration branch.
- Vercel environment variables are separate from local `.env.local`.
- Merge requires lint and production build.
