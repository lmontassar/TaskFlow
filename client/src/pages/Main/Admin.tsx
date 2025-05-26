import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminTabs } from "@/components/admin/admin-tabs";

export default function AdminPage() {
  return (
    <>
      <AdminHeader />
      <AdminTabs />
    </>
  );
}
