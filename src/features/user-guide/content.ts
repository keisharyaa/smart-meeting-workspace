import type {
  GuideNavigationGroup,
  ReferenceItem,
  TroubleshootingItem,
  WorkflowStep,
} from "./types";

export const guideNavigation: GuideNavigationGroup[] = [
  {
    label: "Getting Started",
    items: [
      { id: "overview", label: "Overview" },
      { id: "quick-start", label: "Quick Start" },
      { id: "main-workflow", label: "Main Workflow" },
    ],
  },
  {
    label: "Workspace Modules",
    items: [
      { id: "dashboard", label: "Dashboard" },
      { id: "projects", label: "Projects" },
      { id: "meetings", label: "Meetings" },
      { id: "human-review", label: "Human Review" },
      { id: "action-items", label: "Action Items" },
      { id: "reminders", label: "Reminders" },
      { id: "people", label: "People" },
      { id: "settings", label: "Settings" },
    ],
  },
  {
    label: "Reference and Help",
    items: [
      { id: "status-reference", label: "Statuses and Terms" },
      { id: "deadline-reference", label: "Deadline Conditions" },
      { id: "troubleshooting", label: "Troubleshooting" },
      { id: "limitations", label: "Product Limitations" },
    ],
  },
];

export const workflowSteps: WorkflowStep[] = [
  { title: "Create an Active project", description: "Create, reopen, or restore a project so it can be selected for a new meeting.", href: "/projects/new", linkLabel: "Create a project" },
  { title: "Add meeting notes", description: "Select the project and enter the meeting title, date, optional time, and participants.", href: "/meetings/new", linkLabel: "Add meeting notes" },
  { title: "Upload or paste sources", description: "Add text-based PDF, DOCX, or TXT files, paste notes, or use both. Confirm the source order before continuing." },
  { title: "Open Human Review", description: "Check each Original Meeting Notes source. These sources remain separate and unchanged." },
  { title: "Choose a processing method", description: "Process with AI to generate an editable draft, or Continue Manually to begin with empty review sections." },
  { title: "Review meeting outcomes", description: "Edit the Meeting Summary, Decisions, Blockers, Unresolved Questions, and their source references." },
  { title: "Review Draft Action Items", description: "Verify titles, PIC details, deadlines, priorities, clarification status, and source references. Remove unsupported rows." },
  { title: "Save the draft", description: "Save progress without publishing it. Draft information remains outside official workspace totals and records." },
  { title: "Approve & Publish", description: "After confirmation, the latest reviewed draft is validated and converted into official meeting outcomes and action items." },
  { title: "Review Meeting Detail", description: "Open the published meeting record to see approved outcomes, original sources, and official actions." },
  { title: "Track Action Items", description: "Update official work through To Do, In Progress, Blocked, and Done.", href: "/action-items", linkLabel: "Open Action Items" },
  { title: "Monitor the workspace", description: "Use Dashboard for the overall picture and Reminders for immediate deadline attention.", href: "/dashboard", linkLabel: "Open Dashboard" },
];

export const projectStatuses: ReferenceItem[] = [
  { label: "Active", meaning: "Available for new meetings and manual action items.", tone: "success" },
  { label: "Done", meaning: "Project work is complete. It can be reopened.", detail: "A project cannot be marked Done while an official action is unfinished.", tone: "neutral" },
  { label: "Archived", meaning: "Removed from active use and unavailable for new meetings.", detail: "Restore it to return it to Active.", tone: "neutral" },
];

export const meetingStatuses: ReferenceItem[] = [
  { label: "Draft", meaning: "The meeting is still in intake or Human Review and is not an official meeting record.", tone: "neutral" },
  { label: "Processing", meaning: "The published meeting still has unfinished official action items.", tone: "warning" },
  { label: "Completed", meaning: "The published meeting has no unfinished official action items.", tone: "success" },
];

export const actionStatuses: ReferenceItem[] = [
  { label: "To Do", meaning: "Ready to start.", tone: "neutral" },
  { label: "In Progress", meaning: "Currently being worked on.", tone: "warning" },
  { label: "Blocked", meaning: "Cannot continue without resolution or support.", tone: "destructive" },
  { label: "Done", meaning: "Completed and excluded from active deadline reminders.", tone: "success" },
];

export const draftTerms: ReferenceItem[] = [
  { label: "Draft", meaning: "Editable and unofficial content." },
  { label: "AI Generated", meaning: "Draft content produced from Original Meeting Notes. Review is required.", tone: "info" },
  { label: "User Edited", meaning: "The current draft has changes that may need saving.", tone: "warning" },
  { label: "Needs Clarification", meaning: "An action contains material uncertainty that should be resolved before publication.", tone: "warning" },
  { label: "Unknown", meaning: "A PIC name is not available." },
  { label: "Not Mentioned", meaning: "The source or record does not provide the value." },
  { label: "Time Not Mentioned", meaning: "A date exists without a stated time." },
];

export const priorities: ReferenceItem[] = [
  { label: "Low", meaning: "Lower relative importance." },
  { label: "Medium", meaning: "Normal relative importance.", tone: "info" },
  { label: "High", meaning: "Higher relative importance.", tone: "warning" },
];

export const deadlineConditions: ReferenceItem[] = [
  { label: "Overdue", meaning: "The deadline has passed and the action is unfinished.", detail: "Shown with a critical dark-brown or destructive treatment depending on the view.", tone: "destructive" },
  { label: "Due Today", meaning: "The unfinished action is due on the current workspace day.", detail: "Reminders shows this as its own immediate category.", tone: "destructive" },
  { label: "Due Soon", meaning: "An immediate upcoming deadline.", detail: "Reminders includes the next 1–3 days; other views may group today or the next 2 days.", tone: "warning" },
  { label: "Upcoming", meaning: "A future deadline outside the immediate reminder window.", detail: "Dashboard, Action Items, and People use broader ranges such as 3–5 days or more than 5 days.", tone: "warning" },
  { label: "Not Mentioned", meaning: "No deadline was recorded.", detail: "These actions remain trackable but do not appear in Reminders.", tone: "info" },
  { label: "Done", meaning: "The action is completed.", detail: "Done is a workflow status, not a deadline condition, and is excluded from active urgency reminders.", tone: "success" },
];

export const troubleshootingItems: TroubleshootingItem[] = [
  { problem: "No Active project is available", reason: "Only Active projects can be selected for new meetings or manual actions.", recovery: "Create a project, reopen a Done project, or restore an Archived project.", preserved: "Existing projects and meeting records remain unchanged." },
  { problem: "A source file is rejected", reason: "The format may be unsupported, too large, empty, password-protected, scanned, or image-only.", recovery: "Use a text-based PDF, DOCX, or TXT within the displayed limit, or paste the notes.", preserved: "Other valid inputs remain on the intake page where possible." },
  { problem: "Original Meeting Notes cannot be opened", reason: "The meeting source could not be loaded.", recovery: "Reload Original Notes or return to Meetings and try again.", preserved: "The meeting draft is not changed by the failed load." },
  { problem: "AI processing fails", reason: "AI may be unavailable or may return content that cannot be validated.", recovery: "Retry Extraction or Continue Manually.", preserved: "Original notes and any valid saved draft remain unchanged." },
  { problem: "A draft cannot be saved", reason: "Validation, connection, or a newer saved version may block the save.", recovery: "Correct highlighted fields. If another session changed the draft, reload before saving again.", preserved: "Unsaved changes remain visible on the current page after a normal save failure." },
  { problem: "A meeting cannot be published", reason: "The draft may be invalid, stale, or publication may have failed.", recovery: "Review highlighted fields, reload after a version conflict, and try Approve & Publish again.", preserved: "The draft remains available; failed publication does not create a usable partial record." },
  { problem: "A project cannot be marked Done", reason: "At least one official action is still To Do, In Progress, or Blocked.", recovery: "Complete or remove the unfinished official work, then try again.", preserved: "The project remains Active." },
  { problem: "No reminders appear", reason: "Reminders only include official unfinished actions that are overdue, due today, or due within the next 3 days.", recovery: "Check the action status and deadline in Action Items.", preserved: "The action remains available even when it is outside the reminder window." },
  { problem: "No people appear", reason: "People are created from published official actions with a PIC.", recovery: "Publish or update an official action with a PIC name.", preserved: "PICs are contacts only and do not receive application accounts." },
  { problem: "The session has expired", reason: "The authenticated workspace session is no longer valid.", recovery: "Sign in again, then reopen the workspace module.", preserved: "Previously stored workspace records are unaffected." },
];
