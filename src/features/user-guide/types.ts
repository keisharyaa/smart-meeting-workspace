export interface GuideNavigationItem {
  id: string;
  label: string;
}

export interface GuideNavigationGroup {
  label: string;
  items: GuideNavigationItem[];
}

export interface WorkflowStep {
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}

export interface ReferenceItem {
  label: string;
  meaning: string;
  detail?: string;
  tone?: "neutral" | "info" | "warning" | "destructive" | "success";
}

export interface TroubleshootingItem {
  problem: string;
  reason: string;
  recovery: string;
  preserved: string;
}
