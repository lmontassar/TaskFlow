"use client";

import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export function NotificationsHeader() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          </div>
          <p className="text-muted-foreground">
            Stay updated with project invites, mentions, and activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log("Mark all as read")}
          >
            Mark all as read
          </Button>
        </div>
      </div>
    </div>
  );
}
