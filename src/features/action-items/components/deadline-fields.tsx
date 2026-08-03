"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeadlineFieldsProps {
  dateId: string;
  timeId: string;
  defaultDate?: string | null;
  defaultTime?: string | null;
}

export function DeadlineFields({
  dateId,
  timeId,
  defaultDate,
  defaultTime,
}: DeadlineFieldsProps) {
  const [date, setDate] = useState(defaultDate ?? "");

  return (
    <div className="grid gap-3">
      <div>
        <Label htmlFor={dateId}>Deadline date</Label>
        <p className="text-helper mt-1">Leave blank when not mentioned.</p>
        <div className="mt-2">
          <Input
            id={dateId}
            name="dueDate"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="min-w-0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor={timeId}>Deadline time</Label>
        <p className="text-helper mt-1">
          {date ? "Leave blank when time is not mentioned." : "Add a date before adding a time."}
        </p>
        <div className="mt-2">
          <Input
            id={timeId}
            name="dueTime"
            type="time"
            defaultValue={defaultTime ?? ""}
            disabled={!date}
          />
        </div>
      </div>
    </div>
  );
}
