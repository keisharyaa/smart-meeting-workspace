# Smart Meeting Workspace Design System

## 1. Purpose

This document defines the visual and interaction system for Smart Meeting Workspace.

The product is an internal productivity workspace for managing meeting notes, AI-assisted extraction, Human Review, action tracking, reminders, and project follow-up.

The design should feel:

- professional
- calm
- trustworthy
- operational
- easy to scan
- suitable for daily work
- consistent across modules

The interface should prioritize clarity over decoration.

The design must support the main workflow:

```text
Upload or Paste Meeting Notes
→ AI Extraction
→ Human Review
→ Approve and Publish
→ Action Tracking
```

AI output must always be presented as draft content that requires human review.

---

## 2. Design Principles

### 2.1 Clarity First

The user should quickly understand:

- what page they are on
- what action is expected
- what data is still draft
- what data is official
- what information needs correction
- what failed and how to recover

Avoid decorative elements that reduce readability.

### 2.2 Human Review Must Be Visible

AI-generated information must never appear as automatically trusted final output.

Use clear indicators such as:

- Draft
- AI Generated
- User Edited
- Needs Clarification
- Not Mentioned
- Time Not Mentioned
- Unknown

The interface must make it obvious that the user remains responsible for review.

### 2.3 Preserve Source Context

Original Meeting Notes must remain accessible throughout Human Review.

The original source must:

- remain unchanged
- remain clearly separated from editable draft content
- preserve source order
- preserve file or pasted-text labels
- support long content
- remain available when AI processing fails

### 2.4 Progressive Disclosure

Show the most important information first.

Use:

- page-level hierarchy
- section cards
- collapsible source panels
- dialogs for confirmation
- inline validation
- contextual helper text

Do not display every technical detail by default.

### 2.5 Safe Failure

Failure states must explain:

- what failed
- what remains safe
- what the user can do next

Examples:

- Retry
- Continue Manually
- Reload
- Return to Meetings
- Save Again

A failed operation must not visually imply that previous draft data was lost.

### 2.6 Draft and Official Data Must Feel Different

Draft content should be visually distinct from official records.

Use badges and supporting text instead of entirely different page layouts.

Examples:

```text
Draft
AI Generated
Not Published
```

Official records may use:

```text
Published
Completed
To Do
In Progress
Blocked
Done
```

---

## 3. Technology and Component Foundation

The interface uses:

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Nova preset
- Base UI foundation
- Geist Sans
- Lucide icons
- semantic CSS variables from `src/app/globals.css`

Use existing shadcn components before creating custom primitives.

Preferred shared components:

- Button
- Card
- Badge
- Input
- Textarea
- Select
- Label
- Alert
- Dialog
- Dropdown Menu
- Skeleton
- Separator
- Tooltip
- Checkbox
- Radio Group
- Tabs
- Collapsible
- Table

Do not create a second design system inside a feature module.

---

## 4. Color System

All colors must use semantic design tokens from `globals.css`.

Do not hardcode repeated hex values inside components.

### 4.1 Core Tokens

```css
--background
--foreground

--card
--card-foreground

--popover
--popover-foreground

--primary
--primary-hover
--primary-foreground

--secondary
--secondary-foreground

--accent
--accent-foreground

--muted
--muted-foreground
--subtle-foreground

--border
--input
--ring
```

### 4.2 Semantic State Tokens

```css
--success
--success-background
--success-foreground

--warning
--warning-background
--warning-foreground

--destructive
--destructive-hover
--destructive-background
--destructive-foreground

--info
--info-background
--info-foreground
```

### 4.3 Color Usage Rules

#### Primary

Use for:

- main call-to-action buttons
- selected navigation state
- active controls
- key interactive highlights
- processing method selection

Examples:

```text
Process with AI
Save Draft
Approve & Publish
Add Meeting Notes
```

Primary buttons must use:

```text
bg-primary
text-primary-foreground
hover:bg-primary-hover
```

#### Secondary

Use for:

- low-emphasis actions
- neutral selected states
- supporting panels
- non-destructive alternatives

Examples:

```text
Continue Manually
Back to Meetings
Cancel
Collapse Notes
```

#### Success

Use for:

- successful draft save
- completed publication
- valid extraction
- completed action items

Do not use green for neutral information.

#### Warning

Use for:

- needs clarification
- incomplete information
- upcoming deadline
- unsaved changes
- potentially destructive replacement

#### Destructive

Use for:

- failed processing
- invalid input
- delete confirmation
- overdue states
- unrecoverable action warnings

#### Info

Use for:

- explanatory system messages
- AI usage context
- source information
- workflow guidance

---

## 5. Typography

The primary font is Geist Sans.

### 5.1 Type Hierarchy

#### Page heading

Use:

```css
.heading-page
```

Purpose:

- page title
- major module title

Examples:

```text
Meetings
Add Meeting Notes
Human Review
Action Items
```

#### Section heading

Use:

```css
.heading-section
```

Purpose:

- card title
- major page section
- editor group

Examples:

```text
Original Meeting Notes
Meeting Outcomes
Draft Action Items
```

#### Card heading

Use:

```css
.heading-card
```

Purpose:

- compact card header
- secondary information block

#### Body text

Use:

```css
.text-body
```

#### Caption text

Use:

```css
.text-caption
```

#### Helper text

Use:

```css
.text-helper
```

### 5.2 Typography Rules

- Use sentence case for headings.
- Avoid all caps except compact eyebrow labels.
- Avoid excessive bold text.
- Do not use more than three font-weight levels in one section.
- Use muted text for explanation, not for critical information.
- Keep labels concise and direct.

Good:

```text
Meeting information
Review the extracted outcomes before saving the draft.
```

Avoid:

```text
PLEASE COMPLETE THE FOLLOWING INFORMATION
```

---

## 6. Spacing and Layout

### 6.1 Workspace Layout

The desktop layout uses:

```text
Sidebar
+
Main workspace
```

The workspace grid uses:

```css
--sidebar-width
--header-height
--page-max-width
--page-padding-x
--page-padding-y
--section-gap
```

Pages should use a consistent structure:

```text
Workspace header
Page header
Page actions
Primary content
Secondary content
Feedback state
```

### 6.2 Recommended Page Structure

```tsx
<PageContainer>
  <PageHeader
    eyebrow="Meetings"
    title="Human Review"
    description="Review and edit the meeting outcomes before publication."
    actions={...}
  />

  <div className="space-y-6">
    <OriginalNotesPanel />
    <ProcessingMethodSection />
    <ReviewWorkspace />
  </div>
</PageContainer>
```

### 6.3 Width Rules

- Use full width for data-heavy workspaces.
- Use narrower widths for simple forms.
- Avoid very narrow cards for long meeting content.
- Textareas and tables must remain usable on laptop screens.
- Avoid horizontal overflow unless the content genuinely requires it.

### 6.4 Responsive Behavior

#### Desktop

- sidebar visible
- main content full workspace width
- optional two-column review layout
- tables may show all fields

#### Tablet

- sidebar may collapse
- review sections may stack
- action-item rows may become cards
- primary actions remain visible
- no clipped textareas

#### Mobile

Mobile is not the main MVP target, but the page must remain functional.

- stack all sections
- preserve source visibility
- use full-width buttons when needed
- convert dense tables to card-based rows
- avoid fixed-width controls

---

## 7. Surfaces and Cards

Use:

```css
.surface-card
```

for shared card styling when appropriate.

Standard card characteristics:

- one-pixel semantic border
- white or semantic card background
- medium radius
- subtle elevation
- clear internal spacing

Recommended structure:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Meeting outcomes</CardTitle>
    <CardDescription>
      Review and edit the extracted draft.
    </CardDescription>
  </CardHeader>

  <CardContent>
    ...
  </CardContent>
</Card>
```

Do not:

- add strong shadows
- use glassmorphism
- use gradients
- use decorative blur
- use floating cards without alignment
- put every small field inside a separate card

---

## 8. Buttons

### 8.1 Button Hierarchy

#### Primary button

Use for the main action on a page.

Examples:

```text
Process with AI
Save Draft
Approve & Publish
```

Only one primary action should dominate a section.

#### Secondary button

Use for alternative actions.

Examples:

```text
Continue Manually
Back to Meetings
Cancel
```

#### Outline button

Use for lower-priority navigation or utilities.

Examples:

```text
Retry
Expand Notes
Edit
```

#### Ghost button

Use for icon actions and compact row utilities.

Examples:

```text
Remove
More
Collapse
```

#### Destructive button

Use only for actions with clear irreversible impact.

Examples:

```text
Delete Draft Action
Remove Source
```

### 8.2 Button Rules

- Button text must describe the result.
- Avoid generic labels like `Submit`.
- Use loading text during async operations.
- Disable repeated submission during processing.
- Pair icon and label for important actions.
- Icon-only buttons require accessible labels.

Good:

```text
Save Draft
Retry Extraction
Continue Manually
```

Avoid:

```text
OK
Go
Submit
```

---

## 9. Forms and Input Fields

### 9.1 Labels

Every form field must have:

- visible label
- optional marker where relevant
- helper text when needed
- inline validation

Example:

```text
Meeting time
Optional. Leave blank when time is not mentioned.
```

### 9.2 Missing Values

Do not store display labels as literal data.

UI labels:

```text
Unknown
Not Mentioned
Time Not Mentioned
```

Stored values:

```text
null
```

Examples:

```text
PIC name = null
UI = Unknown
```

```text
dueDate = 2026-07-28
dueTime = null
UI = 28 Jul 2026, Time Not Mentioned
```

```text
dueDate = null
dueTime = null
UI = Not Mentioned
```

### 9.3 Textareas

Use textareas for:

- summary
- decisions
- blockers
- unresolved questions
- action descriptions
- source references

Requirements:

- minimum useful height
- vertical resize allowed where appropriate
- long content must not clip
- helper text remains visible
- errors appear below the field

### 9.4 Validation

Validation should be:

- local and immediate where possible
- repeated on server
- specific
- placed near the relevant field

Good:

```text
Action item title is required.
```

Avoid:

```text
Invalid input.
```

A failed save must preserve local user edits.

---

## 10. Badges and Statuses

Use Badge for compact state communication.

### 10.1 Draft Statuses

Recommended:

```text
Draft
AI Generated
User Edited
Manual
Needs Clarification
```

### 10.2 Missing-Value Statuses

Recommended:

```text
Unknown
Not Mentioned
Time Not Mentioned
```

Use neutral or warning variants depending on context.

### 10.3 Official Action Statuses

Use:

```text
To Do
In Progress
Blocked
Done
```

### 10.4 Urgency Statuses

Use:

```text
Overdue
Due Today
Due Soon
Due This Week
```

Urgency is application-derived, not AI-generated.

---

## 11. Icons

Use Lucide icons.

Common mappings:

```text
Dashboard → LayoutDashboard
Projects → Folder
Meetings → CalendarDays or NotebookTabs
Action Items → SquareCheckBig
Reminders → Bell
People → Users
Settings → Settings
AI Processing → Sparkles
Manual Processing → PencilLine
Retry → RotateCcw
Save → Save
Edit → Pencil
Remove → Trash2
Expand → ChevronDown
Collapse → ChevronUp
Source File → FileText
Pasted Text → ClipboardPaste
Warning → TriangleAlert
Success → CircleCheck
Error → CircleX
```

Rules:

- Do not mix icon libraries.
- Use consistent icon size.
- Important actions should include labels.
- Icon-only controls require tooltips and accessible labels.

---

## 12. Feedback States

Every asynchronous feature must support:

```text
Idle
Loading
Success
Error
Empty
Disabled
```

### 12.1 Loading

Use:

- button spinner
- skeleton
- disabled controls
- clear loading message

Examples:

```text
Processing meeting notes...
Saving draft...
Publishing meeting...
```

Do not show indefinite loading without explanation.

### 12.2 Error

Error messages must:

- explain what failed
- avoid exposing technical internals
- explain what remains safe
- provide a recovery action

Example:

```text
AI processing could not be completed. Your original notes and saved draft remain unchanged.
```

Actions:

```text
Retry
Continue Manually
```

### 12.3 Success

Use concise confirmation.

Examples:

```text
Draft saved.
Meeting published successfully.
```

Avoid large celebratory visuals for routine operations.

### 12.4 Empty State

Empty states should include:

- short explanation
- next action
- no unnecessary illustration

Example:

```text
No published meetings yet

Start by adding meeting notes. Draft meetings remain in Human Review until they are approved and published.
```

---

## 13. Human Review Workspace

Human Review is a core workspace and must follow a consistent information hierarchy.

### 13.1 Recommended Page Order

```text
Page header
Original Meeting Notes
Processing Method
Processing Status
Meeting Outcomes
Draft Action Items
Save Draft controls
```

Approve & Publish belongs to a later publication module and is not part of M05.

### 13.2 Original Meeting Notes Panel

Must include:

- source label
- source type
- source order
- raw text
- expand or collapse control
- retry state if loading fails

Each source must remain separate.

Example:

```text
Source 1
Sprint Planning Notes.pdf
PDF file

Source 2
Pasted meeting notes
Pasted text
```

Do not merge sources visually into one unlabelled block.

### 13.3 Processing Method Selection

Required options:

```text
Process with AI
Continue Manually
```

The selected method must be visible.

Recommended treatment:

- two action cards or buttons
- concise descriptions
- selected state
- loading state
- failure state

Example:

```text
Process with AI
Generate an editable draft from the original notes.

Continue Manually
Start with empty review sections and enter the outcomes yourself.
```

### 13.4 AI Processing Failure

Show:

- concise error
- Retry
- Continue Manually
- confirmation that original notes remain safe
- confirmation that existing valid draft remains safe

Failed AI output must never appear inside editable fields.

### 13.5 Review Outcome Sections

Required sections:

```text
Meeting Summary
Decisions
Blockers
Unresolved Questions
```

Use repeatable rows for:

- decisions
- blockers
- unresolved questions

Each row should support:

- content
- source reference
- add
- edit
- remove

### 13.6 Draft Action Items

Desktop may use a structured table.

Recommended columns:

```text
Project
Action Item
PIC
Deadline
Priority
Clarification
Action
```

Longer fields such as description and source reference may appear in:

- expanded row
- edit dialog
- side panel
- stacked row detail

Each draft action item supports:

- title
- description
- PIC name
- PIC email
- deadline date
- deadline time
- priority
- clarification status
- source reference
- edit
- remove

Editing one row must never affect another row.

---

## 14. Dialogs

Use dialogs for:

- delete confirmation
- replacing an existing AI draft
- discarding unsaved changes
- publication confirmation
- editing dense action-item details if inline editing becomes too crowded

Dialog structure:

```text
Title
Explanation
Impact
Primary action
Cancel action
```

Destructive action must be visually distinct.

Avoid using dialogs for simple navigation.

---

## 15. Tables

Use tables only when comparison across rows is important.

Rules:

- header remains clear
- dense fields may move into expanded rows
- action column remains compact
- long text must not force extreme horizontal width
- show empty state inside the table area
- include accessible labels

For tablet widths, action-item rows may switch to stacked cards.

---

## 16. Navigation

The sidebar contains:

```text
Dashboard
Projects
Meetings
Action Items
Reminders
People
Settings
```

Rules:

- current section uses sidebar accent styling
- icon and text remain aligned
- navigation labels remain stable
- do not rename modules without a product decision
- unfinished modules may display placeholder content, but navigation behavior must remain predictable

---

## 17. Accessibility

Minimum requirements:

- keyboard-accessible controls
- visible focus state
- semantic labels
- descriptive button text
- accessible icon buttons
- sufficient color contrast
- error messages associated with fields
- dialogs trap focus correctly
- loading state announced where appropriate
- badges do not rely on color alone
- textarea content remains readable at browser zoom

Do not remove focus outlines.

---

## 18. Content Style

Use direct, professional English.

Good:

```text
Review the extracted outcomes before saving the draft.
```

Avoid:

```text
Leverage the power of AI to revolutionize your productivity experience.
```

Use:

- short sentences
- action-based labels
- clear error explanations
- specific helper text

Avoid:

- marketing language
- generic AI language
- overly technical database wording
- unnecessary exclamation marks
- vague labels

---

## 19. AI-Specific UI Rules

AI must be framed as an assistant.

Use:

```text
AI-generated draft
Review required
Process with AI
Retry Extraction
```

Avoid:

```text
AI-approved
Verified by AI
Automatically completed
```

The UI must never imply that Gemini output is final, correct, or published.

AI-generated content should remain editable.

Where useful, show:

```text
Generated from Original Meeting Notes
```

Do not expose:

- raw prompts
- model internals
- API keys
- provider stack traces
- full technical errors
- confidential source text in logs

---

## 20. Draft and Publication Boundaries

M05 includes:

- AI extraction
- manual fallback
- editable Human Review
- draft outcomes
- draft action items
- save and reload draft

M05 does not include:

- Approve & Publish
- official meeting outcomes
- official action items
- publication confirmation
- Dashboard updates
- Reminder updates
- meeting completion updates
- project completion updates

The design must still prepare a clear future location for publication controls.

Do not add disabled or fake Approve & Publish controls during M05.

---

## 21. Component Composition Rules

Use feature components for domain behavior.

Recommended structure:

```text
src/components/meetings/
  original-notes-panel.tsx
  processing-method-selector.tsx
  human-review-workspace.tsx
  review-outcomes-editor.tsx
  draft-action-items-editor.tsx
  draft-action-item-row.tsx
```

Shared primitives remain under:

```text
src/components/ui/
```

Feature components may compose shared primitives but should not redefine them.

Do not put database logic inside UI components.

Use:

```text
Component
→ Server Action or Query
→ Service
→ Repository
→ Supabase
```

---

## 22. CSS Rules

Use semantic Tailwind utilities.

Preferred:

```tsx
className="bg-primary text-primary-foreground"
className="text-muted-foreground"
className="border-border"
className="bg-card text-card-foreground"
```

Avoid:

```tsx
className="bg-[#0f766e]"
className="text-[#111827]"
```

Hardcoded values are acceptable only for one-off layout calculations that cannot reasonably use tokens.

Do not:

- add feature-specific global CSS without justification
- override shadcn Button globally
- duplicate semantic tokens
- add gradients
- add glass effects
- add uncontrolled shadows
- add arbitrary colors for every status

---

## 23. Design Review Checklist

Before considering a page complete, verify:

### Hierarchy

- Is the page title clear?
- Is the primary action obvious?
- Are sections ordered logically?
- Is draft status visible?

### Interaction

- Are loading states visible?
- Are disabled states explained?
- Can the user recover from failure?
- Are destructive actions confirmed?
- Are repeated submissions prevented?

### Data Integrity

- Are original notes visibly separate from editable drafts?
- Are missing values shown without invented data?
- Are AI and manual paths visually consistent?
- Are drafts clearly unofficial?

### Responsiveness

- Does the page work on laptop?
- Does the page remain usable on tablet?
- Are long text areas readable?
- Does the action-item editor avoid clipping?

### Accessibility

- Are all controls keyboard accessible?
- Are icon buttons labelled?
- Is focus visible?
- Are errors associated with fields?
- Does color have supporting text?

### Consistency

- Are shared components reused?
- Are semantic tokens used?
- Are button variants consistent?
- Is wording aligned with product terminology?

---

## 24. Current Product Terminology

Use these labels consistently:

```text
Smart Meeting Workspace
Workspace Owner
Projects
Meetings
Action Items
Reminders
People
Settings
Original Meeting Notes
Process with AI
Continue Manually
Human Review
Meeting Summary
Decisions
Blockers
Unresolved Questions
Draft Action Items
Save Draft
Draft
AI Generated
User Edited
Needs Clarification
Unknown
Not Mentioned
Time Not Mentioned
To Do
In Progress
Blocked
Done
Approve & Publish
Meeting Detail
```

Do not introduce alternate names without a product decision.

Examples to avoid:

```text
AI Review Center
Tasks Hub
Meeting Intelligence Portal
Auto Approval
```

---

## 25. Final Design Direction

Smart Meeting Workspace should feel like a reliable internal operations product.

The design should communicate:

- original information is preserved
- AI output is assistive
- review is mandatory
- draft and official data are separate
- actions are trackable
- failures are recoverable
- the user remains in control
