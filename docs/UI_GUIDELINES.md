# UI Guidelines

The centralized visual contract is defined in `docs/DESIGN_SYSTEM.md`. Read it before implementing or revising any UI.

## Product UI Rules

- Prioritize laptop and tablet.
- Use Tailwind CSS and shared primitives under `src/components/ui`.
- Use semantic tokens from `src/app/globals.css`.
- Do not add repeated hardcoded hex colors in feature components.
- Use `PageContainer` and `PageHeader` for workspace routes.
- Every input has a visible label.
- Placeholders support labels and never replace them.
- Required fields show a clear indicator.
- Provide loading, empty, success, validation, and error states.
- Primary navigation: Dashboard, Projects, Meetings, Action Items, Reminders, People, and Settings.
- Original Meeting Notes remain visible in Human Review.
- AI-generated content must look editable, not final.
- Draft status must be obvious.
- Approve & Publish requires confirmation.
- Missing values use the approved labels.
- Publication failure preserves the draft.
- Do not introduce gradients, glassmorphism, neon colors, or playful consumer-app styling.
