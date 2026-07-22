# Smart Meeting Workspace

Smart Meeting Workspace is a single-user, AI-assisted web application that converts uploaded or pasted meeting notes into reviewed, structured, and trackable action items.

## Core Flow

`Login → Select/Create Project → Add Meeting Notes → Process with AI or Continue Manually → Human Review → Approve & Publish → Track Action Items`

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase PostgreSQL
- Supabase Auth
- Supabase Storage
- Gemini API
- Vercel
- GitHub

## Getting Started

```bash
git clone <repository-url>
cd smart-meeting-workspace
git checkout develop
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Branching

- `main`: production-ready code
- `develop`: integration branch
- `feat/*`: feature development
- `fix/*`: bug fixes
- `docs/*`: documentation
- `chore/*`: configuration and maintenance

Direct push to `main` and `develop` is not allowed.

## Documentation

- [Product Context](docs/PRODUCT_CONTEXT.md)
- [MVP Acceptance Criteria](docs/MVP_ACCEPTANCE_CRITERIA.md)
- [Technical Context](docs/TECHNICAL_CONTEXT.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [AI Extraction Contract](docs/AI_EXTRACTION_CONTRACT.md)
- [Module Ownership](docs/MODULE_OWNERSHIP.md)
- [Development Workflow](docs/WORKFLOW.md)
- [UI Guidelines](docs/UI_GUIDELINES.md)
- [Decision Log](docs/DECISION_LOG.md)

## MVP Boundary

The MVP is a single-user workspace. PICs are lightweight contacts and do not have login accounts. AI output is always treated as a draft until the workspace owner reviews and publishes it.
