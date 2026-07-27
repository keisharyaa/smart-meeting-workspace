# M04 Meeting Notes Intake Delivery

## Implemented

- Meetings landing page with **New Meeting**
- Meeting metadata form
- Active-project-only selector
- Meeting date, optional time, title, and participant inputs
- Multiple PDF, DOCX, and TXT uploads
- Pasted meeting notes
- File and pasted-text combination
- Client-side source preview and stable source order
- Sensitive-data confirmation
- Signed direct uploads to private Supabase Storage
- Server-side PDF, DOCX, and TXT parsing
- Separate `meeting_sources` rows for every source
- Cleanup of incomplete drafts and uploaded files after failures
- Redirect to Human Review after successful persistence
- Human Review source preview for verifying preserved original notes

## New Runtime Dependencies

Run:

```powershell
npm install
```

The updated `package.json` adds:

- `mammoth` for DOCX text extraction
- `pdf-parse` for text-based PDF extraction

`package-lock.json` is intentionally not included in this selective delivery because dependencies could not be installed in the packaging environment. Running `npm install` locally will update it safely.

## Validation Commands

```powershell
npm install
npm run lint
npm run build
npm run dev -- --webpack
```

## Manual Test Scenarios

1. Create with pasted text only.
2. Create with one TXT file only.
3. Create with multiple PDF/DOCX/TXT files.
4. Create with files and pasted text together.
5. Submit without any source.
6. Select a Done or Archived project by manipulating the request.
7. Upload an unsupported file.
8. Upload an empty file.
9. Upload a scanned or image-only PDF.
10. Trigger a save failure and confirm entered values remain visible.
