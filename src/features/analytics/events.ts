import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

const analyticsEventNames = [
  "dashboard_viewed",
  "meeting_published",
  "action_status_updated",
  "reminder_opened",
  "project_mark_done_blocked",
] as const;

type AnalyticsEventName = (typeof analyticsEventNames)[number];

type AnalyticsMetadata = Record<string, Json | undefined>;

interface TrackEventInput {
  eventName: AnalyticsEventName;
  page: string;
  userId?: string | null;
  metadata?: AnalyticsMetadata;
}

const sensitiveMetadataKeys = [
  "password",
  "token",
  "secret",
  "key",
  "email",
  "notes",
  "raw",
  "transcript",
  "content",
];

export async function trackEvent({
  eventName,
  page,
  userId,
  metadata = {},
}: TrackEventInput) {
  try {
    if (!analyticsEventNames.includes(eventName)) {
      return;
    }

    const supabase = await createClient();
    const ownerId = userId ?? (await getCurrentUserId(supabase));

    if (!ownerId) {
      return;
    }

    const { error } = await supabase.from("analytics_events").insert({
      event_name: eventName,
      user_id: ownerId,
      page: sanitizePage(page),
      metadata: sanitizeMetadata(metadata),
    });

    if (error) {
      console.warn("Analytics event could not be saved:", error.message);
    }
  } catch (error) {
    console.warn("Analytics event could not be tracked:", error);
  }
}

async function getCurrentUserId(
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

function sanitizePage(page: string) {
  return page.trim().slice(0, 500) || "unknown";
}

function sanitizeMetadata(metadata: AnalyticsMetadata): Json {
  return sanitizeJson(metadata, 0) ?? {};
}

function sanitizeJson(value: Json | undefined, depth: number): Json | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.slice(0, 500);
  }

  if (depth >= 4) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, 20)
      .map((item) => sanitizeJson(item, depth + 1))
      .filter((item): item is Json => item !== undefined);
  }

  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 30)
      .filter(([key]) => !isSensitiveKey(key))
      .map(([key, item]) => [key, sanitizeJson(item, depth + 1)])
      .filter(([, item]) => item !== undefined),
  );
}

function isSensitiveKey(key: string) {
  const normalizedKey = key.toLowerCase();

  return sensitiveMetadataKeys.some((sensitiveKey) =>
    normalizedKey.includes(sensitiveKey),
  );
}
