# AI Extraction

## Owner
Keisha

## Rules
1. AI output is draft data.
2. Human approval is required before publication.
3. Missing values remain null.
4. AI must not invent PICs, deadlines, times, or priorities.
5. Invalid JSON is an extraction failure.
6. Manual review remains available when Gemini fails.
7. Every provider attempt is logged.

## M05 Implementation

- Sources are assembled in stable `source_order` with explicit boundaries.
- Gemini is called only from server code.
- Zod validates strict structured output before persistence.
- Empty nullable values normalize to `null`; dates never receive an invented time.
- First valid output initializes an isolated Human Review draft transactionally.
- Retry creates a new extraction run and stages replacement when a valid draft exists.
- Failed output never populates or deletes a valid draft.
- Manual fallback uses the same review-draft tables and editor.
