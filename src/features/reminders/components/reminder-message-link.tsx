"use client";

import type { MouseEvent, ReactNode } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { markReminderMessageReadAction } from "@/features/reminders/actions";

interface ReminderMessageLinkProps {
  actionItemId: string;
  children: ReactNode;
  className?: string;
  href: string;
}

export function ReminderMessageLink({
  actionItemId,
  children,
  className,
  href,
}: ReminderMessageLinkProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();

    startTransition(async () => {
      await markReminderMessageReadAction(actionItemId);
      router.push(href);
      router.refresh();
    });
  }

  return (
    <a className={className} href={href} onClick={handleClick}>
      {children}
    </a>
  );
}
