# AI Coding Agent Instructions

Before making changes, read all files under `docs/`.

Mandatory rules:

- Do not invent requirements outside the approved context.
- Do not modify another module's shared contract without proposing the change first.
- Do not expose server-only credentials to the browser.
- Do not bypass human review for AI-generated content.
- Do not create unsupported PICs, deadlines, or times.
- Use Supabase migrations for database changes.
- Keep draft data separate from official published data.
- Preserve original meeting notes unchanged.
- Run lint and build before considering a task complete.
- Never commit or push automatically unless explicitly requested.

## Design System Rules

Before changing any UI, read:

- `docs/DESIGN_SYSTEM.md`
- `docs/UI_GUIDELINES.md`
- `src/app/globals.css`
- shared components under `src/components/ui`, `src/components/layout`, and `src/components/feedback`

Do not introduce new repeated colors, font families, radius scales, shadow scales, page-spacing conventions, or duplicate UI primitives without explicit approval. Feature pages must reuse the centralized design foundation.
