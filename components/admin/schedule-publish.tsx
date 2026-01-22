"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

interface SchedulePublishProps {
  publishedAt?: Date | null;
  published: boolean;
  onPublishedAtChange: (date: Date | null) => void;
  onPublishedChange: (published: boolean) => void;
}

export function SchedulePublish({
  publishedAt,
  published,
  onPublishedAtChange,
  onPublishedChange,
}: SchedulePublishProps) {
  const [scheduleMode, setScheduleMode] = useState<"now" | "schedule" | "draft">(
    publishedAt && new Date(publishedAt) > new Date() ? "schedule" : published ? "now" : "draft"
  );
  
  const [scheduledDate, setScheduledDate] = useState(
    publishedAt ? new Date(publishedAt).toISOString().slice(0, 16) : ""
  );

  useEffect(() => {
    if (scheduleMode === "now") {
      onPublishedChange(true);
      onPublishedAtChange(new Date());
    } else if (scheduleMode === "schedule") {
      onPublishedChange(true);
      if (scheduledDate) {
        onPublishedAtChange(new Date(scheduledDate));
      }
    } else {
      onPublishedChange(false);
      onPublishedAtChange(null);
    }
  }, [scheduleMode, scheduledDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setScheduledDate(value);
    if (value) {
      onPublishedAtChange(new Date(value));
    }
  };

  const minDateTime = new Date().toISOString().slice(0, 16);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        Publishing Schedule
      </h3>

      <div className="space-y-3">
        {/* Publish Now */}
        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-white/10 hover:border-primary/30 transition-colors">
          <input
            type="radio"
            name="publishMode"
            checked={scheduleMode === "now"}
            onChange={() => setScheduleMode("now")}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-medium">Publish Now</div>
            <div className="text-sm text-muted-foreground">
              Make this content live immediately
            </div>
          </div>
        </label>

        {/* Schedule for Later */}
        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-white/10 hover:border-primary/30 transition-colors">
          <input
            type="radio"
            name="publishMode"
            checked={scheduleMode === "schedule"}
            onChange={() => setScheduleMode("schedule")}
            className="mt-1"
          />
          <div className="flex-1 space-y-2">
            <div className="font-medium">Schedule for Later</div>
            <div className="text-sm text-muted-foreground mb-2">
              Choose when this content should go live
            </div>
            {scheduleMode === "schedule" && (
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={handleDateChange}
                min={minDateTime}
                className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
              />
            )}
          </div>
        </label>

        {/* Save as Draft */}
        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-white/10 hover:border-primary/30 transition-colors">
          <input
            type="radio"
            name="publishMode"
            checked={scheduleMode === "draft"}
            onChange={() => setScheduleMode("draft")}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-medium">Save as Draft</div>
            <div className="text-sm text-muted-foreground">
              Keep this content unpublished
            </div>
          </div>
        </label>
      </div>

      {scheduleMode === "schedule" && scheduledDate && (
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
          <span className="font-medium text-blue-400">Scheduled for: </span>
          <span className="text-blue-300">
            {new Date(scheduledDate).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </div>
      )}
    </div>
  );
}
