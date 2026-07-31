## M05 AI Extraction and Human Review Rules

The current task covers:

1. AI Extraction Engine
2. Human Review Draft Workspace

The current task does not cover:

- Approve & Publish
- creation of official meeting outcomes
- creation of official action items
- Dashboard or Reminder updates
- Meeting Detail publication lifecycle

### Source integrity

- Original meeting sources must remain unchanged.
- Sources must be combined using stable `source_order`.
- The AI must never modify stored original notes.
- Failed processing must not delete meeting sources.

### AI behavior

- Gemini is called from server-only code.
- Never expose `GEMINI_API_KEY` to the browser.
- AI output is always a draft.
- AI output must never publish automatically.
- Missing information must not be invented.
- A date without a time remains a date with `Time Not Mentioned`.
- No deadline becomes `Not Mentioned`.
- Unknown PIC remains `Unknown`.
- Every extracted claim and action must include a source reference where possible.

### Draft isolation

- Extraction drafts must not appear in official Action Items.
- Extraction drafts must not affect Dashboard totals.
- Extraction drafts must not affect Reminders.
- Extraction drafts must not affect meeting completion.
- Failed AI output must not be saved as valid draft content.
- Manual fallback starts from empty editable review sections unless a valid existing draft already exists.

### Architecture

Use:

Page or Component
→ Server Action or Query
→ Service
→ Repository
→ Supabase

Processing-specific layers may include:

- prompt builder
- Gemini client
- structured schema
- output validator
- normalizer

Do not query Supabase directly from presentational components.

### Git

- Base work on `develop`.
- Work only on `feat/ai-extraction-engine`.
- Never commit directly to `develop` or `main`.
- Do not commit or push automatically.
- Run `npm run lint` and `npm run build`.
- Report all changed files and package additions.
