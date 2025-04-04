import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { NotificationsHeader } from "@/components/notifications/notifications-header";
import { NotificationsList } from "@/components/notifications/notifications-list";

export default function Notifications() {
  return (
    <>
      <NotificationsHeader />
      <NotificationsList />
    </>
  );
}
