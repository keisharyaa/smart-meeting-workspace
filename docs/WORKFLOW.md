# Development Workflow

## Source of Truth

Read all files under `docs/` before implementation. The latest approved PRD remains the product-level source of truth.

## Branch Model

- `main`: production-ready
- `develop`: integration
- `feat/*`: features
- `fix/*`: bugs
- `docs/*`: documentation
- `chore/*`: setup and maintenance
- `refactor/*`: internal improvements

Direct push to `main` and `develop` is prohibited.

## Start a Task

```bash
git checkout develop
git pull origin develop
git checkout -b feat/meeting-intake
```

## Issues

Every task needs a GitHub Issue with goal, scope, acceptance criteria, owner, shared-contract impact, and testing notes.

## Commits

```text
feat(auth): add email and password registration
feat(meetings): implement meeting source upload
feat(extraction): validate Gemini structured output
fix(actions): exclude done items from overdue calculation
docs(workflow): add pull request process
chore(config): initialize Supabase clients
```

## Pull Requests

Every PR targets `develop`, links the Issue using `Closes #`, describes testing, discloses database and shared-contract changes, passes lint and build, and is reviewed by the other developer.

## Database Workflow

Use Supabase migrations. Do not make undocumented production schema changes. Update `docs/DATABASE_SCHEMA.md` with every schema change.

## AI-Assisted Development

Before asking an AI agent to code, provide the Issue, require it to read repository context files, ask for a plan first, limit the scope, run lint and build, and review all diffs before commit.

Do not trust AI-generated RLS, auth, destructive migrations, publication transactions, file security, deadline calculations, or environment handling without manual review.

## Integration Order

1. shared layout and navigation
2. Supabase clients and env validation
3. database migration and RLS
4. authentication
5. project management
6. meeting intake and source storage
7. document parsing
8. AI extraction
9. Human Review
10. Approve and Publish
11. meeting records
12. action items
13. Dashboard
14. Reminders
15. Search and P1 enhancements

## Definition of Done

Acceptance criteria are met, error and empty states are handled, shared contracts remain consistent, migrations and docs are updated, lint passes, production build passes, manual testing is documented, and PR is reviewed and merged.
