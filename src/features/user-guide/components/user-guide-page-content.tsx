import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  actionStatuses,
  deadlineConditions,
  draftTerms,
  meetingStatuses,
  priorities,
  projectStatuses,
  troubleshootingItems,
} from "../content";
import { GuideSectionNavigation } from "./guide-section-navigation";
import { GuideSection, ModuleGuide, ReferenceGrid, WorkflowSteps } from "./guide-content-blocks";

export function UserGuidePageContent() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <GuideSectionNavigation />
      <div className="min-w-0 space-y-10">
        <GuideSection id="overview" title="Overview" description="Smart Meeting Workspace turns meeting notes into reviewed outcomes and trackable follow-up work.">
          <Card><CardContent className="space-y-4 pt-5 text-sm leading-6 text-muted-foreground">
            <p>It is designed for a workspace owner such as a DPM, PM, Product Owner, BA, or project coordinator. Use it to preserve meeting sources, organize decisions and blockers, and track responsibilities after review.</p>
            <Alert variant="info"><strong className="text-foreground">AI assists; you decide.</strong> Process with AI creates an editable draft from Original Meeting Notes. Human Review is required, and nothing becomes official until Approve & Publish succeeds.</Alert>
            <div className="grid gap-3 sm:grid-cols-2">
              <Definition title="Draft data" text="Editable Human Review content. It does not affect Meetings, Dashboard, Action Items, Reminders, People, or completion calculations." />
              <Definition title="Official data" text="Approved meeting outcomes and action items created after successful publication. Official records appear throughout the workspace." />
            </div>
          </CardContent></Card>
        </GuideSection>

        <Separator />
        <GuideSection id="quick-start" title="Quick Start" description="Use this checklist the first time you enter the workspace.">
          <Card><CardContent className="pt-5">
            <ul className="grid gap-3 sm:grid-cols-2">
              {["Sign in with your workspace account.", "Create an Active project.", "Add at least one meeting source.", "Review Original Meeting Notes.", "Choose AI or manual processing.", "Review, save, then publish only when ready."].map((item) => <li key={item} className="flex gap-3 text-sm leading-6"><span aria-hidden="true" className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-success-background text-success-foreground">✓</span><span>{item}</span></li>)}
            </ul>
            <p className="mt-5 text-sm text-muted-foreground">Workspace navigation provides Dashboard, Projects, Meetings, Action Items, Reminders, People, User Guide, and Settings. An Active project is required before a new meeting can be created.</p>
          </CardContent></Card>
        </GuideSection>

        <GuideSection id="main-workflow" title="Main Workflow" description="Follow these steps from initial project setup to official action tracking."><WorkflowSteps /></GuideSection>

        <Separator />
        <GuideSection id="dashboard" title="Dashboard" description="Use Dashboard as the official workspace overview.">
          <ModuleGuide purpose="Review project, meeting, action, reminder, and PIC workload information after records are published." steps={["Check Active projects and the supporting Done count.", "Review published meeting totals, including Processing and Completed.", "Check open actions, completed actions, unread reminders, and urgent deadlines.", "Open recent meetings, project activity, or PIC workload records for detail."]} rules={["Draft meetings and draft action items do not affect Dashboard totals.", "Urgent work contains up to five unfinished official actions.", "Recent meetings, project activity, and PIC workload each show up to five records."]} relatedHref="/dashboard" relatedLabel="Open Dashboard" />
        </GuideSection>

        <GuideSection id="projects" title="Projects" description="Projects organize meetings and official follow-up work.">
          <ModuleGuide purpose="Create a project before adding meetings, then manage its lifecycle from Project Detail." steps={["Create a project with a name and optional description.", "Open Project Detail to edit information or change lifecycle state.", "Mark it Done only after all official actions are finished.", "Reopen, archive, or restore it when its availability changes."]} rules={["New projects start Active.", "Only Active projects can be selected for new meetings and manual actions.", "Archived projects are unavailable until restored.", "Draft actions do not block project completion; unfinished official actions do."]} relatedHref="/projects" relatedLabel="Open Projects" />
        </GuideSection>

        <GuideSection id="meetings" title="Meetings" description="Capture sources, conduct Human Review, and preserve published meeting records.">
          <ModuleGuide purpose="Add meeting metadata and one or more readable sources, then continue to Human Review." steps={["Select an Active project and enter title, date, optional time, and at least one participant.", "Upload text-based PDF, DOCX, or TXT files, paste notes, or use both.", "Review the displayed source order and confirm the sensitive-data notice.", "Select Save & Continue to Review.", "After publication, use Meeting Detail to review approved outcomes, original sources, and official actions."]} rules={["The Meetings list shows published meetings only; unpublished drafts remain in Human Review.", "The page displays the current file-count, file-size, and pasted-text limits.", "Scanned, image-only, empty, unreadable, and password-protected files are unsupported.", "Original sources remain separate, ordered, and unchanged."]} relatedHref="/meetings/new" relatedLabel="Add Meeting Notes" />
        </GuideSection>

        <GuideSection id="human-review" title="Human Review" description="Human Review keeps the workspace owner in control before publication.">
          <ModuleGuide purpose="Check original sources, select a processing method, edit the draft, and publish only after the result is accurate." steps={["Expand or collapse each Original Meeting Notes source and verify its content.", "Select Process with AI or Continue Manually.", "Edit Meeting Summary, Decisions, Blockers, Unresolved Questions, and source references.", "Add, edit, or remove Draft Action Items.", "Save progress when needed, then use Approve & Publish after final review."]} rules={["AI output is an editable draft, never an automatic approval.", "Invalid AI output does not become valid draft content.", "Retry Extraction does not silently replace an existing saved draft.", "Original notes remain unchanged when processing, editing, saving, or publication fails.", "A stale draft must be reloaded before saving or publishing again."]} />
          <Card><CardHeader><CardTitle>Meeting Outcomes and Draft Action Items</CardTitle></CardHeader><CardContent className="grid gap-5 md:grid-cols-2">
            <Definition title="Meeting Outcomes" text="Edit the summary, decisions, blockers, unresolved questions, and optional source references. Empty outcome rows are omitted when saved." />
            <Definition title="Draft Action Items" text="Review project, source meeting, title, description, PIC name, PIC email, PIC role, deadline date and time, priority, clarification status, and source reference. Removing a row excludes it from publication after the draft is saved." />
          </CardContent></Card>
          <Alert variant="warning"><strong className="text-foreground">Approve carefully.</strong> When you approve and publish, the latest reviewed draft is validated and converted into official meeting outcomes and action items. New published actions start as To Do. If publication fails, the draft remains available.</Alert>
        </GuideSection>

        <GuideSection id="action-items" title="Action Items" description="Track official meeting follow-ups and manually created official work.">
          <ModuleGuide purpose="Use the four-column board to find, update, and complete official work." steps={["Create a manual action under an Active project when needed.", "Search by text or filter by project, status, and priority.", "Update status directly from a card.", "Open Edit details to change title, description, PIC, deadline, priority, or status.", "Delete an action only after reviewing the confirmation."]} rules={["The board contains official actions only.", "Meeting actions can link back to their source meeting; manual actions have no source meeting.", "Overdue is a deadline condition, not a workflow status.", "PICs are lightweight contacts and do not have workspace accounts."]} relatedHref="/action-items" relatedLabel="Open Action Items" />
        </GuideSection>

        <GuideSection id="reminders" title="Reminders" description="Focus on the most immediate deadlines for unfinished official actions.">
          <ModuleGuide purpose="Review unread, overdue, due-today, and due-soon reminders, then open the related official action." steps={["Check the summary for unread and urgency totals.", "Filter the inbox by All, Unread, Overdue, Due Today, or Due Soon.", "Select a reminder to read it and save its read state.", "Open the related action to update the work."]} rules={["Only official To Do, In Progress, and Blocked actions are included.", "Actions without deadlines and Done actions are excluded.", "Due Soon covers the next 1–3 workspace days.", "Calculations use the stored workspace timezone; the current Settings page does not provide a timezone control."]} relatedHref="/reminders" relatedLabel="Open Reminders" />
        </GuideSection>

        <GuideSection id="people" title="People" description="People provides a lightweight PIC directory based on official action ownership.">
          <ModuleGuide purpose="Review PIC workload and open PIC Detail for related workspace records." steps={["Publish an official action with a PIC to make that person available in the directory.", "Open a PIC to review contact information and open/completed action totals.", "Review related projects, published meetings, open actions, and completed actions.", "Edit lightweight PIC contact information when necessary."]} rules={["PICs do not receive application accounts.", "People normally appear only after published official actions include a PIC.", "Editing PIC information does not modify Original Meeting Notes."]} />
        </GuideSection>

        <GuideSection id="settings" title="Settings" description="Manage the authenticated workspace account.">
          <ModuleGuide purpose="Review and update the account currently connected to this workspace." steps={["Update full name and current position.", "Request an email-address change and complete the required verification.", "Change the password after verifying the current password.", "Sign out when finished."]} rules={["The current page does not provide a workspace-timezone control.", "Email changes remain pending until verification succeeds.", "Only implemented account actions are described here."]} relatedHref="/settings" relatedLabel="Open Settings" />
        </GuideSection>

        <Separator />
        <GuideSection id="status-reference" title="Statuses and Terms" description="Status, priority, deadline condition, clarification, and publication state describe different aspects of a record.">
          <div className="space-y-4"><ReferenceGrid title="Project statuses" items={projectStatuses} /><ReferenceGrid title="Meeting statuses" items={meetingStatuses} /><ReferenceGrid title="Action-item statuses" items={actionStatuses} /><ReferenceGrid title="Draft and missing-value labels" items={draftTerms} /><ReferenceGrid title="Priority" items={priorities} /></div>
        </GuideSection>

        <GuideSection id="deadline-reference" title="Deadline Conditions" description="Different views emphasize different deadline ranges. Every color treatment is paired with a text label in this guide.">
          <ReferenceGrid title="Deadline labels and meaning" items={deadlineConditions} />
          <Alert variant="info">Reminders focuses only on immediate urgency: Overdue, Due Today, and Due Soon. Action Items, Dashboard, and People also show broader future ranges. The stored workspace timezone affects Dashboard and Reminder calculations.</Alert>
        </GuideSection>

        <GuideSection id="troubleshooting" title="Troubleshooting" description="Use these safe recovery steps for common user-facing problems.">
          <div className="space-y-3">{troubleshootingItems.map((item) => <Card key={item.problem}><CardHeader><CardTitle>{item.problem}</CardTitle></CardHeader><CardContent className="grid gap-4 text-sm leading-6 sm:grid-cols-3"><Definition title="Why this may happen" text={item.reason} /><Definition title="What to do" text={item.recovery} /><Definition title="What remains safe" text={item.preserved} /></CardContent></Card>)}</div>
        </GuideSection>

        <GuideSection id="limitations" title="Product Limitations" description="Plan around these current product boundaries.">
          <Card><CardContent className="pt-5"><ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            <li>Scanned PDFs, image-only documents, OCR, audio/video transcription, and password-protected files are unsupported.</li>
            <li>The workspace is single-user. PICs are contacts, not collaborators with accounts.</li>
            <li>AI output may be unavailable or incomplete and always requires Human Review.</li>
            <li>Deadline labels are tailored to each view, so broader future ranges may use different wording outside Reminders.</li>
            <li>The stored workspace timezone affects calculations but cannot currently be changed in Settings.</li>
            <li>Draft data remains outside official modules until publication succeeds.</li>
          </ul></CardContent></Card>
        </GuideSection>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">Return here whenever a workspace label or workflow needs clarification.</p>
          <a href="#overview" className={buttonVariants({ variant: "outline", size: "sm" })}>Back to top</a>
        </div>
      </div>
    </div>
  );
}

function Definition({ title, text }: { title: string; text: string }) {
  return <div><h3 className="text-sm font-semibold text-foreground">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div>;
}
